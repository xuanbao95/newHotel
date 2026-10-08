import { NextResponse } from "next/server";
import { getServiceSupabase, verifyEmployeeSession } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getServiceSupabase();

    // 1. Lấy toàn bộ danh sách phòng sắp xếp theo roomNumber
    const { data: rooms, error: roomErr } = await supabase
      .from("Room")
      .select("*")
      .order("roomNumber", { ascending: true });

    if (roomErr) throw roomErr;

    // 2. Lấy các booking đang hiệu lực (CHECKED_IN hoặc RESERVED)
    const { data: bookings, error: bookErr } = await supabase
      .from("Booking")
      .select("*, BookingService(*)")
      .in("status", ["CHECKED_IN", "RESERVED"])
      .order("createdAt", { ascending: false });

    if (bookErr) throw bookErr;

    return NextResponse.json({
      rooms: rooms || [],
      activeBookings: bookings || [],
    });
  } catch (error) {
    console.error("GET /api/rooms failed:", error);
    return NextResponse.json({ message: "Không thể tải danh sách phòng" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifyEmployeeSession();
    if (!session) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

    const body = await request.json();
    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from("Room")
      .upsert({
        roomNumber: body.roomNumber,
        type: body.type || "Đơn",
        price: body.price,
        status: body.status || "AVAILABLE",
        name: body.name || `Phòng ${body.roomNumber}`,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ room: data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/rooms failed:", error);
    return NextResponse.json({ message: "Không thể cập nhật phòng" }, { status: 500 });
  }
}

