"use client";

import { useState } from "react";
import { useHotel } from "@/context/HotelProvider";
import { SERVICE_NAMES, SERVICE_PRICES } from "@/lib/data";
import { estimateTotal, groupServices } from "@/lib/hotel";
import type { Booking, ServiceName } from "@/lib/types";
import { formatDate, formatVND } from "@/lib/utils";
import { Button } from "./Button";
import { EmptyRow } from "./EmptyRow";

export function GuestTable({ guests, onCheckOut }: { guests: Booking[]; onCheckOut: (room: number) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="table-base">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col">Tên</th>
            <th scope="col">Phòng</th>
            <th scope="col">Ngày nhận</th>
            <th scope="col">Ngày trả</th>
            <th scope="col">Tạm tính</th>
            <th scope="col">Dịch vụ</th>
            <th scope="col">
              <span className="sr-only">Thao tác</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {guests.length === 0 && <EmptyRow colSpan={7} message="Chưa có khách đang ở" />}
          {guests.map((b) => (
            <GuestRow key={b.id} booking={b} onCheckOut={onCheckOut} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GuestRow({ booking, onCheckOut }: { booking: Booking; onCheckOut: (room: number) => void }) {
  const { rooms, addService } = useHotel();
  const [service, setService] = useState<ServiceName>(SERVICE_NAMES[0]);
  const used = groupServices(booking.services);

  return (
    <tr className="hover:bg-slate-50/60">
      <td>
        <p className="font-medium text-slate-900">{booking.name}</p>
        <p className="text-xs text-slate-500">
          {booking.guests} khách
          {booking.stayType === "hourly" && (
            <span className="ml-1 font-semibold text-amber-700">· ⏱️ {booking.hours ? `${booking.hours}h` : "Giờ"}</span>
          )}
          {used.length > 0 && " · " + used.map((s) => (s.count > 1 ? `${s.name} ×${s.count}` : s.name)).join(", ")}
        </p>
      </td>
      <td className="tabular-nums">{booking.room}</td>
      <td>
        {formatDate(booking.checkIn)}
        {booking.stayType === "hourly" && booking.checkInTime && (
          <span className="block text-[11px] text-slate-500">Vào: {booking.checkInTime}</span>
        )}
      </td>
      <td>
        {booking.stayType === "hourly" && booking.checkOutTime ? (
          <span className="font-medium text-slate-900">Hôm nay · {booking.checkOutTime}</span>
        ) : (
          formatDate(booking.checkOut)
        )}
      </td>
      <td className="font-semibold tabular-nums !text-slate-900">{formatVND(estimateTotal(booking, rooms))}</td>
      <td>
        <div className="flex items-center gap-2">
          <select
            className="input min-w-[11rem] !py-1.5"
            aria-label={`Dịch vụ cho ${booking.name}`}
            value={service}
            onChange={(e) => setService(e.target.value as ServiceName)}
          >
            {SERVICE_NAMES.map((s) => (
              <option key={s} value={s}>
                {s} · {formatVND(SERVICE_PRICES[s])}
              </option>
            ))}
          </select>
          <Button variant="secondary" size="sm" onClick={() => addService(booking.id, service)}>
            Thêm
          </Button>
        </div>
      </td>
      <td className="text-right">
        <Button size="sm" onClick={() => onCheckOut(booking.room)}>
          Check-out
        </Button>
      </td>
    </tr>
  );
}
