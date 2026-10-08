"use client";

import Link from "next/link";
import { useHotel } from "@/context/HotelProvider";
import { roomStatus } from "@/lib/hotel";
import { ROOM_STATUSES, STATUS_DOT } from "@/lib/status";
import type { RoomStatus } from "@/lib/types";
import { EmptyRow } from "../EmptyRow";
import { PageHeader } from "../PageHeader";
import { Section } from "../Section";
import { StatCard } from "../StatCard";
import { StatusBadge, StatusDot } from "../StatusBadge";

export function OverviewView() {
  const { rooms, bookings, today } = useHotel();

  const count = (s: RoomStatus) => rooms.filter((r) => roomStatus(r, bookings) === s).length;
  const occupied = count("Có khách");
  const occupancy = rooms.length ? Math.round((occupied / rooms.length) * 100) : 0;

  const checkIns = bookings.filter((b) => b.checkIn === today && b.status !== "Đã huỷ");
  const checkOuts = bookings.filter((b) => (b.checkOut === today && b.status === "Đang ở") || b.paidOn === today);

  const rows = [
    ...checkIns.map((b) => ({ b, task: "Nhận phòng" })),
    ...checkOuts.map((b) => ({ b, task: "Trả phòng" })),
  ];

  return (
    <div className="grid gap-8">
      <PageHeader title="Tình hình hôm nay" description="Phòng, đặt phòng, khách đang ở và lịch ca nhân viên trên một trang." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Tổng phòng" value={rooms.length} accent="brand" />
        <StatCard label="Có khách" value={occupied} accent="rose" />
        <StatCard label="Trống" value={count("Trống")} accent="emerald" />
        <StatCard label="Đang dọn" value={count("Đang dọn")} accent="sky" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Công suất" value={`${occupancy}%`} hint={`${occupied}/${rooms.length} phòng có khách`} accent="amber" />
        <StatCard label="Check-in hôm nay" value={checkIns.length} accent="emerald" />
        <StatCard label="Check-out hôm nay" value={checkOuts.length} accent="slate" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Nhận và trả phòng hôm nay" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col">Khách</th>
                  <th scope="col">Phòng</th>
                  <th scope="col">Việc</th>
                  <th scope="col">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 && <EmptyRow colSpan={4} message="Hôm nay không có lượt nhận hay trả phòng" />}
                {rows.map(({ b, task }) => (
                  <tr key={`${b.id}-${task}`}>
                    <td className="font-medium !text-slate-900">{b.name}</td>
                    <td className="tabular-nums">{b.room}</td>
                    <td>{task}</td>
                    <td>
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Trạng thái phòng" actions={<Link href="/phong" className="text-sm font-medium text-brand-600 hover:text-brand-700">Xem sơ đồ →</Link>}>
          <ul className="grid gap-3 p-5">
            {ROOM_STATUSES.map((s) => {
              const n = count(s);
              return (
                <li key={s} className="grid gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600">
                      <StatusDot status={s} />
                      {s}
                    </span>
                    <span className="font-medium tabular-nums">{n}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className={`block h-full rounded-full transition-all ${STATUS_DOT[s]}`}
                      style={{ width: rooms.length ? `${(n / rooms.length) * 100}%` : 0 }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Section>
      </div>
    </div>
  );
}
