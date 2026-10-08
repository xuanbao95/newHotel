"use client";

import { HOURLY_PRICES, OVERNIGHT_PRICES, ROOM_PRICES } from "@/lib/data";
import type { RoomType, StayType } from "@/lib/types";
import { cn, formatVND } from "@/lib/utils";

interface StayTypeSelectorProps {
  value: StayType;
  onChange: (value: StayType) => void;
  roomType?: RoomType;
}

export function StayTypeSelector({ value, onChange, roomType = "Đơn" }: StayTypeSelectorProps) {
  const options = [
    {
      value: "hourly" as const,
      icon: "⏱️",
      label: "Theo giờ",
      desc: "Linh hoạt từ 1 giờ",
      price: `${formatVND(HOURLY_PRICES[roomType].firstHour)}/h đầu`,
    },
    {
      value: "daily" as const,
      icon: "📅",
      label: "Theo ngày / đêm",
      desc: "Tính theo số đêm",
      price: `${formatVND(ROOM_PRICES[roomType])}/đêm`,
    },
    {
      value: "overnight" as const,
      icon: "🌙",
      label: "Qua đêm",
      desc: "22:00 – 07:00 sáng",
      price: `${formatVND(OVERNIGHT_PRICES[roomType])}/đêm`,
    },
  ];

  return (
    <div className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Hình thức thuê
      </span>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "relative flex flex-col items-start rounded-xl border p-3 text-left transition-all",
                selected
                  ? "border-brand-600 bg-brand-50/70 shadow-sm ring-2 ring-brand-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60",
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-lg" aria-hidden="true">
                  {opt.icon}
                </span>
                <span
                  className={cn(
                    "size-4 rounded-full border-2 transition-all",
                    selected ? "border-brand-600 bg-brand-600 ring-2 ring-brand-100" : "border-slate-300 bg-white",
                  )}
                />
              </div>
              <div className="mt-2">
                <p className={cn("text-sm font-semibold", selected ? "text-brand-950" : "text-slate-800")}>
                  {opt.label}
                </p>
                <p className="text-[11px] text-slate-500">{opt.desc}</p>
                <p className={cn("mt-1 text-xs font-bold", selected ? "text-brand-700" : "text-slate-600")}>
                  {opt.price}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

