import { SERVICE_PRICES } from "@/lib/data";
import { groupServices, type Invoice } from "@/lib/hotel";
import type { Booking } from "@/lib/types";
import { formatDate, formatVND } from "@/lib/utils";

export function InvoiceView({ booking, invoice, today }: { booking: Booking; invoice: Invoice; today: string }) {
  const services = groupServices(booking.services);
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-600">
            Tiền phòng
            <span className="block text-xs text-slate-400">
              {invoice.stayType === "hourly"
                ? `${invoice.hours} giờ thuê (giờ đầu: ${formatVND(invoice.hourlyFirstPrice ?? 0)}, giờ tiếp: ${formatVND(invoice.hourlyNextPrice ?? 0)}/h)`
                : invoice.stayType === "overnight"
                  ? "Qua đêm (22:00 – 07:00)"
                  : `${invoice.nights} đêm × ${formatVND(invoice.pricePerNight ?? 0)}`}
            </span>
          </dt>
          <dd className="font-medium tabular-nums">{formatVND(invoice.roomTotal)}</dd>
        </div>
        {services.map((s) => (
          <div key={s.name} className="flex justify-between gap-4">
            <dt className="text-slate-600">
              {s.name}
              <span className="block text-xs text-slate-400">
                {s.count} × {formatVND(SERVICE_PRICES[s.name])}
              </span>
            </dt>
            <dd className="tabular-nums">{formatVND(s.total)}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 border-t border-dashed border-slate-300 pt-2">
          <dt className="text-slate-600">Dịch vụ</dt>
          <dd className="tabular-nums">{formatVND(invoice.serviceTotal)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-slate-300 pt-2 text-base font-semibold text-slate-900">
          <dt>Tổng</dt>
          <dd className="tabular-nums">{formatVND(invoice.total)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-slate-500">
        {booking.name} · {booking.stayType === "hourly" ? `thuê ${booking.hours}h (${booking.checkInTime ? `vào ${booking.checkInTime}` : formatDate(booking.checkIn)})` : `nhận ${formatDate(booking.checkIn)}, trả ${formatDate(today)}`}
      </p>
    </div>
  );
}
