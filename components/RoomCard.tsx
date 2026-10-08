import { ROOM_PRICES } from "@/lib/data";
import { STATUS_BORDER } from "@/lib/status";
import type { Booking, Room, RoomStatus } from "@/lib/types";
import { cn, formatVND } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

interface RoomCardProps {
  room: Room;
  status: RoomStatus;
  booking?: Booking;
  onClick: () => void;
}

export function RoomCard({ room, status, booking, onClick }: RoomCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group grid gap-2 rounded-xl border border-l-4 border-slate-200 bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30",
        STATUS_BORDER[status],
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl font-semibold tabular-nums text-slate-900">{room.number}</span>
        <StatusBadge status={status} />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{room.type}</span>
        {booking?.stayType === "hourly" ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20">
            ⏱️ {booking.hours ? `${booking.hours}h` : "Giờ"} {booking.checkInTime ? `· ${booking.checkInTime}` : ""}
          </span>
        ) : booking?.stayType === "overnight" ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-1.5 py-0.5 text-[11px] font-semibold text-violet-800 ring-1 ring-inset ring-violet-600/20">
            🌙 Qua đêm
          </span>
        ) : (
          <span>{formatVND(ROOM_PRICES[room.type])}</span>
        )}
      </div>
      <p className="min-h-[1.25rem] truncate text-sm font-medium text-slate-700">
        {booking ? booking.name : <span className="text-slate-300">—</span>}
      </p>
    </button>
  );
}
