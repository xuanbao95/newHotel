import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card mx-auto grid max-w-md gap-3 p-10 text-center">
      <p className="text-5xl font-semibold text-slate-300">404</p>
      <h1 className="text-lg font-semibold">Không tìm thấy trang</h1>
      <Link href="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
        Về trang Tổng quan
      </Link>
    </div>
  );
}
