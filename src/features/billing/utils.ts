import type { Invoice, InvoiceItem } from "./schemas";

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export const itemTotal = (i: Pick<InvoiceItem, "quantity" | "unitPrice">) => i.quantity * i.unitPrice;

export const invoiceTotals = (items: InvoiceItem[], taxRate: number) => {
  const subtotal = items.reduce((s, i) => s + itemTotal(i), 0);
  const tax = subtotal * (taxRate / 100);
  return { subtotal, tax, total: subtotal + tax };
};

export const invoiceToCsvRow = (inv: Invoice, customerName: string) => {
  const { total } = invoiceTotals(inv.items, inv.taxRate);
  return [inv.number, customerName, inv.status, inv.issueDate, inv.dueDate, total.toFixed(2)];
};

export const invoicesToCsv = (rows: string[][]) => {
  const header = ["Number", "Customer", "Status", "Issue Date", "Due Date", "Total"];
  return [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
};

export const downloadCsv = (filename: string, csv: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const parseCsv = (text: string): string[][] =>
  text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const out: string[] = [];
      let cur = "";
      let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') inQ = !inQ;
        else if (c === "," && !inQ) { out.push(cur); cur = ""; }
        else cur += c;
      }
      out.push(cur);
      return out;
    });
