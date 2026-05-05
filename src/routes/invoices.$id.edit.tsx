import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { InvoiceForm } from "@/features/billing/invoice-form";
import { useInvoice, useInvoiceActions } from "@/features/billing/hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/invoices/$id/edit")({
  component: EditInvoice,
});

function EditInvoice() {
  const { id } = Route.useParams();
  const inv = useInvoice(id);
  const { update } = useInvoiceActions();
  const navigate = useNavigate();

  if (!inv) return <PageShell title="Invoice not found"><Button asChild variant="outline"><Link to="/invoices">Back</Link></Button></PageShell>;

  return (
    <PageShell title={`Edit ${inv.number}`}>
      <InvoiceForm
        defaultValues={inv}
        submitLabel="Save changes"
        onSubmit={(data) => {
          update(inv.id, data);
          toast.success("Invoice updated");
          navigate({ to: "/invoices/$id", params: { id: inv.id } });
        }}
      />
    </PageShell>
  );
}
