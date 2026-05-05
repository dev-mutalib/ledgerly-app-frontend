import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, DollarSign, FileText, AlertCircle, Upload, Download } from "lucide-react";
import { useRef } from "react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { useDashboardStats, useInvoices, useCustomers, useInvoiceActions } from "@/features/billing/hooks";
import { formatCurrency, formatDate, invoiceTotals, invoicesToCsv, invoiceToCsvRow, downloadCsv, parseCsv } from "@/features/billing/utils";
import { invoiceSchema } from "@/features/billing/schemas";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — Ledgerly" }, { name: "description", content: "Revenue, invoices and recent billing activity." }] }),
  component: Dashboard,
});

function Dashboard() {
  const stats = useDashboardStats();
  const invoices = useInvoices();
  const customers = useCustomers();
  const { importMany } = useInvoiceActions();
  const fileRef = useRef<HTMLInputElement>(null);
  const cmap = new Map(customers.map((c) => [c.id, c.name]));

  const handleExport = () => {
    const rows = invoices.map((i) => invoiceToCsvRow(i, cmap.get(i.customerId) ?? "Unknown"));
    downloadCsv(`invoices-${new Date().toISOString().slice(0, 10)}.csv`, invoicesToCsv(rows));
    toast.success("CSV exported");
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      const parsed = rows
        .map((r) => {
          const candidate = {
            id: Math.random().toString(36).slice(2, 10),
            number: r[0] ?? "",
            customerId: customers[0]?.id ?? "",
            issueDate: r[3] ?? new Date().toISOString().slice(0, 10),
            dueDate: r[4] ?? new Date().toISOString().slice(0, 10),
            status: (["draft", "sent", "paid", "overdue"].includes(r[2]) ? r[2] : "draft"),
            taxRate: 0,
            notes: "",
            items: [{ id: Math.random().toString(36).slice(2, 10), description: r[1] ?? "Imported", quantity: 1, unitPrice: Number(r[5]) || 0 }],
          };
          const result = invoiceSchema.safeParse(candidate);
          return result.success ? result.data : null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);
      if (!parsed.length) { toast.error("No valid rows found"); return; }
      importMany(parsed);
      toast.success(`Imported ${parsed.length} invoices`);
    } catch {
      toast.error("Failed to parse CSV");
    }
  };

  const recent = invoices.slice(0, 5);

  return (
    <PageShell
      title="Dashboard"
      subtitle="Overview of your billing activity"
      action={
        <div className="flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept=".csv" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = ""; }} />
          <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Import CSV</Button>
          <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
          <Button asChild><Link to="/invoices/new">New Invoice</Link></Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={formatCurrency(stats.revenue)} icon={DollarSign} accent />
        <StatCard label="Outstanding" value={formatCurrency(stats.outstanding)} icon={FileText} />
        <StatCard label="Overdue" value={formatCurrency(stats.overdue)} icon={AlertCircle} />
        <StatCard label="Invoices" value={String(stats.count)} icon={FileText} />
      </div>

      <Card className="mt-8 shadow-[var(--shadow-soft)]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent activity</CardTitle>
          <Button variant="ghost" size="sm" asChild><Link to="/invoices">View all <ArrowUpRight className="ml-1 h-4 w-4" /></Link></Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            <ul className="divide-y">
              {recent.map((i) => {
                const { total } = invoiceTotals(i.items, i.taxRate);
                return (
                  <li key={i.id} className="flex items-center justify-between py-3">
                    <Link to="/invoices/$id" params={{ id: i.id }} className="flex flex-col hover:underline">
                      <span className="font-medium">{i.number}</span>
                      <span className="text-xs text-muted-foreground">{cmap.get(i.customerId)} · {formatDate(i.issueDate)}</span>
                    </Link>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={i.status} />
                      <span className="font-medium tabular-nums">{formatCurrency(total)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; accent?: boolean }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className={accent ? "shadow-[var(--shadow-elegant)] border-primary/20" : "shadow-[var(--shadow-soft)]"}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className={accent ? "rounded-md bg-[image:var(--gradient-primary)] p-1.5 text-primary-foreground" : "rounded-md bg-muted p-1.5 text-muted-foreground"}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
