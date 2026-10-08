/** Định dạng tiền Việt: 350000 -> "350.000 ₫" */
export function formatVND(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const digits = Math.round(Math.abs(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}${digits} ₫`;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Date -> "YYYY-MM-DD" theo giờ địa phương */
export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "YYYY-MM-DD" -> Date (00:00 giờ địa phương) */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Ngày hôm nay dạng "YYYY-MM-DD" */
export function todayISO(): string {
  return toISODate(new Date());
}

/** Cộng/trừ số ngày, trả về "YYYY-MM-DD". Mặc định tính từ hôm nay. */
export function addDays(days: number, from: string = todayISO()): string {
  const d = parseISODate(from);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** "YYYY-MM-DD" -> "DD/MM/YYYY" */
export function formatDate(iso: string): string {
  if (!iso) return "";
  return iso.split("-").reverse().join("/");
}

/** Số đêm giữa hai ngày, tối thiểu 1 đêm */
export function nightsBetween(from: string, to: string): number {
  const ms = parseISODate(to).getTime() - parseISODate(from).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

/** Ghép className, bỏ giá trị rỗng */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
