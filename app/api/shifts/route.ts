import { NextResponse } from "next/server";
import { getServiceSupabase, verifyEmployeeSession } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const SHIFT_MAP = ["SANG", "CHIEU", "DEM"] as const;

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    const { data: shifts, error } = await supabase
      .from("Shift")
      .select("*, Employee(*)")
      .order("date", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ shifts: shifts || [] });
  } catch (error) {
    console.error("GET /api/shifts failed:", error);
    return NextResponse.json({ message: "Không thể tải lịch ca trực" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifyEmployeeSession();
    if (!session) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

    const body = await request.json();
    const supabase = getServiceSupabase();

    const shiftCode =
      typeof body.shift === "number" ? SHIFT_MAP[body.shift] : (body.shift as "SANG" | "CHIEU" | "DEM");

    // Lấy ngày: nếu không truyền date cụ thể, tính dựa trên ngày hiện tại hoặc thứ trong tuần (day: 0-6)
    let dateStr = body.date;
    if (!dateStr && typeof body.day === "number") {
      const now = new Date();
      const currentDay = (now.getDay() + 6) % 7; // Chuyển Chủ nhật thành 6, T2 thành 0
      const diff = body.day - currentDay;
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + diff);
      dateStr = targetDate.toISOString().split("T")[0];
    } else if (!dateStr) {
      dateStr = new Date().toISOString().split("T")[0];
    }

    if (!body.staffId) {
      // Nếu bỏ chọn nhân viên trong ca, xoá bản ghi ca đó
      await supabase
        .from("Shift")
        .delete()
        .eq("date", dateStr)
        .eq("shift", shiftCode);

      return NextResponse.json({ success: true, removed: true });
    }

    const { data: upserted, error } = await supabase
      .from("Shift")
      .upsert(
        {
          employeeId: body.staffId,
          date: dateStr,
          shift: shiftCode,
        },
        { onConflict: "employeeId,date,shift" }
      )
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ shift: upserted });
  } catch (error) {
    console.error("POST /api/shifts failed:", error);
    return NextResponse.json({ message: "Không thể lưu lịch ca trực" }, { status: 500 });
  }
}

