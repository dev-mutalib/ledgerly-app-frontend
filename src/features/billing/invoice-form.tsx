import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomers } from "./hooks";
import { invoiceInputSchema, type InvoiceInput, type Invoice } from "./schemas";
import { formatCurrency, invoiceTotals } from "./utils";

interface Props {
  defaultValues?: Invoice;
  submitLabel?: string;
  onSubmit: (data: InvoiceInput) => void;
}

const today = () => new Date().toISOString().slice(0, 10);
const plus30 = () => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().slice(0, 10); };

export function InvoiceForm({ defaultValues, submitLabel = "Create invoice", onSubmit }: Props) {
  const customers = useCustomers();
  const form = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceInputSchema),
    defaultValues: defaultValues ?? {
      customerId: customers[0]?.id ?? "",
      issueDate: today(),
      dueDate: plus30(),
      status: "draft",
      taxRate: 0,
      notes: "",
      items: [{ id: Math.random().toString(36).slice(2, 10), description: "", quantity: 1, unitPrice: 0 }],
    },
  });
  const { register, control, handleSubmit, watch, formState: { errors }, setValue } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const taxRate = watch("taxRate");
  const totals = invoiceTotals(items.map((i) => ({ ...i, quantity: Number(i.quantity) || 0, unitPrice: Number(i.unitPrice) || 0 })), Number(taxRate) || 0);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="shadow-[var(--shadow-soft)]">
        <CardContent className="p-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Customer</Label>
            <Select value={watch("customerId")} onValueChange={(v) => setValue("customerId", v, { shouldValidate: true })}>
              <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
              <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
            {errors.customerId && <p className="text-xs text-destructive">{errors.customerId.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={watch("status")} onValueChange={(v) => setValue("status", v as InvoiceInput["status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Issue date</Label><Input type="date" {...register("issueDate")} /></div>
          <div className="space-y-1.5"><Label>Due date</Label><Input type="date" {...register("dueDate")} /></div>
          <div className="space-y-1.5"><Label>Tax rate (%)</Label><Input type="number" step="0.1" {...register("taxRate")} /></div>
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-soft)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Line items</h3>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ id: Math.random().toString(36).slice(2, 10), description: "", quantity: 1, unitPrice: 0 })}>
              <Plus className="mr-2 h-4 w-4" />Add item
            </Button>
          </div>
          <div className="space-y-3">
            {fields.map((f, idx) => (
              <div key={f.id} className="grid gap-2 md:grid-cols-[2fr_1fr_1fr_auto] items-start">
                <div>
                  <Input placeholder="Description" {...register(`items.${idx}.description`)} />
                  {errors.items?.[idx]?.description && <p className="text-xs text-destructive mt-1">{errors.items[idx]?.description?.message}</p>}
                </div>
                <Input type="number" step="0.01" placeholder="Qty" {...register(`items.${idx}.quantity`)} />
                <Input type="number" step="0.01" placeholder="Unit price" {...register(`items.${idx}.unitPrice`)} />
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(idx)} disabled={fields.length === 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          {errors.items && typeof errors.items.message === "string" && <p className="text-xs text-destructive mt-2">{errors.items.message}</p>}

          <div className="mt-6 ml-auto w-full max-w-xs space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">{formatCurrency(totals.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="tabular-nums">{formatCurrency(totals.tax)}</span></div>
            <div className="flex justify-between border-t pt-1 font-semibold"><span>Total</span><span className="tabular-nums">{formatCurrency(totals.total)}</span></div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-soft)]">
        <CardContent className="p-6 space-y-1.5">
          <Label>Notes</Label>
          <Textarea rows={3} placeholder="Optional notes for the customer" {...register("notes")} />
        </CardContent>
      </Card>

      <div className="flex justify-end"><Button type="submit" size="lg">{submitLabel}</Button></div>
    </form>
  );
}
