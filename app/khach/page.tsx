import type { Metadata } from "next";
import { GuestsView } from "@/components/views/GuestsView";

export const metadata: Metadata = { title: "Khách đang ở" };

export default function Page() {
  return <GuestsView />;
}
