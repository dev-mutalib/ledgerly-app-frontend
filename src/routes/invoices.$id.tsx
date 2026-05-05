import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { useInvoice, useCustomer, useInvoiceActions } from "@/features/billing/hooks";
import { formatCurrency, formatDate, invoiceTotals } from "@/features/billing/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/invoices/$id")({
  component: InvoiceDetail,
});

function InvoiceDetail() {
  const { id } = Route.useParams();
  const inv = useInvoice(id);
  const customer = useCustomer(inv?.customerId);
  const { remove } = useInvoiceActions();
  const navigate = useNavigate();

  if (!inv) {
    return <PageShell title="Invoice not found"><Button asChild variant="outline"><Link to="/invoices">Back</Link></Button></PageShell>;
  }
  const { subtotal, tax, total } = invoiceTotals(inv.items, inv.taxRate);

  return (
    <PageShell
      title={inv.number}
      subtitle={customer?.name ?? "Unknown customer"}
      action={
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link to="/invoices"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></Button>
          <Button variant="outline" asChild><Link to="/invoices/$id/edit" params={{ id: inv.id }}><Pencil className="mr-2 h-4 w-4" />Edit</Link></Button>
          <Button variant="destructive" onClick={() => { remove(inv.id); toast.success("Invoice deleted"); navigate({ to: "/invoices" }); }}>
            <Trash2 className="mr-2 h-4 w-4" />Delete
          </Button>
        </div>
      }
    >
      <Card className="shadow-[var(--shadow-soft)]">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Bill to</p>
              <p className="font-medium">{customer?.name}</p>
              <p className="text-sm text-muted-foreground">{customer?.email}</p>
            </div>
            <div className="text-right">
              <StatusBadge status={inv.status} />
              <p className="mt-2 text-sm text-muted-foreground">Issued {formatDate(inv.issueDate)}</p>
              <p className="text-sm text-muted-foreground">Due {formatDate(inv.dueDate)}</p>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                <tr><th className="py-2">Description</th><th className="py-2 text-right">Qty</th><th className="py-2 text-right">Unit</th><th className="py-2 text-right">Total</th></tr>
              </thead>
              <tbody className="divide-y">
                {inv.items.map((it) => (
                  <tr key={it.id}>
                    <td className="py-3">{it.description}</td>
                    <td className="py-3 text-right tabular-nums">{it.quantity}</td>
                    <td className="py-3 text-right tabular-nums">{formatCurrency(it.unitPrice)}</td>
                    <td className="py-3 text-right tabular-nums">{formatCurrency(it.quantity * it.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 ml-auto w-full max-w-xs space-y-2 text-sm">
            <Row label="Subtotal" value={formatCurrency(subtotal)} />
            <Row label={`Tax (${inv.taxRate}%)`} value={formatCurrency(tax)} />
            <div className="border-t pt-2"><Row label="Total" value={formatCurrency(total)} bold /></div>
          </div>

          {inv.notes && <div className="mt-6 rounded-md bg-muted/50 p-4 text-sm"><p className="font-medium mb-1">Notes</p><p className="text-muted-foreground">{inv.notes}</p></div>}
        </CardContent>
      </Card>
    </PageShell>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-base" : ""}`}>
      <span className="text-muted-foreground">{label}</span><span className="tabular-nums">{value}</span>
    </div>
  );
}
