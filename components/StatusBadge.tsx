import { STATUS_DOT, STATUS_PILL, type AnyStatus } from "@/lib/status";
import { cn } from "@/lib/utils";

export function StatusDot({ status, className }: { status: AnyStatus; className?: string }) {
  return <span className={cn("inline-block h-2 w-2 shrink-0 rounded-full", STATUS_DOT[status], className)} />;
}

export function StatusBadge({ status }: { status: AnyStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STATUS_PILL[status],
      )}
    >
      <StatusDot status={status} />
      {status}
    </span>
  );
}
