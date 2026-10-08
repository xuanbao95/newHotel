import { NextResponse } from "next/server";
import { getServiceSupabase, verifyEmployeeSession } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { number: string } }
) {
  try {
    const session = await verifyEmployeeSession();
    if (!session) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

    const roomNumber = Number(params.number);
    if (!roomNumber) return NextResponse.json({ message: "Số phòng không hợp lệ" }, { status: 400 });

    const body = await request.json();
    const supabase = getServiceSupabase();

    // flag: "" | "Đang dọn" | "Bảo trì"
    // ánh xạ sang status trong Database: AVAILABLE | CLEANING | MAINTENANCE
    let status = body.status;
    if (body.flag === "") {
      status = "AVAILABLE";
    } else if (body.flag === "Đang dọn") {
      status = "CLEANING";
    } else if (body.flag === "Bảo trì") {
      status = "MAINTENANCE";
    }

    const updatePayload: Record<string, unknown> = {};
    if (status) updatePayload.status = status;
    if (body.type) updatePayload.type = body.type;

    const { data: updatedRoom, error } = await supabase
      .from("Room")
      .update(updatePayload)
      .eq("roomNumber", roomNumber)
      .select()
      .single();

    if (error) throw error;

    // Nếu vừa dọn xong, cập nhật cleaningCompletedAt cho booking gần nhất
    if (status === "AVAILABLE") {
      await supabase
        .from("Booking")
        .update({ cleaningCompletedAt: new Date().toISOString() })
        .eq("roomId", updatedRoom.id)
        .is("cleaningCompletedAt", null)
        .order("cleaningStartedAt", { ascending: false })
        .limit(1);
    }

    return NextResponse.json({ room: updatedRoom });
  } catch (error) {
    console.error(`PATCH /api/rooms/${params.number} failed:`, error);
    return NextResponse.json({ message: "Không thể cập nhật trạng thái phòng" }, { status: 500 });
  }
}

