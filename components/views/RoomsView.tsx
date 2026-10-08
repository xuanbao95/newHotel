"use client";

import { useState, type ReactNode } from "react";
import { useHotel } from "@/context/HotelProvider";
import { FLOORS } from "@/lib/data";
import { activeBooking, roomStatus } from "@/lib/hotel";
import { ROOM_STATUSES } from "@/lib/status";
import type { RoomStatus, RoomType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PageHeader } from "../PageHeader";
import { RoomCard } from "../RoomCard";
import { RoomModal } from "../RoomModal";
import { StatusDot } from "../StatusBadge";

const TYPES: RoomType[] = ["Đơn", "Đôi", "Gia đình"];

export function RoomsView() {
  const { rooms, bookings } = useHotel();
  const [statusFilter, setStatusFilter] = useState<RoomStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<RoomType | "all">("all");
  const [floorFilter, setFloorFilter] = useState<number | "all">("all");
  const [openRoom, setOpenRoom] = useState<number | null>(null);

  const withStatus = rooms.map((r) => ({ room: r, status: roomStatus(r, bookings), booking: activeBooking(bookings, r.number) }));
  const visible = withStatus.filter(
    (x) =>
      (statusFilter === "all" || x.status === statusFilter) &&
      (typeFilter === "all" || x.room.type === typeFilter) &&
      (floorFilter === "all" || Math.floor(x.room.number / 100) === floorFilter),
  );
  const floors = FLOORS.filter((f) => floorFilter === "all" || f === floorFilter);

  return (
    <div className="grid gap-6">
      <PageHeader title="Sơ đồ phòng" description="Bấm vào phòng để xem khách, nhận hoặc trả phòng." />

      <div className="card grid gap-4 p-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo trạng thái">
          <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
            Tất cả <span className="text-slate-400">{rooms.length}</span>
          </FilterChip>
          {ROOM_STATUSES.map((s) => (
            <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}>
              <StatusDot status={s} />
              {s} <span className="text-slate-400">{withStatus.filter((x) => x.status === s).length}</span>
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="input w-auto"
            aria-label="Lọc theo tầng"
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
          >
            <option value="all">Tất cả tầng</option>
            {FLOORS.map((f) => (
              <option key={f} value={f}>
                Tầng {f}
              </option>
            ))}
          </select>
          <select
            className="input w-auto"
            aria-label="Lọc theo loại phòng"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as RoomType | "all")}
          >
            <option value="all">Tất cả loại phòng</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                Phòng {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="card p-10 text-center text-sm text-slate-400">Không có phòng phù hợp bộ lọc</p>
      ) : (
        floors.map((floor) => {
          const list = visible.filter((x) => Math.floor(x.room.number / 100) === floor);
          if (!list.length) return null;
          return (
            <section key={floor} className="grid gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tầng {floor}</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {list.map((x) => (
                  <RoomCard key={x.room.number} room={x.room} status={x.status} booking={x.booking} onClick={() => setOpenRoom(x.room.number)} />
                ))}
              </div>
            </section>
          );
        })
      )}

      <RoomModal roomNumber={openRoom} onClose={() => setOpenRoom(null)} />
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition",
        active ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
      )}
    >
      {children}
    </button>
  );
}
