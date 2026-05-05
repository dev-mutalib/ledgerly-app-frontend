import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useCustomers, useCustomerActions } from "@/features/billing/hooks";
import { customerInputSchema, type Customer, type CustomerInput } from "@/features/billing/schemas";
import { toast } from "sonner";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customers — Ledgerly" }, { name: "description", content: "Manage customers." }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [open, setOpen] = useState(false);
  const customers = useCustomers();
  const { remove } = useCustomerActions();

  const filtered = customers.filter((c) => {
    const ql = q.toLowerCase();
    return !ql || c.name.toLowerCase().includes(ql) || c.email.toLowerCase().includes(ql);
  });

  return (
    <PageShell
      title="Customers"
      subtitle={`${customers.length} total`}
      action={
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />Add customer
        </Button>
      }
    >
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers" className="pl-9" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence initial={false}>
          {filtered.map((c) => (
            <motion.div key={c.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card className="shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-elegant)] transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{c.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{c.email}</p>
                      {c.company && <p className="text-xs text-muted-foreground mt-1">{c.company}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => { remove(c.id); toast.success("Deleted"); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {filtered.length === 0 && <p className="text-center text-sm text-muted-foreground py-12">No customers found.</p>}

      <CustomerDialog open={open} onOpenChange={setOpen} editing={editing} />
    </PageShell>
  );
}

function CustomerDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (v: boolean) => void; editing: Customer | null }) {
  const { add, update } = useCustomerActions();
  const form = useForm<CustomerInput>({
    resolver: zodResolver(customerInputSchema),
    values: editing ?? { name: "", email: "", company: "", phone: "" },
  });
  const { register, handleSubmit, formState: { errors }, reset } = form;

  const submit = (data: CustomerInput) => {
    if (editing) { update(editing.id, data); toast.success("Customer updated"); }
    else { add(data); toast.success("Customer added"); }
    reset(); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? "Edit customer" : "New customer"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <Field label="Name" error={errors.name?.message}><Input {...register("name")} /></Field>
          <Field label="Email" error={errors.email?.message}><Input type="email" {...register("email")} /></Field>
          <Field label="Company" error={errors.company?.message}><Input {...register("company")} /></Field>
          <Field label="Phone" error={errors.phone?.message}><Input {...register("phone")} /></Field>
          <DialogFooter><Button type="submit">{editing ? "Save" : "Create"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
