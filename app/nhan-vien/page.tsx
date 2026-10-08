import type { Metadata } from "next";
import { StaffView } from "@/components/views/StaffView";

export const metadata: Metadata = { title: "Nhân viên" };

export default function Page() {
  return <StaffView />;
}
