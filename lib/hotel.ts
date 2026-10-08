import { HOURLY_PRICES, OVERNIGHT_PRICES, ROOM_PRICES, SERVICE_PRICES } from "./data";
import type { Booking, Room, RoomStatus, RoomType, ServiceName, StayType } from "./types";
import { nightsBetween } from "./utils";

/** Tính tiền phòng theo giờ: giờ đầu + các giờ tiếp theo */
export function calculateHourlyPrice(roomType: RoomType, hours: number): number {
  const rule = HOURLY_PRICES[roomType] ?? { firstHour: 70000, nextHour: 20000 };
  const h = Math.max(1, Math.round(hours));
  return rule.firstHour + (h - 1) * rule.nextHour;
}

/** Giá qua đêm theo loại phòng */
export function calculateOvernightPrice(roomType: RoomType): number {
  return OVERNIGHT_PRICES[roomType] ?? 180000;
}

/** Đặt phòng đang hiệu lực (đang ở hoặc đã đặt) của một phòng */
export function activeBooking(bookings: Booking[], room: number): Booking | undefined {
  return bookings.find((b) => b.room === room && (b.status === "Đang ở" || b.status === "Đã đặt"));
}

export function roomStatus(room: Room, bookings: Booking[]): RoomStatus {
  if (room.flag) return room.flag;
  const b = activeBooking(bookings, room.number);
  if (!b) return "Trống";
  return b.status === "Đang ở" ? "Có khách" : "Đã đặt";
}

export function serviceTotal(services: ServiceName[]): number {
  return services.reduce((sum, s) => sum + (SERVICE_PRICES[s] ?? 0), 0);
}

/** Gom dịch vụ trùng: ["Nước","Nước"] -> [{name:"Nước", count:2, total:30000}] */
export function groupServices(services: ServiceName[]) {
  const map = new Map<ServiceName, number>();
  services.forEach((s) => map.set(s, (map.get(s) ?? 0) + 1));
  return Array.from(map, ([name, count]) => ({ name, count, total: count * (SERVICE_PRICES[name] ?? 0) }));
}

/** Tạm tính theo hình thức ở (giờ / qua đêm / đêm) + dịch vụ */
export function estimateTotal(booking: Booking, rooms: Room[]): number {
  const room = rooms.find((r) => r.number === booking.room);
  if (!room) return 0;

  let roomPrice = 0;
  if (booking.stayType === "hourly") {
    roomPrice = calculateHourlyPrice(room.type, booking.hours || 1);
  } else if (booking.stayType === "overnight") {
    roomPrice = calculateOvernightPrice(room.type);
  } else {
    roomPrice = nightsBetween(booking.checkIn, booking.checkOut) * ROOM_PRICES[room.type];
  }

  return roomPrice + serviceTotal(booking.services);
}

export interface Invoice {
  stayType: StayType;
  nights?: number;
  pricePerNight?: number;
  hours?: number;
  hourlyFirstPrice?: number;
  hourlyNextPrice?: number;
  overdueMinutes?: number;
  overtimePrice?: number;
  roomTotal: number;
  serviceTotal: number;
  total: number;
}

/** Hoá đơn khi trả phòng: tính linh hoạt theo giờ hoặc theo số đêm */
export function buildInvoice(booking: Booking, room: Room, today: string): Invoice {
  const svc = serviceTotal(booking.services);
  const stayType: StayType = booking.stayType || "daily";

  if (stayType === "hourly") {
    const hours = booking.hours || 1;
    const rule = HOURLY_PRICES[room.type] ?? { firstHour: 70000, nextHour: 20000 };
    const roomTotal = calculateHourlyPrice(room.type, hours);
    return {
      stayType: "hourly",
      hours,
      hourlyFirstPrice: rule.firstHour,
      hourlyNextPrice: rule.nextHour,
      roomTotal,
      serviceTotal: svc,
      total: roomTotal + svc,
    };
  }

  if (stayType === "overnight") {
    const roomTotal = calculateOvernightPrice(room.type);
    return {
      stayType: "overnight",
      roomTotal,
      serviceTotal: svc,
      total: roomTotal + svc,
    };
  }

  const nights = nightsBetween(booking.checkIn, today);
  const pricePerNight = ROOM_PRICES[room.type];
  const roomTotal = nights * pricePerNight;
  return {
    stayType: "daily",
    nights,
    pricePerNight,
    roomTotal,
    serviceTotal: svc,
    total: roomTotal + svc,
  };
}

export function nextBookingId(bookings: Booking[]): string {
  const max = bookings.reduce((m, b) => Math.max(m, Number(b.id.replace(/\D/g, "")) || 0), 0);
  return `DP${String(max + 1).padStart(3, "0")}`;
}
