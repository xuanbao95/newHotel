"use client";

import { useState } from "react";
import { useHotel } from "@/context/HotelProvider";
import { BookingForm } from "../BookingForm";
import { BookingTable } from "../BookingTable";
import { PageHeader } from "../PageHeader";
import { Section } from "../Section";

export function BookingsView() {
  const { bookings } = useHotel();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const list = bookings
    .filter((b) => !q || [b.id, b.name, b.phone, b.room].join(" ").toLowerCase().includes(q))
    .slice()
    .reverse();

  return (
    <div className="grid gap-6">
      <PageHeader title="Đặt phòng" description="Tạo đặt phòng mới, tìm kiếm và huỷ đặt phòng." />

      <Section title="Đặt phòng mới" description="Chỉ hiện phòng đang trống, tổng tiền tự tính theo số đêm.">
        <BookingForm onCreated={() => setQuery("")} />
      </Section>

      <Section
        title="Danh sách đặt phòng"
        actions={
          <input
            type="search"
            className="input w-full sm:w-72"
            placeholder="Mã, tên, SĐT hoặc phòng"
            aria-label="Tìm kiếm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        }
      >
        <BookingTable bookings={list} />
      </Section>
    </div>
  );
}
