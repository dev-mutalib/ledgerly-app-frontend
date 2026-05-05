import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFilteredInvoices, useCustomers } from "@/features/billing/hooks";
import { formatCurrency, formatDate, invoiceTotals } from "@/features/billing/utils";
import type { InvoiceStatus } from "@/features/billing/schemas";

export const Route = createFileRoute("/invoices/")({
  head: () => ({ meta: [{ title: "Invoices — Ledgerly" }, { name: "description", content: "Search and manage invoices." }] }),
  component: InvoicesList,
});

function InvoicesList() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const invoices = useFilteredInvoices(q, status);
  const customers = useCustomers();
  const cmap = new Map(customers.map((c) => [c.id, c.name]));

  return (
    <PageShell
      title="Invoices"
      subtitle={`${invoices.length} result${invoices.length === 1 ? "" : "s"}`}
      action={<Button asChild><Link to="/invoices/new"><Plus className="mr-2 h-4 w-4" />New Invoice</Link></Button>}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by number or customer" className="pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as InvoiceStatus | "all")}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden shadow-[var(--shadow-soft)]">
        <div className="hidden md:grid grid-cols-[1.2fr_2fr_1fr_1fr_1fr] gap-3 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground border-b bg-muted/40">
          <span>Number</span><span>Customer</span><span>Issue</span><span>Status</span><span className="text-right">Total</span>
        </div>
        <ul className="divide-y">
          <AnimatePresence initial={false}>
            {invoices.map((i) => {
              const { total } = invoiceTotals(i.items, i.taxRate);
              return (
                <motion.li
                  key={i.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <Link to="/invoices/$id" params={{ id: i.id }} className="grid md:grid-cols-[1.2fr_2fr_1fr_1fr_1fr] gap-3 px-4 py-3 items-center hover:bg-muted/40 transition-colors">
                    <span className="font-medium">{i.number}</span>
                    <span className="text-sm">{cmap.get(i.customerId) ?? "—"}</span>
                    <span className="text-sm text-muted-foreground">{formatDate(i.issueDate)}</span>
                    <span><StatusBadge status={i.status} /></span>
                    <span className="font-medium tabular-nums md:text-right">{formatCurrency(total)}</span>
                  </Link>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
        {invoices.length === 0 && <div className="px-4 py-12 text-center text-sm text-muted-foreground">No invoices match your filters.</div>}
      </Card>
    </PageShell>
  );
}
