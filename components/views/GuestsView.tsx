"use client";

import { useState } from "react";
import { useHotel } from "@/context/HotelProvider";
import { estimateTotal } from "@/lib/hotel";
import { formatVND } from "@/lib/utils";
import { GuestTable } from "../GuestTable";
import { PageHeader } from "../PageHeader";
import { RoomModal } from "../RoomModal";
import { Section } from "../Section";
import { StatCard } from "../StatCard";

export function GuestsView() {
  const { bookings, rooms } = useHotel();
  const [checkoutRoom, setCheckoutRoom] = useState<number | null>(null);

  const guests = bookings.filter((b) => b.status === "Đang ở");
  const people = guests.reduce((n, b) => n + b.guests, 0);
  const total = guests.reduce((n, b) => n + estimateTotal(b, rooms), 0);

  return (
    <div className="grid gap-6">
      <PageHeader title="Khách đang ở" description="Tạm tính theo số đêm đã đặt cộng dịch vụ." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Phòng có khách" value={guests.length} accent="rose" />
        <StatCard label="Số khách" value={people} accent="brand" />
        <StatCard label="Tổng tạm tính" value={<span className="text-2xl">{formatVND(total)}</span>} accent="amber" />
      </div>

      <Section>
        <GuestTable guests={guests} onCheckOut={setCheckoutRoom} />
      </Section>

      <RoomModal roomNumber={checkoutRoom} initialView="invoice" onClose={() => setCheckoutRoom(null)} />
    </div>
  );
}
