/** Loại phòng */
export type RoomType = "Đơn" | "Đôi" | "Gia đình";

/** Cờ trạng thái gắn trực tiếp lên phòng (không phụ thuộc đặt phòng) */
export type RoomFlag = "" | "Đang dọn" | "Bảo trì";

/** Trạng thái hiển thị của phòng trên sơ đồ */
export type RoomStatus = "Trống" | "Có khách" | "Đã đặt" | "Đang dọn" | "Bảo trì";

export interface Room {
  /** Số phòng, ví dụ 101 */
  number: number;
  type: RoomType;
  flag: RoomFlag;
}

export type BookingStatus = "Đã đặt" | "Đang ở" | "Đã trả" | "Đã huỷ";

export type ServiceName = "Nước" | "Giặt ủi" | "Thuê xe máy" | "Ăn sáng" | "Bia lon" | (string & {});

/** Thông tin khách */
export interface Guest {
  name: string;
  phone: string;
  /** Số căn cước công dân */
  cccd: string;
  /** Số người ở */
  guests: number;
}

export type StayType = "hourly" | "daily" | "overnight";

export interface Booking extends Guest {
  /** Mã đặt phòng, ví dụ DP001 */
  id: string;
  room: number;
  /** Ngày nhận phòng, dạng YYYY-MM-DD */
  checkIn: string;
  /** Ngày trả phòng, dạng YYYY-MM-DD */
  checkOut: string;
  /** Hình thức thuê: theo giờ, theo ngày, qua đêm */
  stayType?: StayType;
  /** Giờ nhận phòng, dạng HH:mm (ví dụ 14:00) */
  checkInTime?: string;
  /** Giờ trả phòng dự kiến, dạng HH:mm */
  checkOutTime?: string;
  /** Số giờ thuê nếu là theo giờ */
  hours?: number;
  status: BookingStatus;
  services: ServiceName[];
  /** Ngày thanh toán (khi đã trả phòng), dạng YYYY-MM-DD */
  paidOn?: string;
}

export type Shift = "Sáng" | "Chiều" | "Đêm";

export type StaffRole = "Lễ tân" | "Quản lý" | "Buồng phòng" | "Bảo vệ" | "Kỹ thuật";

export interface Staff {
  id: number;
  name: string;
  role: StaffRole;
  phone: string;
  shift: Shift;
}

export type WeekDay = "T2" | "T3" | "T4" | "T5" | "T6" | "T7" | "CN";

/** Lịch ca tuần: schedule[ngày][ca] = id nhân viên hoặc null */
export type WeekSchedule = (number | null)[][];

export interface HotelState {
  rooms: Room[];
  bookings: Booking[];
  staff: Staff[];
  schedule: WeekSchedule;
}
