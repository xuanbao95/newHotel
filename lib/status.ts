import type { BookingStatus, RoomStatus } from "./types";

export type AnyStatus = RoomStatus | BookingStatus;

/** Màu chấm trạng thái (class Tailwind đầy đủ để không bị purge) */
export const STATUS_DOT: Record<AnyStatus, string> = {
  "Trống": "bg-emerald-500",
  "Có khách": "bg-rose-500",
  "Đang ở": "bg-rose-500",
  "Đã đặt": "bg-amber-500",
  "Đang dọn": "bg-sky-500",
  "Bảo trì": "bg-slate-500",
  "Đã trả": "bg-slate-300",
  "Đã huỷ": "bg-slate-300",
};

/** Viền trái của thẻ phòng */
export const STATUS_BORDER: Record<RoomStatus, string> = {
  "Trống": "border-l-emerald-500",
  "Có khách": "border-l-rose-500",
  "Đã đặt": "border-l-amber-500",
  "Đang dọn": "border-l-sky-500",
  "Bảo trì": "border-l-slate-500",
};

export const STATUS_PILL: Record<AnyStatus, string> = {
  "Trống": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "Có khách": "bg-rose-50 text-rose-700 ring-rose-600/20",
  "Đang ở": "bg-rose-50 text-rose-700 ring-rose-600/20",
  "Đã đặt": "bg-amber-50 text-amber-800 ring-amber-600/20",
  "Đang dọn": "bg-sky-50 text-sky-700 ring-sky-600/20",
  "Bảo trì": "bg-slate-100 text-slate-700 ring-slate-500/20",
  "Đã trả": "bg-slate-50 text-slate-500 ring-slate-400/20",
  "Đã huỷ": "bg-slate-50 text-slate-400 ring-slate-400/20 line-through",
};

export const ROOM_STATUSES: RoomStatus[] = ["Trống", "Có khách", "Đã đặt", "Đang dọn", "Bảo trì"];
