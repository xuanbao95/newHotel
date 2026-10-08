import { NextResponse } from "next/server";
import { getServiceSupabase, verifyEmployeeSession } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    const { data: bookings, error } = await supabase
      .from("Booking")
      .select("*, Room(*), BookingService(*)")
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ bookings: bookings || [] });
  } catch (error) {
    console.error("GET /api/bookings failed:", error);
    return NextResponse.json({ message: "Không thể tải danh sách đặt phòng" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifyEmployeeSession();
    if (!session) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

    const body = await request.json();
    const supabase = getServiceSupabase();

    // 1. Tìm id của phòng theo roomNumber
    const { data: room, error: roomErr } = await supabase
      .from("Room")
      .select("id, roomNumber, price")
      .eq("roomNumber", body.room)
      .single();

    if (roomErr || !room) {
      return NextResponse.json({ message: "Phòng không tồn tại" }, { status: 400 });
    }

    const isCheckInNow = body.status === "Đang ở";
    const dbStatus = isCheckInNow ? "CHECKED_IN" : "RESERVED";

    // 2. Tạo bản ghi Booking
    const now = new Date().toISOString();
    const checkInAt = body.checkIn ? new Date(body.checkIn).toISOString() : now;
    const checkOutAt = body.checkOut ? new Date(body.checkOut).toISOString() : now;

    const notePayload = JSON.stringify({
      customId: body.id,
      stayType: body.stayType || "daily",
      hours: body.hours,
      checkInTime: body.checkInTime,
      checkOutTime: body.checkOutTime,
      cccd: body.cccd,
      guests: body.guests || 1,
    });

    const { data: newBooking, error: bookErr } = await supabase
      .from("Booking")
      .insert({
        roomId: room.id,
        guestName: body.name?.trim(),
        guestPhone: body.phone?.trim(),
        checkInAt,
        checkOutAt,
        actualCheckIn: isCheckInNow ? now : null,
        roomPrice: body.price || room.price || 0,
        totalPrice: body.price || room.price || 0,
        status: dbStatus,
        note: notePayload,
        performedById: session.id,
      })
      .select("*, Room(*), BookingService(*)")
      .single();

    if (bookErr) throw bookErr;

    // 3. Nếu là nhận phòng ngay (walk-in), đổi trạng thái phòng thành OCCUPIED
    if (isCheckInNow) {
      await supabase
        .from("Room")
        .update({ status: "OCCUPIED" })
        .eq("id", room.id);
    }

    return NextResponse.json({ booking: newBooking }, { status: 201 });
  } catch (error) {
    console.error("POST /api/bookings failed:", error);
    return NextResponse.json({ message: "Không thể tạo lượt đặt phòng" }, { status: 500 });
  }
}

