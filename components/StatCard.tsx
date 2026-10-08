import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: "brand" | "emerald" | "rose" | "amber" | "sky" | "slate";
}

const ACCENTS = {
  brand: "bg-brand-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  sky: "bg-sky-500",
  slate: "bg-slate-400",
};

export function StatCard({ label, value, hint, accent = "brand" }: StatCardProps) {
  return (
    <div className="card relative overflow-hidden p-5">
      <span className={cn("absolute inset-x-0 top-0 h-1", ACCENTS[accent])} />
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
