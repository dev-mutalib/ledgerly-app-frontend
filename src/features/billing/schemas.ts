import { z } from "zod";

export const customerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name required"),
  email: z.string().email("Invalid email"),
  company: z.string(),
  phone: z.string(),
  createdAt: z.string(),
});
export type Customer = z.infer<typeof customerSchema>;
export const customerInputSchema = customerSchema.omit({ id: true, createdAt: true });
export type CustomerInput = z.infer<typeof customerInputSchema>;

export const invoiceItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Required"),
  quantity: z.coerce.number().min(0.01, "Min 0.01"),
  unitPrice: z.coerce.number().min(0, "Min 0"),
});
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;

export const invoiceStatusSchema = z.enum(["draft", "sent", "paid", "overdue"]);
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;

export const invoiceSchema = z.object({
  id: z.string(),
  number: z.string(),
  customerId: z.string().min(1, "Select a customer"),
  issueDate: z.string(),
  dueDate: z.string(),
  status: invoiceStatusSchema,
  items: z.array(invoiceItemSchema).min(1, "At least one item"),
  notes: z.string(),
  taxRate: z.coerce.number().min(0).max(100),
});
export type Invoice = z.infer<typeof invoiceSchema>;
export const invoiceInputSchema = invoiceSchema.omit({ id: true, number: true });
export type InvoiceInput = z.infer<typeof invoiceInputSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});
export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name required"),
});
