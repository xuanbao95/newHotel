import type { Metadata } from "next";
import { RoomsView } from "@/components/views/RoomsView";

export const metadata: Metadata = { title: "Sơ đồ phòng" };

export default function Page() {
  return <RoomsView />;
}
