"use client";

import { useState, type FormEvent } from "react";
import { useHotel } from "@/context/HotelProvider";
import { HOURLY_PRICES, ROOM_PRICES } from "@/lib/data";
import { calculateHourlyPrice, calculateOvernightPrice, roomStatus } from "@/lib/hotel";
import type { StayType } from "@/lib/types";
import { addDays, formatVND, nightsBetween } from "@/lib/utils";
import { Button } from "./Button";
import { Field } from "./Field";
import { StayTypeSelector } from "./StayTypeSelector";

interface Message {
  kind: "ok" | "error";
  text: string;
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

export function BookingForm({ onCreated }: { onCreated?: () => void }) {
  const { rooms, bookings, today, createBooking } = useHotel();
  const [stayType, setStayType] = useState<StayType>("daily");
  const [hours, setHours] = useState<number>(2);
  const [checkInTime, setCheckInTime] = useState<string>(getCurrentTime);
  const blank = () => ({ name: "", phone: "", cccd: "", checkIn: today, checkOut: addDays(1, today), room: "" });
  const [form, setForm] = useState(blank);
  const [message, setMessage] = useState<Message | null>(null);

  // Chỉ hiện phòng đang trống
  const available = rooms.filter((r) => roomStatus(r, bookings) === "Trống");
  const selectedRoom = available.find((r) => String(r.number) === form.room) ?? available[0];

  const validDates = stayType === "hourly" || Boolean(form.checkIn && form.checkOut && form.checkOut > form.checkIn);
  const nights = validDates && stayType !== "hourly" ? nightsBetween(form.checkIn, form.checkOut) : 0;
  const expectedCheckOutTime = calcCheckOutTime(checkInTime, hours);

  const estimatedTotal = selectedRoom
    ? stayType === "hourly"
      ? calculateHourlyPrice(selectedRoom.type, hours)
      : stayType === "overnight"
        ? calculateOvernightPrice(selectedRoom.type)
        : nights * ROOM_PRICES[selectedRoom.type]
    : 0;

  const set = (key: keyof ReturnType<typeof blank>) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setMessage(null);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return setMessage({ kind: "error", text: "Không còn phòng trống" });
    if (!validDates) return setMessage({ kind: "error", text: "Ngày trả phải sau ngày nhận" });
    const b = createBooking({
      name: form.name,
      phone: form.phone,
      cccd: form.cccd,
      room: selectedRoom.number,
      checkIn: form.checkIn,
      checkOut: stayType === "hourly" ? form.checkIn : form.checkOut,
      stayType,
      hours: stayType === "hourly" ? hours : undefined,
      checkInTime: stayType === "hourly" ? checkInTime : undefined,
      checkOutTime: stayType === "hourly" ? expectedCheckOutTime : undefined,
    });
    setForm(blank());
    setMessage({
      kind: "ok",
      text: `Đã tạo ${b.id} · phòng ${b.room} · ${formatVND(estimatedTotal)} (${stayType === "hourly" ? `${hours}h` : stayType === "overnight" ? "qua đêm" : `${nights} đêm`})`,
    });
    onCreated?.();
  };

  return (
    <form onSubmit={submit} className="grid gap-5 p-5">
      <StayTypeSelector value={stayType} onChange={setStayType} roomType={selectedRoom?.type} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Tên khách">
          <input className="input" required value={form.name} onChange={set("name")} />
        </Field>
        <Field label="SĐT">
          <input className="input" type="tel" required value={form.phone} onChange={set("phone")} />
        </Field>
        <Field label="CCCD">
          <input className="input" required value={form.cccd} onChange={set("cccd")} />
        </Field>

        <Field label="Phòng trống">
          <select
            className="input"
            required
            value={selectedRoom ? String(selectedRoom.number) : ""}
            onChange={set("room")}
            disabled={!available.length}
          >
            {available.length ? (
              available.map((r) => (
                <option key={r.number} value={r.number}>
                  {r.number} · {r.type} · {formatVND(ROOM_PRICES[r.type])}/đêm
                </option>
              ))
            ) : (
              <option value="">Hết phòng trống</option>
            )}
          </select>
        </Field>

        {stayType === "hourly" ? (
          <>
            <Field label="Ngày đến">
              <input className="input" type="date" required value={form.checkIn} onChange={set("checkIn")} />
            </Field>
            <Field label="Giờ vào">
              <input
                className="input"
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
              />
            </Field>
            <Field label="Số giờ đặt" className="sm:col-span-2 lg:col-span-3">
              <div className="flex flex-wrap items-center gap-2">
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
                <span className="text-xs text-slate-500 ml-2">
                  Dự kiến trả: <strong className="text-slate-800">{expectedCheckOutTime}</strong>
                </span>
              </div>
            </Field>
          </>
        ) : stayType === "overnight" ? (
          <>
            <Field label="Đêm ngày">
              <input className="input" type="date" required value={form.checkIn} onChange={set("checkIn")} />
            </Field>
            <div className="sm:col-span-2 rounded-xl bg-violet-50 p-3 text-xs text-violet-800 flex items-center">
              🌙 Nhận lúc 22:00 tối và trả lúc 07:00 sáng hôm sau.
            </div>
          </>
        ) : (
          <>
            <Field label="Ngày nhận">
              <input className="input" type="date" required value={form.checkIn} onChange={set("checkIn")} />
            </Field>
            <Field label="Ngày trả">
              <input className="input" type="date" required min={form.checkIn} value={form.checkOut} onChange={set("checkOut")} />
            </Field>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
        <p className="text-sm text-slate-600">
          {selectedRoom ? (
            <>
              {stayType === "hourly" ? (
                <>
                  {hours} giờ × phòng {selectedRoom.type} ={" "}
                  <span className="text-lg font-semibold text-slate-900">{formatVND(estimatedTotal)}</span>
                </>
              ) : stayType === "overnight" ? (
                <>
                  Qua đêm × phòng {selectedRoom.type} ={" "}
                  <span className="text-lg font-semibold text-slate-900">{formatVND(estimatedTotal)}</span>
                </>
              ) : validDates ? (
                <>
                  {nights} đêm × {formatVND(ROOM_PRICES[selectedRoom.type])} ={" "}
                  <span className="text-lg font-semibold text-slate-900">{formatVND(estimatedTotal)}</span>
                </>
              ) : (
                "Chọn ngày trả sau ngày nhận"
              )}
            </>
          ) : (
            "Chọn phòng để tính giá"
          )}
        </p>
        <Button type="submit" disabled={!available.length}>
          Đặt phòng
        </Button>
      </div>

      {message && (
        <p
          role="status"
          className={
            message.kind === "ok"
              ? "rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              : "rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
          }
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
