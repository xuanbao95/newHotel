import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServiceSupabase } from "@/lib/supabase/server";
import { createHash } from "node:crypto";
import { ensureLoginBg } from "@/lib/auth/setup-bg";

export const dynamic = "force-dynamic";

ensureLoginBg();

export async function GET() {
  try {
    ensureLoginBg();
    const cookieStore = cookies();
    const token = cookieStore.get("hotel_session")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const supabase = getServiceSupabase();

    const { data: session, error } = await supabase
      .from("EmployeeSession")
      .select("*, Employee(*)")
      .eq("tokenHash", tokenHash)
      .single();

    if (
      error ||
      !session ||
      new Date(session.expiresAt) <= new Date() ||
      !session.Employee?.active
    ) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      employee: {
        id: session.Employee.id,
        fullName: session.Employee.fullName,
        username: session.Employee.username,
        role: session.Employee.role,
        hotelId: session.Employee.hotelId,
      },
    });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json({ authenticated: false });
  }
}

export async function POST() {
  // Đăng xuất: xoá session và cookie
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("hotel_session")?.value;

    if (token) {
      const tokenHash = createHash("sha256").update(token).digest("hex");
      const supabase = getServiceSupabase();
      await supabase.from("EmployeeSession").delete().eq("tokenHash", tokenHash);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("hotel_session");
    return response;
  } catch {
    const response = NextResponse.json({ success: true });
    response.cookies.delete("hotel_session");
    return response;
  }
}

