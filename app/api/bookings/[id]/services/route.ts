import { NextResponse } from "next/server";
import { getServiceSupabase, verifyEmployeeSession } from "@/lib/supabase/server";
import { SERVICE_PRICES } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifyEmployeeSession();
    if (!session) return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });

    const body = await request.json();
    const supabase = getServiceSupabase();

    const bookingId = Number(params.id);
    let query = supabase.from("Booking").select("id");
    if (!isNaN(bookingId)) {
      query = query.eq("id", bookingId);
    } else {
      query = query.ilike("note", `%"customId":"${params.id}"%`);
    }

    const { data: booking, error: findErr } = await query.single();
    if (findErr || !booking) {
      return NextResponse.json({ message: "Không tìm thấy booking" }, { status: 404 });
    }

    const serviceName = body.service || body.serviceName;
    const unitPrice =
      body.unitPrice !== undefined
        ? body.unitPrice
        : (SERVICE_PRICES as Record<string, number>)[serviceName] || 0;
    const serviceId = body.serviceId || serviceName.toLowerCase().replace(/\s+/g, "-");

    // Kiểm tra xem dịch vụ đã có trong booking này chưa
    const { data: existing } = await supabase
      .from("BookingService")
      .select("*")
      .eq("bookingId", booking.id)
      .eq("serviceId", serviceId)
      .maybeSingle();

    if (existing) {
      // Tăng số lượng lên 1
      const { data: updated, error } = await supabase
        .from("BookingService")
        .update({ quantity: existing.quantity + 1 })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ service: updated });
    } else {
      // Thêm mới
      const { data: created, error } = await supabase
        .from("BookingService")
        .insert({
          bookingId: booking.id,
          serviceId,
          serviceName,
          unitPrice,
          quantity: 1,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ service: created }, { status: 201 });
    }
  } catch (error) {
    console.error(`POST /api/bookings/${params.id}/services failed:`, error);
    return NextResponse.json({ message: "Không thể thêm dịch vụ" }, { status: 500 });
  }
}

