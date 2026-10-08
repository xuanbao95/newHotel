import { NextResponse } from "next/server";
import { getServiceSupabase, verifyEmployeeSession } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifyEmployeeSession();
    if (!session) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

    const body = await request.json();
    const supabase = getServiceSupabase();

    // params.id có thể là số ID của Booking hoặc mã dạng "DP001"
    const bookingId = Number(params.id);
    let query = supabase.from("Booking").select("*, Room(*)");
    if (!isNaN(bookingId)) {
      query = query.eq("id", bookingId);
    } else {
      query = query.ilike("note", `%"customId":"${params.id}"%`);
    }

    const { data: booking, error: findErr } = await query.single();
    if (findErr || !booking) {
      return NextResponse.json({ message: "Không tìm thấy booking" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const action = body.action; // "check-in" | "check-out" | "cancel"

    if (action === "check-in") {
      const { data: updatedBooking, error } = await supabase
        .from("Booking")
        .update({
          status: "CHECKED_IN",
          actualCheckIn: now,
          checkInAt: body.today ? new Date(body.today).toISOString() : now,
        })
        .eq("id", booking.id)
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from("Room")
        .update({ status: "OCCUPIED" })
        .eq("id", booking.roomId);

      return NextResponse.json({ booking: updatedBooking });
    }

    if (action === "check-out") {
      const { data: updatedBooking, error } = await supabase
        .from("Booking")
        .update({
          status: "CHECKED_OUT",
          actualCheckOut: now,
          cleaningStartedAt: now,
          cleaningCompletedAt: null,
          totalPrice: body.totalPrice || booking.totalPrice,
        })
        .eq("id", booking.id)
        .select()
        .single();

      if (error) throw error;

      // Chuyển phòng sang trạng thái CLEANING (Đang dọn)
      await supabase
        .from("Room")
        .update({ status: "CLEANING" })
        .eq("id", booking.roomId);

      return NextResponse.json({ booking: updatedBooking });
    }

    if (action === "cancel") {
      const { data: updatedBooking, error } = await supabase
        .from("Booking")
        .update({ status: "CANCELLED" })
        .eq("id", booking.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ booking: updatedBooking });
    }

    return NextResponse.json({ message: "Action không hợp lệ" }, { status: 400 });
  } catch (error) {
    console.error(`PATCH /api/bookings/${params.id} failed:`, error);
    return NextResponse.json({ message: "Không thể cập nhật booking" }, { status: 500 });
  }
}

