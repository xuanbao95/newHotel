import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("grid gap-1.5 text-xs font-medium text-slate-600", className)}>
      {label}
      {children}
    </label>
  );
}
