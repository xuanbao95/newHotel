import type { Metadata, Viewport } from "next";
import "./globals.css";
import { HotelProvider } from "@/context/HotelProvider";
import { Header } from "@/components/Header";
import { ReadyGate } from "@/components/ReadyGate";

export const metadata: Metadata = {
  title: {
    default: "Quản lý Nhà nghỉ Mẫu",
    template: "%s · Quản lý Nhà nghỉ Mẫu",
  },
  description: "Quản lý phòng, đặt phòng, khách đang ở và lịch ca nhân viên cho nhà nghỉ 12 phòng.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1d5cf1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen flex-col">
        <HotelProvider>
          <Header />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <ReadyGate>{children}</ReadyGate>
          </main>
        </HotelProvider>
      </body>
    </html>
  );
}
