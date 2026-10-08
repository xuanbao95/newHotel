import type { Metadata } from "next";
import { BookingsView } from "@/components/views/BookingsView";

export const metadata: Metadata = { title: "Đặt phòng" };

export default function Page() {
  return <BookingsView />;
}
