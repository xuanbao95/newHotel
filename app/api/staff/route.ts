import { NextResponse } from "next/server";
import { getServiceSupabase, verifyEmployeeSession } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    const { data: employees, error } = await supabase
      .from("Employee")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ staff: employees || [] });
  } catch (error) {
    console.error("GET /api/staff failed:", error);
    return NextResponse.json({ message: "Không thể tải danh sách nhân viên" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifyEmployeeSession();
    if (!session) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

    const body = await request.json();
    const supabase = getServiceSupabase();

    const username =
      body.username ||
      `user_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const { data: newEmployee, error } = await supabase
      .from("Employee")
      .insert({
        fullName: body.name || body.fullName,
        username,
        passwordHash: "default_scrypt_hash_placeholder",
        role: body.role === "Quản lý" ? "ADMIN" : "STAFF",
        phone: body.phone,
        hotelId: body.hotelId || "quynh-nhu-1",
        active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ employee: newEmployee }, { status: 201 });
  } catch (error) {
    console.error("POST /api/staff failed:", error);
    return NextResponse.json({ message: "Không thể thêm nhân viên" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await verifyEmployeeSession();
    if (!session) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

    const body = await request.json();
    const supabase = getServiceSupabase();

    const { data: updated, error } = await supabase
      .from("Employee")
      .update({
        fullName: body.name || body.fullName,
        phone: body.phone,
        role: body.role === "Quản lý" ? "ADMIN" : "STAFF",
      })
      .eq("id", body.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ employee: updated });
  } catch (error) {
    console.error("PUT /api/staff failed:", error);
    return NextResponse.json({ message: "Không thể cập nhật nhân viên" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await verifyEmployeeSession();
    if (!session) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) return NextResponse.json({ message: "ID không hợp lệ" }, { status: 400 });

    const supabase = getServiceSupabase();
    const { error } = await supabase.from("Employee").delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/staff failed:", error);
    return NextResponse.json({ message: "Không thể xoá nhân viên" }, { status: 500 });
  }
}

