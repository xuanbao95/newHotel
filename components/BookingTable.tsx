"use client";

import { useHotel } from "@/context/HotelProvider";
import type { Booking } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Button } from "./Button";
import { EmptyRow } from "./EmptyRow";
import { StatusBadge } from "./StatusBadge";

export function BookingTable({ bookings }: { bookings: Booking[] }) {
  const { cancelBooking } = useHotel();
  return (
    <div className="overflow-x-auto">
      <table className="table-base">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col">Mã</th>
            <th scope="col">Tên khách</th>
            <th scope="col">SĐT</th>
            <th scope="col">Phòng</th>
            <th scope="col">Ngày nhận</th>
            <th scope="col">Ngày trả</th>
            <th scope="col">Trạng thái</th>
            <th scope="col">
              <span className="sr-only">Thao tác</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {bookings.length === 0 && <EmptyRow colSpan={8} />}
          {bookings.map((b) => (
            <tr key={b.id} className="hover:bg-slate-50/60">
              <td className="font-mono text-xs !text-slate-500">{b.id}</td>
              <td className="font-medium !text-slate-900">{b.name}</td>
              <td>{b.phone}</td>
              <td className="tabular-nums">{b.room}</td>
              <td>
                {formatDate(b.checkIn)}
                {b.stayType === "hourly" && b.checkInTime && (
                  <span className="block text-[11px] font-medium text-amber-700">⏱️ {b.checkInTime}</span>
                )}
              </td>
              <td>
                {b.stayType === "hourly" && b.checkOutTime ? (
                  <span className="text-xs font-medium text-slate-700">Trả {b.checkOutTime}</span>
                ) : (
                  formatDate(b.checkOut)
                )}
              </td>
              <td>
                <StatusBadge status={b.status} />
              </td>
              <td className="text-right">
                {b.status === "Đã đặt" && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => window.confirm(`Huỷ đặt phòng ${b.id}?`) && cancelBooking(b.id)}
                  >
                    Huỷ
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
