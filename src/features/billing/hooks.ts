/**
 * Public data hooks. Components MUST consume data through these.
 * Swap the store import for a future API layer with no UI changes.
 */
import { useMemo } from "react";
import { useBillingStore } from "./store";
import type { Invoice, InvoiceStatus } from "./schemas";
import { invoiceTotals } from "./utils";

export const useCustomers = () => useBillingStore((s) => s.customers);
export const useCustomer = (id: string | undefined) =>
  useBillingStore((s) => s.customers.find((c) => c.id === id));
export const useCustomerActions = () =>
  useBillingStore((s) => ({ add: s.addCustomer, update: s.updateCustomer, remove: s.deleteCustomer }));

export const useInvoices = () => useBillingStore((s) => s.invoices);
export const useInvoice = (id: string | undefined) =>
  useBillingStore((s) => s.invoices.find((i) => i.id === id));
export const useInvoiceActions = () =>
  useBillingStore((s) => ({
    add: s.addInvoice,
    update: s.updateInvoice,
    remove: s.deleteInvoice,
    importMany: s.importInvoices,
  }));

export const useFilteredInvoices = (q: string, status: InvoiceStatus | "all") => {
  const invoices = useInvoices();
  const customers = useCustomers();
  return useMemo(() => {
    const cmap = new Map(customers.map((c) => [c.id, c.name]));
    const ql = q.trim().toLowerCase();
    return invoices.filter((i) => {
      if (status !== "all" && i.status !== status) return false;
      if (!ql) return true;
      const name = cmap.get(i.customerId) ?? "";
      return i.number.toLowerCase().includes(ql) || name.toLowerCase().includes(ql);
    });
  }, [invoices, customers, q, status]);
};

export const useDashboardStats = () => {
  const invoices = useInvoices();
  return useMemo(() => {
    const compute = (i: Invoice) => invoiceTotals(i.items, i.taxRate).total;
    const revenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + compute(i), 0);
    const outstanding = invoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + compute(i), 0);
    const overdue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + compute(i), 0);
    return { revenue, outstanding, overdue, count: invoices.length };
  }, [invoices]);
};
