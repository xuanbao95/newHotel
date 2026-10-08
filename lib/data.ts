import type {
  Booking,
  HotelState,
  Room,
  RoomType,
  ServiceName,
  Shift,
  Staff,
  StaffRole,
  WeekDay,
  WeekSchedule,
} from "./types";
import { addDays } from "./utils";

/** Giá phòng mỗi đêm */
export const ROOM_PRICES: Record<RoomType, number> = {
  "Đơn": 300000,
  "Đôi": 450000,
  "Gia đình": 650000,
  
};

/** Giá phòng theo giờ (giờ đầu tiên và mỗi giờ tiếp theo) */
export const HOURLY_PRICES: Record<RoomType, { firstHour: number; nextHour: number }> = {
  "Đơn": { firstHour: 70000, nextHour: 20000 },
  "Đôi": { firstHour: 90000, nextHour: 30000 },
  "Gia đình": { firstHour: 130000, nextHour: 40000 },
};

/** Giá phòng qua đêm (22:00 - 07:00) */
export const OVERNIGHT_PRICES: Record<RoomType, number> = {
  "Đơn": 180000,
  "Đôi": 240000,
  "Gia đình": 350000,
};

/** Giá dịch vụ */
export const SERVICE_PRICES: Record<string, number> = {
  "Nước": 15000,
  "Giặt ủi": 30000,
  "Thuê xe máy": 120000,
  "Ăn sáng": 40000,
  "Bia lon": 12000,
};

export const SERVICE_NAMES = Object.keys(SERVICE_PRICES) as ServiceName[];

export const FLOORS = [1, 2, 3] as const;

export const WEEK_DAYS: WeekDay[] = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export const SHIFTS: Shift[] = ["Sáng", "Chiều", "Đêm"];

export const SHIFT_HOURS: Record<Shift, string> = {
  "Sáng": "6h–14h",
  "Chiều": "14h–22h",
  "Đêm": "22h–6h",
};

export const STAFF_ROLES: StaffRole[] = ["Lễ tân", "Quản lý", "Buồng phòng", "Bảo vệ", "Kỹ thuật"];

/** 12 phòng 101–304: phòng đơn 101, 102, 201, 202; gia đình 303, 304; còn lại phòng đôi */
export function createRooms(): Room[] {
  return FLOORS.flatMap((floor) =>
    [1, 2, 3, 4].map((i) => {
      const number = floor * 100 + i;
      const type: RoomType = [101, 102, 201, 202].includes(number)
        ? "Đơn"
        : [303, 304].includes(number)
          ? "Gia đình"
          : "Đôi";
      const flag = number === 201 ? "Đang dọn" : number === 304 ? "Bảo trì" : "";
      return { number, type, flag } satisfies Room;
    }),
  );
}

/** Đặt phòng mẫu, ngày tính tương đối so với hôm nay */
export function createBookings(today: string): Booking[] {
  const d = (n: number) => addDays(n, today);
  const rows: Omit<Booking, "id">[] = [
    { room: 101, name: "Hoàng Anh Tuấn", phone: "0967 111 222", cccd: "001089012345", checkIn: d(-1), checkOut: d(1), status: "Đang ở", guests: 1, services: ["Nước", "Nước"] },
    { room: 103, name: "Ngô Bảo Châu", phone: "0978 222 333", cccd: "001090023456", checkIn: d(-2), checkOut: d(0), status: "Đang ở", guests: 2, services: ["Ăn sáng", "Ăn sáng", "Giặt ủi"] },
    { room: 104, name: "Lý Thanh Tâm", phone: "0989 333 444", cccd: "079091034567", checkIn: d(0), checkOut: d(2), status: "Đã đặt", guests: 2, services: [] },
    { room: 203, name: "Bùi Minh Khang", phone: "0903 444 555", cccd: "031092045678", checkIn: d(-1), checkOut: d(3), status: "Đang ở", guests: 2, services: ["Thuê xe máy"] },
    { room: 301, name: "Đỗ Ngọc Ánh", phone: "0914 555 666", cccd: "048093056789", checkIn: d(-2), checkOut: d(1), status: "Đang ở", guests: 2, services: [] },
    { room: 303, name: "Phan Văn Lợi", phone: "0925 666 777", cccd: "052094067890", checkIn: d(0), checkOut: d(2), status: "Đang ở", guests: 4, services: ["Ăn sáng", "Ăn sáng", "Ăn sáng", "Ăn sáng"] },
  ];
  return rows.map((b, i) => ({ ...b, id: `DP${String(i + 1).padStart(3, "0")}` }));
}

export function createStaff(): Staff[] {
  const rows: [string, StaffRole, string, Shift][] = [
    ["Nguyễn Thị Lan", "Quản lý", "0901 234 567", "Sáng"],
    ["Trần Văn Minh", "Lễ tân", "0912 345 678", "Sáng"],
    ["Lê Thu Hà", "Lễ tân", "0923 456 789", "Chiều"],
    ["Phạm Quốc Huy", "Lễ tân", "0934 567 890", "Đêm"],
    ["Võ Thị Mai", "Buồng phòng", "0945 678 901", "Sáng"],
    ["Đặng Văn Tú", "Bảo vệ", "0956 789 012", "Đêm"],
  ];
  return rows.map(([name, role, phone, shift], i) => ({ id: i + 1, name, role, phone, shift }));
}

/** Lịch ca mặc định: xoay vòng nhân viên cùng ca (trừ Quản lý) theo ngày */
export function createSchedule(staff: Staff[]): WeekSchedule {
  return WEEK_DAYS.map((_, day) =>
    SHIFTS.map((shift) => {
      const pool = staff.filter((s) => s.shift === shift && s.role !== "Quản lý");
      return pool.length ? pool[day % pool.length].id : null;
    }),
  );
}

export function createInitialState(today: string): HotelState {
  const staff = createStaff();
  return {
    rooms: createRooms(),
    bookings: createBookings(today),
    staff,
    schedule: createSchedule(staff),
  };
}
