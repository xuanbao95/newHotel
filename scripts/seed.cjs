const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const envContent = fs.readFileSync(".env.local", "utf8");
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\r\n]+)/);

const supabaseUrl = urlMatch ? urlMatch[1].trim() : "https://kuwxkhktqdznrleuzyej.supabase.co";
const serviceKey = keyMatch ? keyMatch[1].trim() : "sb_publishable_iwzz7ra1O5yWWN2FwVHC8w_dhnOIElj";

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
  realtime: {
    transport: class DummyWS {
      constructor() {}
      addEventListener() {}
      removeEventListener() {}
      close() {}
      send() {}
    },
  },
});

const ROOM_PRICES = {
  "Đơn": 300000,
  "Đôi": 450000,
  "Gia đình": 650000,
};

async function seed() {
  console.log("🌱 Bắt đầu seed dữ liệu vào Supabase...");

  // 1. Seed danh mục Dịch vụ
  console.log("-> Seeding Services...");
  const services = [
    { id: "water", name: "Nước", unitPrice: 15000, active: true },
    { id: "laundry", name: "Giặt ủi", unitPrice: 30000, active: true },
    { id: "motorbike", name: "Thuê xe máy", unitPrice: 120000, active: true },
    { id: "breakfast", name: "Ăn sáng", unitPrice: 40000, active: true },
  ];
  for (const s of services) {
    await supabase.from("Service").upsert(s);
  }

  // 2. Seed 12 Phòng
  console.log("-> Seeding 12 Rooms...");
  const floors = [1, 2, 3];
  const roomRows = floors.flatMap((floor) =>
    [1, 2, 3, 4].map((i) => {
      const roomNumber = floor * 100 + i;
      const type = [101, 102, 201, 202].includes(roomNumber)
        ? "Đơn"
        : [303, 304].includes(roomNumber)
          ? "Gia đình"
          : "Đôi";
      const status = roomNumber === 201 ? "CLEANING" : roomNumber === 304 ? "MAINTENANCE" : "AVAILABLE";
      return {
        roomNumber,
        name: `Phòng ${roomNumber}`,
        type,
        price: ROOM_PRICES[type],
        status,
      };
    })
  );

  for (const r of roomRows) {
    await supabase.from("Room").upsert(r, { onConflict: "roomNumber" });
  }

  // 3. Seed 6 Nhân viên
  console.log("-> Seeding Employees...");
  const staffList = [
    { fullName: "Nguyễn Thị Lan", username: "lan_manager", role: "ADMIN", phone: "0901 234 567" },
    { fullName: "Trần Văn Minh", username: "minh_reception", role: "STAFF", phone: "0912 345 678" },
    { fullName: "Lê Thu Hà", username: "ha_reception", role: "STAFF", phone: "0923 456 789" },
    { fullName: "Phạm Quốc Huy", username: "huy_reception", role: "STAFF", phone: "0934 567 890" },
    { fullName: "Võ Thị Mai", username: "mai_housekeeping", role: "STAFF", phone: "0945 678 901" },
    { fullName: "Đặng Văn Tú", username: "tu_security", role: "STAFF", phone: "0956 789 012" },
  ];

  for (const s of staffList) {
    await supabase.from("Employee").upsert(
      {
        fullName: s.fullName,
        username: s.username,
        passwordHash: "default_seed_hash",
        role: s.role,
        phone: s.phone,
        hotelId: "quynh-nhu-1",
        active: true,
      },
      { onConflict: "username" }
    );
  }

  // 4. Lấy danh sách ID phòng đã tạo
  const { data: dbRooms } = await supabase.from("Room").select("id, roomNumber, price");
  const roomMap = new Map((dbRooms || []).map((r) => [r.roomNumber, r]));

  // 5. Seed 6 Booking mẫu
  console.log("-> Seeding Sample Bookings...");
  const now = new Date();
  const d = (days) => {
    const target = new Date(now);
    target.setDate(now.getDate() + days);
    return target.toISOString().split("T")[0];
  };

  const sampleBookings = [
    { room: 101, name: "Hoàng Anh Tuấn", phone: "0967 111 222", cccd: "001089012345", checkIn: d(-1), checkOut: d(1), status: "CHECKED_IN", guests: 1, services: [{ id: "water", name: "Nước", price: 15000, qty: 2 }] },
    { room: 103, name: "Ngô Bảo Châu", phone: "0978 222 333", cccd: "001090023456", checkIn: d(-2), checkOut: d(0), status: "CHECKED_IN", guests: 2, services: [{ id: "breakfast", name: "Ăn sáng", price: 40000, qty: 2 }, { id: "laundry", name: "Giặt ủi", price: 30000, qty: 1 }] },
    { room: 104, name: "Lý Thanh Tâm", phone: "0989 333 444", cccd: "079091034567", checkIn: d(0), checkOut: d(2), status: "RESERVED", guests: 2, services: [] },
    { room: 203, name: "Bùi Minh Khang", phone: "0903 444 555", cccd: "031092045678", checkIn: d(-1), checkOut: d(3), status: "CHECKED_IN", guests: 2, services: [{ id: "motorbike", name: "Thuê xe máy", price: 120000, qty: 1 }] },
    { room: 301, name: "Đỗ Ngọc Ánh", phone: "0914 555 666", cccd: "048093056789", checkIn: d(-2), checkOut: d(1), status: "CHECKED_IN", guests: 2, services: [] },
    { room: 303, name: "Phan Văn Lợi", phone: "0925 666 777", cccd: "052094067890", checkIn: d(0), checkOut: d(2), status: "CHECKED_IN", guests: 4, services: [{ id: "breakfast", name: "Ăn sáng", price: 40000, qty: 4 }] },
  ];

  // Kiểm tra xem đã có booking chưa, nếu chưa có thì thêm
  const { data: existingBookings } = await supabase.from("Booking").select("id").limit(1);
  if (!existingBookings || existingBookings.length === 0) {
    for (let idx = 0; idx < sampleBookings.length; idx++) {
      const b = sampleBookings[idx];
      const room = roomMap.get(b.room);
      if (!room) continue;

      const customId = `DP${String(idx + 1).padStart(3, "0")}`;
      const note = JSON.stringify({
        customId,
        stayType: "daily",
        cccd: b.cccd,
        guests: b.guests,
      });

      const { data: createdBooking } = await supabase
        .from("Booking")
        .insert({
          roomId: room.id,
          guestName: b.name,
          guestPhone: b.phone,
          checkInAt: new Date(b.checkIn).toISOString(),
          checkOutAt: new Date(b.checkOut).toISOString(),
          actualCheckIn: b.status === "CHECKED_IN" ? new Date().toISOString() : null,
          roomPrice: room.price,
          totalPrice: room.price,
          status: b.status,
          note,
        })
        .select()
        .single();

      if (createdBooking && b.status === "CHECKED_IN") {
        await supabase.from("Room").update({ status: "OCCUPIED" }).eq("id", room.id);

        for (const s of b.services) {
          await supabase.from("BookingService").insert({
            bookingId: createdBooking.id,
            serviceId: s.id,
            serviceName: s.name,
            unitPrice: s.price,
            quantity: s.qty,
          });
        }
      }
    }
  }

  console.log("✅ Seed dữ liệu hoàn tất thành công!");
}

seed().catch(console.error);
