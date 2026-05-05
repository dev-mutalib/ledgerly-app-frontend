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
  { id: "c4", name: "Umbrella Co.", email: "accounts@umbrella.co", company: "Umbrella", phone: "555-0130", createdAt: now() },
  { id: "c5", name: "Stark Industries", email: "pepper@stark.com", company: "Stark", phone: "555-0140", createdAt: now() },
  { id: "c6", name: "Wayne Enterprises", email: "lucius@wayne.com", company: "Wayne Ent.", phone: "555-0150", createdAt: now() },
  { id: "c7", name: "Hooli", email: "billing@hooli.xyz", company: "Hooli", phone: "555-0160", createdAt: now() },
  { id: "c8", name: "Pied Piper", email: "richard@piedpiper.com", company: "Pied Piper", phone: "555-0170", createdAt: now() },
];

const seedInvoices: Invoice[] = [
  { id: "i1", number: "INV-1001", customerId: "c1", issueDate: "2026-04-10", dueDate: "2026-05-10", status: "paid", taxRate: 8, notes: "Q2 retainer",
    items: [{ id: uid(), description: "Design retainer", quantity: 1, unitPrice: 2400 }] },
  { id: "i2", number: "INV-1002", customerId: "c2", issueDate: "2026-04-18", dueDate: "2026-05-18", status: "sent", taxRate: 8, notes: "",
    items: [{ id: uid(), description: "Engineering hours", quantity: 40, unitPrice: 120 }] },
  { id: "i3", number: "INV-1003", customerId: "c3", issueDate: "2026-03-01", dueDate: "2026-04-01", status: "overdue", taxRate: 0, notes: "Please remit ASAP",
    items: [{ id: uid(), description: "Consulting", quantity: 8, unitPrice: 200 }] },
  { id: "i4", number: "INV-1004", customerId: "c4", issueDate: "2026-04-22", dueDate: "2026-05-22", status: "paid", taxRate: 5, notes: "",
    items: [
      { id: uid(), description: "Security audit", quantity: 1, unitPrice: 5000 },
      { id: uid(), description: "Follow-up review", quantity: 2, unitPrice: 750 },
    ] },
  { id: "i5", number: "INV-1005", customerId: "c5", issueDate: "2026-04-25", dueDate: "2026-05-25", status: "sent", taxRate: 8, notes: "",
    items: [{ id: uid(), description: "Arc reactor maintenance", quantity: 3, unitPrice: 1500 }] },
  { id: "i6", number: "INV-1006", customerId: "c6", issueDate: "2026-04-28", dueDate: "2026-05-28", status: "draft", taxRate: 0, notes: "Pending approval",
    items: [{ id: uid(), description: "R&D services", quantity: 20, unitPrice: 300 }] },
  { id: "i7", number: "INV-1007", customerId: "c7", issueDate: "2026-02-15", dueDate: "2026-03-15", status: "overdue", taxRate: 8, notes: "",
    items: [{ id: uid(), description: "Cloud migration", quantity: 1, unitPrice: 8500 }] },
  { id: "i8", number: "INV-1008", customerId: "c8", issueDate: "2026-04-30", dueDate: "2026-05-30", status: "paid", taxRate: 7, notes: "Compression v3",
    items: [
      { id: uid(), description: "Algorithm licensing", quantity: 1, unitPrice: 12000 },
      { id: uid(), description: "Integration support", quantity: 6, unitPrice: 250 },
    ] },
  { id: "i9", number: "INV-1009", customerId: "c1", issueDate: "2026-05-01", dueDate: "2026-06-01", status: "sent", taxRate: 8, notes: "",
    items: [{ id: uid(), description: "Brand refresh", quantity: 1, unitPrice: 3200 }] },
  { id: "i10", number: "INV-1010", customerId: "c2", issueDate: "2026-05-02", dueDate: "2026-06-02", status: "draft", taxRate: 8, notes: "",
    items: [{ id: uid(), description: "API integration", quantity: 25, unitPrice: 140 }] },
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
