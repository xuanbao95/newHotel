"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHotel } from "@/context/HotelProvider";
import { cn, formatDate } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/", label: "Tổng quan" },
  { href: "/phong", label: "Sơ đồ phòng" },
  { href: "/dat-phong", label: "Đặt phòng" },
  { href: "/khach", label: "Khách đang ở" },
  { href: "/nhan-vien", label: "Nhân viên" },
] as const;

export function Header() {
  const pathname = usePathname();
  const { today } = useHotel();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-sm font-bold text-white">NN</span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-slate-900">Quản lý Nhà nghỉ Mẫu</span>
              <span className="block text-xs text-slate-500">12 phòng · 3 tầng</span>
            </span>
          </Link>
          {today && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 lg:hidden">
              Hôm nay {formatDate(today)}
            </span>
          )}
        </div>

        <nav aria-label="Chức năng" className="scrollbar-none -mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          <ul className="flex w-max gap-1 rounded-full bg-slate-100 p-1">
            {NAV_ITEMS.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition",
                      active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {today && (
          <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 lg:inline-block">
            Hôm nay {formatDate(today)}
          </span>
        )}
      </div>
    </header>
  );
}
