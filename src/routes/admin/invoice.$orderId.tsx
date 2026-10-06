import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft } from "lucide-react";
import { getOrder } from "@/lib/admin.functions";
import { InvoiceDocument } from "@/components/orders/InvoiceDocument";

export const Route = createFileRoute("/admin/invoice/$orderId")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({ print: s["print"] === 1 || s["print"] === "1" ? 1 : undefined }),
  head: () => ({ meta: [{ title: "Admin — Invoice | K ESSENCE" }] }),
  component: AdminInvoicePage,
});

function AdminInvoicePage() {
  const { orderId } = Route.useParams();
  const { print } = Route.useSearch();
  const fetcher = useServerFn(getOrder);
  const query = useQuery({
    queryKey: ["admin-invoice", orderId],
    queryFn: () => fetcher({ data: { id: orderId } }),
    retry: false,
  });

  if (query.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading invoice…
      </div>
    );
  }
  if (query.isError || !query.data?.order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-serif text-2xl text-foreground">Invoice not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">{(query.error as Error)?.message}</p>
        <Link to="/admin/orders" className="mt-6 inline-block text-sm text-primary hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <InvoiceDocument
      order={query.data.order}
      autoPrint={print === 1}
      nav={
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs tracking-wider text-neutral-400 uppercase transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Admin Orders
        </Link>
      }
    />
  );
}
