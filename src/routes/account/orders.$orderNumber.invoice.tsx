import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyOrder } from "@/lib/orders.functions";
import { ArrowLeft } from "lucide-react";
import { InvoiceDocument } from "@/components/orders/InvoiceDocument";

export const Route = createFileRoute("/account/orders/$orderNumber/invoice")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Invoice | K ESSENCE" },
      { name: "description", content: "Official tax invoice for your K ESSENCE purchase." },
      { property: "og:title", content: "Tax Invoice | K ESSENCE" },
    ],
  }),
  component: OrderInvoicePage,
});

function OrderInvoicePage() {
  const { orderNumber } = useParams({ from: "/account/orders/$orderNumber/invoice" });
  const fetcher = useServerFn(getMyOrder);
  const query = useQuery({
    queryKey: ["my-order-invoice", orderNumber],
    queryFn: () => fetcher({ data: { orderNumber } }),
    retry: false,
  });

  if (query.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Generating invoice…
      </div>
    );
  }

  if (query.isError || !query.data?.order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl text-foreground">Invoice Not Found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The requested invoice could not be located or you are not authorized to view it.
        </p>
        <Link
          to="/account/orders"
          className="mt-6 inline-block rounded border border-border px-5 py-2 text-xs tracking-wider uppercase"
        >
          Back to My Orders
        </Link>
      </div>
    );
  }

  const { order } = query.data;
  return (
    <InvoiceDocument
      order={order}
      nav={
        <>
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs tracking-wider text-neutral-400 uppercase transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> My Orders
          </Link>
          <span className="text-neutral-600">|</span>
          <Link
            to="/order/$orderNumber"
            params={{ orderNumber: order.order_number }}
            className="text-xs tracking-wider text-neutral-400 uppercase transition hover:text-white"
          >
            Order Details
          </Link>
        </>
      }
    />
  );
}

export default OrderInvoicePage;
