import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    const { data: services, error } = await supabase
      .from("Service")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ services: services || [] });
  } catch (error) {
    console.error("GET /api/services failed:", error);
    return NextResponse.json({ message: "Không thể tải danh sách dịch vụ" }, { status: 500 });
  }
}

