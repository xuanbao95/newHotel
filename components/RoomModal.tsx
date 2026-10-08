"use client";

import { useState } from "react";
import { useHotel } from "@/context/HotelProvider";
import { HOURLY_PRICES, ROOM_PRICES } from "@/lib/data";
import {
  activeBooking,
  buildInvoice,
  calculateHourlyPrice,
  calculateOvernightPrice,
  estimateTotal,
  roomStatus,
} from "@/lib/hotel";
import type { StayType } from "@/lib/types";
import { addDays, formatDate, formatVND } from "@/lib/utils";
import { Button } from "./Button";
import { Field } from "./Field";
import { InvoiceView } from "./InvoiceView";
import { Modal } from "./Modal";
import { StatusBadge } from "./StatusBadge";
import { StayTypeSelector } from "./StayTypeSelector";

interface RoomModalProps {
  roomNumber: number | null;
  /** Mở thẳng màn hình hoá đơn trả phòng */
  initialView?: "details" | "invoice";
  onClose: () => void;
}

export function RoomModal({ roomNumber, initialView = "details", onClose }: RoomModalProps) {
  return (
    <Modal open={roomNumber !== null} onClose={onClose}>
      {roomNumber !== null && (
        <RoomModalBody key={`${roomNumber}-${initialView}`} roomNumber={roomNumber} initialView={initialView} onClose={onClose} />
      )}
    </Modal>
  );
}

function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function calcCheckOutTime(checkInTime: string, hours: number) {
  const [h, m] = checkInTime.split(":").map(Number);
  const totalMinutes = (h || 0) * 60 + (m || 0) + hours * 60;
  const outH = Math.floor(totalMinutes / 60) % 24;
  const outM = totalMinutes % 60;
  return `${String(outH).padStart(2, "0")}:${String(outM).padStart(2, "0")}`;
}

function RoomModalBody({ roomNumber, initialView, onClose }: Required<RoomModalProps> & { roomNumber: number }) {
  const hotel = useHotel();
  const { rooms, bookings, today } = hotel;
  const [view, setView] = useState(initialView);
  const [error, setError] = useState("");
  const [stayType, setStayType] = useState<StayType>("hourly");
  const [hours, setHours] = useState<number>(2);
  const [checkInTime, setCheckInTime] = useState<string>(getCurrentTime);
  const [walkIn, setWalkIn] = useState({ name: "", phone: "", cccd: "", guests: 1, checkOut: addDays(1, today) });

  const room = rooms.find((r) => r.number === roomNumber);
  if (!room) return <p className="text-sm text-slate-500">Không tìm thấy phòng.</p>;

  const status = roomStatus(room, bookings);
  const booking = activeBooking(bookings, room.number);
  const price = ROOM_PRICES[room.type];
  const hourlyRule = HOURLY_PRICES[room.type];
  const showInvoice = view === "invoice" && booking?.status === "Đang ở";

  const expectedCheckOutTime = calcCheckOutTime(checkInTime, hours);

  const estimatedRoomCost =
    stayType === "hourly"
      ? calculateHourlyPrice(room.type, hours)
      : stayType === "overnight"
        ? calculateOvernightPrice(room.type)
        : ROOM_PRICES[room.type];

  const header = (
    <div className="pr-10">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        Phòng {room.type} · {formatVND(hourlyRule.firstHour)}/h đầu · {formatVND(price)}/đêm
      </p>
      <h3 className="mt-1 flex flex-wrap items-center gap-2 text-xl font-semibold text-slate-900">
        Phòng {room.number} <StatusBadge status={status} />
      </h3>
    </div>
  );

  if (showInvoice && booking) {
    const invoice = buildInvoice(booking, room, today);
    return (
      <div className="grid gap-5">
        {header}
        <InvoiceView booking={booking} invoice={invoice} today={today} />
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              hotel.checkOut(room.number);
              setView("details");
            }}
          >
            Xác nhận thanh toán
          </Button>
          <Button variant="secondary" onClick={() => setView("details")}>
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const handleCheckIn = () => {
    setError("");
    if (booking) {
      hotel.checkIn(room.number);
      return;
    }
    if (!walkIn.name.trim() || !walkIn.phone.trim()) {
      setError("Nhập tên và SĐT khách");
      return;
    }
    hotel.checkIn(room.number, {
      ...walkIn,
      stayType,
      hours: stayType === "hourly" ? hours : undefined,
      checkInTime: stayType === "hourly" ? checkInTime : undefined,
      checkOutTime: stayType === "hourly" ? expectedCheckOutTime : undefined,
    });
  };

  return (
    <div className="grid gap-5">
      {header}

      {booking ? (
        <dl className="grid grid-cols-[auto,1fr] gap-x-6 gap-y-2 rounded-xl bg-slate-50 p-4 text-sm">
          <dt className="text-slate-500">Mã</dt>
          <dd className="font-medium">{booking.id}</dd>
          <dt className="text-slate-500">Khách</dt>
          <dd>
            {booking.name} · {booking.guests} khách
          </dd>
          <dt className="text-slate-500">SĐT</dt>
          <dd>{booking.phone}</dd>
          <dt className="text-slate-500">CCCD</dt>
          <dd>{booking.cccd || "—"}</dd>
          <dt className="text-slate-500">Hình thức</dt>
          <dd className="font-semibold text-brand-700">
            {booking.stayType === "hourly"
              ? `⏱️ Theo giờ (${booking.hours ?? 1} tiếng)`
              : booking.stayType === "overnight"
                ? "🌙 Qua đêm"
                : "📅 Theo ngày / đêm"}
          </dd>
          <dt className="text-slate-500">Nhận</dt>
          <dd>
            {formatDate(booking.checkIn)} {booking.checkInTime ? `· ${booking.checkInTime}` : ""}
          </dd>
          <dt className="text-slate-500">Trả</dt>
          <dd>
            {booking.stayType === "hourly" && booking.checkOutTime
              ? `Hôm nay · ${booking.checkOutTime}`
              : formatDate(booking.checkOut)}
          </dd>
          <dt className="text-slate-500">Dịch vụ</dt>
          <dd>{booking.services.join(", ") || "Chưa có"}</dd>
          <dt className="text-slate-500">Tạm tính</dt>
          <dd className="font-semibold">{formatVND(estimateTotal(booking, rooms))}</dd>
        </dl>
      ) : status === "Trống" ? (
        <div className="grid gap-4">
          <StayTypeSelector value={stayType} onChange={setStayType} roomType={room.type} />

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Tên khách" className="sm:col-span-2">
              <input
                className="input"
                placeholder="Ví dụ: Nguyễn Văn A"
                value={walkIn.name}
                onChange={(e) => setWalkIn({ ...walkIn, name: e.target.value })}
              />
            </Field>
            <Field label="SĐT">
              <input
                className="input"
                type="tel"
                placeholder="09xx xxx xxx"
                value={walkIn.phone}
                onChange={(e) => setWalkIn({ ...walkIn, phone: e.target.value })}
              />
            </Field>
            <Field label="CCCD">
              <input
                className="input"
                placeholder="Số căn cước"
                value={walkIn.cccd}
                onChange={(e) => setWalkIn({ ...walkIn, cccd: e.target.value })}
              />
            </Field>
            <Field label="Số khách">
              <input
                className="input"
                type="number"
                min={1}
                value={walkIn.guests}
                onChange={(e) => setWalkIn({ ...walkIn, guests: Math.max(1, Number(e.target.value) || 1) })}
              />
            </Field>

            {stayType === "hourly" ? (
              <>
                <Field label="Giờ vào">
                  <input
                    className="input"
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                  />
                </Field>
                <Field label="Số giờ thuê" className="sm:col-span-2">
                  <div className="grid gap-2">
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setHours(h)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            hours === h
                              ? "bg-brand-600 text-white shadow-sm"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {h} giờ
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">
                      Dự kiến trả lúc <span className="font-semibold text-slate-800">{expectedCheckOutTime}</span> (Hôm nay)
                    </p>
                  </div>
                </Field>
              </>
            ) : stayType === "overnight" ? (
              <div className="sm:col-span-2 rounded-xl bg-violet-50 p-3 text-xs text-violet-800">
                🌙 Khung giờ qua đêm: từ <strong>22:00 hôm nay</strong> đến <strong>07:00 sáng mai</strong>.
              </div>
            ) : (
              <Field label="Ngày trả" className="sm:col-span-2">
                <input
                  className="input"
                  type="date"
                  min={addDays(1, today)}
                  value={walkIn.checkOut}
                  onChange={(e) => setWalkIn({ ...walkIn, checkOut: e.target.value })}
                />
              </Field>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">Tiền phòng dự kiến:</span>
            <span className="text-base font-bold text-slate-900">{formatVND(estimatedRoomCost)}</span>
          </div>
        </div>
      ) : (
        <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          {status === "Đang dọn" ? "Phòng đang được dọn, chưa nhận khách." : "Phòng đang bảo trì, tạm ngưng nhận khách."}
        </p>
      )}

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleCheckIn} disabled={!(status === "Trống" || status === "Đã đặt")}>
          Check-in
        </Button>
        <Button variant="secondary" onClick={() => setView("invoice")} disabled={status !== "Có khách"}>
          Check-out
        </Button>
        <Button variant="secondary" onClick={() => hotel.markCleaned(room.number)} disabled={status !== "Đang dọn"}>
          Dọn xong
        </Button>
        {status === "Bảo trì" && (
          <Button variant="secondary" onClick={() => hotel.setMaintenance(room.number, false)}>
            Hết bảo trì
          </Button>
        )}
        {status === "Trống" && (
          <Button variant="secondary" onClick={() => hotel.setMaintenance(room.number, true)}>
            Bảo trì
          </Button>
        )}
        <Button variant="ghost" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </div>
  );
}
