/**
 * In-memory data store. This is the ONLY place that knows where data lives.
 * To swap for a real backend later, replace these functions with API calls —
 * UI/components/hooks need no changes because they consume the hooks below.
 */
import { create } from "zustand";
import type { Customer, CustomerInput, Invoice, InvoiceInput } from "./schemas";

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const seedCustomers: Customer[] = [
  { id: "c1", name: "Acme Inc.", email: "billing@acme.com", company: "Acme", phone: "555-0100", createdAt: now() },
  { id: "c2", name: "Globex", email: "ap@globex.io", company: "Globex Corp", phone: "555-0110", createdAt: now() },
  { id: "c3", name: "Initech", email: "finance@initech.com", company: "Initech", phone: "555-0120", createdAt: now() },
];

const seedInvoices: Invoice[] = [
  {
    id: "i1", number: "INV-1001", customerId: "c1", issueDate: "2026-04-10", dueDate: "2026-05-10",
    status: "paid", taxRate: 8, notes: "",
    items: [{ id: uid(), description: "Design retainer", quantity: 1, unitPrice: 2400 }],
  },
  {
    id: "i2", number: "INV-1002", customerId: "c2", issueDate: "2026-04-18", dueDate: "2026-05-18",
    status: "sent", taxRate: 8, notes: "",
    items: [{ id: uid(), description: "Engineering hours", quantity: 40, unitPrice: 120 }],
  },
  {
    id: "i3", number: "INV-1003", customerId: "c3", issueDate: "2026-03-01", dueDate: "2026-04-01",
    status: "overdue", taxRate: 0, notes: "",
    items: [{ id: uid(), description: "Consulting", quantity: 8, unitPrice: 200 }],
  },
];

interface BillingState {
  customers: Customer[];
  invoices: Invoice[];
  addCustomer: (c: CustomerInput) => Customer;
  updateCustomer: (id: string, c: CustomerInput) => void;
  deleteCustomer: (id: string) => void;
  addInvoice: (i: InvoiceInput) => Invoice;
  updateInvoice: (id: string, i: InvoiceInput) => void;
  deleteInvoice: (id: string) => void;
  importInvoices: (rows: Invoice[]) => void;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  customers: seedCustomers,
  invoices: seedInvoices,
  addCustomer: (c) => {
    const next: Customer = { ...c, id: uid(), createdAt: now() };
    set({ customers: [next, ...get().customers] });
    return next;
  },
  updateCustomer: (id, c) =>
    set({ customers: get().customers.map((x) => (x.id === id ? { ...x, ...c } : x)) }),
  deleteCustomer: (id) => set({ customers: get().customers.filter((x) => x.id !== id) }),
  addInvoice: (i) => {
    const number = `INV-${1000 + get().invoices.length + 1}`;
    const next: Invoice = { ...i, id: uid(), number };
    set({ invoices: [next, ...get().invoices] });
    return next;
  },
  updateInvoice: (id, i) =>
    set({ invoices: get().invoices.map((x) => (x.id === id ? { ...x, ...i } : x)) }),
  deleteInvoice: (id) => set({ invoices: get().invoices.filter((x) => x.id !== id) }),
  importInvoices: (rows) => set({ invoices: [...rows, ...get().invoices] }),
}));
