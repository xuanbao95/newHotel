"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useHotel } from "@/context/HotelProvider";
import { cn, formatDate } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/", label: "Tổng quan" },
  { href: "/phong", label: "Sơ đồ phòng" },
  { href: "/dat-phong", label: "Đặt phòng" },
  { href: "/khach", label: "Khách đang ở" },
  { href: "/nhan-vien", label: "Nhân viên" },
] as const;

interface CurrentUser {
  id: number;
  fullName: string;
  username: string;
  role: "ADMIN" | "STAFF";
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { today } = useHotel();
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated) {
          setUser(data.employee);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/me", { method: "POST" });
      setUser(null);
      router.push("/dang-nhap");
    } catch {
      router.push("/dang-nhap");
    }
  };

  const initials = user?.fullName
    ? user.fullName
        .trim()
        .split(/\s+/)
        .slice(-2)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : "QL";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-sm font-bold text-white">
              NN
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-slate-900">
                Quản lý Nhà nghỉ Mẫu
              </span>
              <span className="block text-xs text-slate-500">
                12 phòng · 3 tầng
              </span>
            </span>
          </Link>
          {today && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 lg:hidden">
              Hôm nay {formatDate(today)}
            </span>
          )}
        </div>

        <nav
          aria-label="Chức năng"
          className="scrollbar-none -mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0"
        >
          <ul className="flex w-max gap-1 rounded-full bg-slate-100 p-1">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition",
                      active
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          {today && (
            <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 lg:inline-block">
              Hôm nay {formatDate(today)}
            </span>
          )}

          {user ? (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                {initials}
              </span>
              <div className="hidden text-left leading-tight sm:block">
                <span className="block text-xs font-semibold text-slate-800">
                  {user.fullName}
                </span>
                <span className="block text-[11px] text-slate-500">
                  {user.role === "ADMIN" ? "Quản lý" : "Lễ tân"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                title="Đăng xuất khỏi hệ thống"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              href="/dang-nhap"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-95"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="10" cy="7" r="3.5" />
                <path d="M4 17c.8-3 3.3-4.6 6-4.6s5.2 1.6 6 4.6" strokeLinecap="round" />
              </svg>
              <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
