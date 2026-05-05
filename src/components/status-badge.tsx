import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/features/billing/schemas";

const styles: Record<InvoiceStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-info/15 text-info",
  paid: "bg-success/15 text-success",
  overdue: "bg-destructive/15 text-destructive",
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", styles[status])}>
      {status}
    </span>
  );
}
