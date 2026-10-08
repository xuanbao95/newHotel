"use client";

import { useHotel } from "@/context/HotelProvider";
import { Button } from "./Button";

export function Footer() {
  const { resetData, ready } = useHotel();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm text-slate-500 sm:px-6 lg:px-8">
        <p>Dữ liệu được lưu trên trình duyệt này (localStorage).</p>
        <Button
          variant="ghost"
          size="sm"
          disabled={!ready}
          onClick={() => {
            if (window.confirm("Khôi phục toàn bộ dữ liệu mẫu? Mọi thay đổi hiện tại sẽ mất.")) resetData();
          }}
        >
          Khôi phục dữ liệu mẫu
        </Button>
      </div>
    </footer>
  );
}
