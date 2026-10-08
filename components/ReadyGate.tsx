"use client";

import type { ReactNode } from "react";
import { useHotel } from "@/context/HotelProvider";

/** Chỉ hiển thị nội dung sau khi đã đọc dữ liệu từ localStorage, tránh lệch hydrate */
export function ReadyGate({ children }: { children: ReactNode }) {
  const { ready } = useHotel();
  if (!ready) {
    return (
      <div className="grid gap-4" aria-busy="true" aria-live="polite">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/70" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200/50" />
        <span className="sr-only">Đang tải dữ liệu…</span>
      </div>
    );
  }
  return <>{children}</>;
}
