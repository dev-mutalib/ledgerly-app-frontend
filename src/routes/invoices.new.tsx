import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { InvoiceForm } from "@/features/billing/invoice-form";
import { PageShell } from "@/components/page-shell";
import { useInvoiceActions } from "@/features/billing/hooks";
import { toast } from "sonner";

export const Route = createFileRoute("/invoices/new")({
  head: () => ({ meta: [{ title: "New Invoice — Ledgerly" }] }),
  component: NewInvoice,
});

function NewInvoice() {
  const navigate = useNavigate();
  const { add } = useInvoiceActions();
  return (
    <PageShell title="New Invoice" subtitle="Create a draft and send it later">
      <InvoiceForm
        onSubmit={(data) => {
          const created = add(data);
          toast.success(`${created.number} created`);
          navigate({ to: "/invoices/$id", params: { id: created.id } });
        }}
      />
    </PageShell>
  );
}
