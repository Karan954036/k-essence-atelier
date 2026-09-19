import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteShell } from "@/components/site/SiteShell";
import { getMyOrder } from "@/lib/orders.functions";
import { inr } from "@/lib/catalog";
import { statusLabel, paymentMethodLabel } from "@/lib/order-status";
import { OrderTimeline } from "@/components/orders/OrderTimeline";

export const Route = createFileRoute("/order/$orderNumber")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Order Confirmation | K ESSENCE" },
      { name: "description", content: "Your K ESSENCE order details, invoice number and delivery tracking." },
      { property: "og:title", content: "Order Confirmation | K ESSENCE" },
      { property: "og:description", content: "Track your K ESSENCE fragrance order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrderConfirmation,
});

function OrderConfirmation() {
  const { orderNumber } = useParams({ from: "/order/$orderNumber" });
  const fetcher = useServerFn(getMyOrder);
  const query = useQuery({
    queryKey: ["my-order", orderNumber],
    queryFn: () => fetcher({ data: { orderNumber } }),
    retry: false,
  });

  if (query.isLoading) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-muted-foreground">Loading order…</div>
      </SiteShell>
    );
  }

  if (query.isError) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="font-display text-2xl text-ivory">Order not found</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in with the account used to place this order.
          </p>
          <Link to="/account/orders" className="mt-6 inline-block text-xs tracking-[0.2em] text-champagne uppercase">
            My Orders
          </Link>
        </div>
      </SiteShell>
    );
  }

  const { order, history } = query.data as any;

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <p className="eyebrow text-[0.7rem] text-gold">Thank you</p>
        <h1 className="mt-2 font-display text-3xl text-ivory">Order {order.order_number}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Invoice {order.invoice_number ?? "—"} • {paymentMethodLabel(order.payment_method)} •{" "}
          {statusLabel(order.status)}
        </p>
        <div className="hairline-gold mt-5 h-px" />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <section className="rounded-sm border border-border/70 bg-card/30 p-5">
              <h2 className="font-display text-lg text-ivory">Items</h2>
              <div className="mt-4 space-y-3">
                {(order.order_items ?? []).map((it: any) => (
                  <div key={it.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      <span className="text-ivory">{it.product_name}</span>
                      <br />
                      {it.variant_label} × {it.quantity}
                    </span>
                    <span className="text-champagne">
                      {inr(Number(it.unit_price) * Number(it.quantity))}
                    </span>
                  </div>
                ))}
              </div>
              <div className="hairline-gold my-4 h-px" />
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-foreground">{inr(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{Number(order.shipping_fee) === 0 ? "FREE" : inr(Number(order.shipping_fee))}</span>
                </div>
                <div className="flex justify-between pt-2 text-sm">
                  <span className="font-display text-base text-ivory">Total</span>
                  <span className="font-display text-lg text-champagne">{inr(Number(order.total))}</span>
                </div>
              </div>
            </section>

            <section className="rounded-sm border border-border/70 bg-card/30 p-5 text-sm text-muted-foreground">
              <h2 className="font-display text-lg text-ivory">Delivery Address</h2>
              <p className="mt-3">
                <strong className="text-ivory">{order.ship_full_name}</strong> • {order.ship_mobile}
                <br />
                {order.ship_address}, {order.ship_city}, {order.ship_state} {order.ship_pincode}
                <br />
                {order.ship_country}
              </p>
            </section>

            <div className="flex gap-4 text-xs tracking-[0.2em] uppercase">
              <Link to="/account/orders" className="text-champagne">
                My Orders
              </Link>
              <Link
                to="/account/orders/$orderNumber/invoice"
                params={{ orderNumber: order.order_number }}
                className="text-champagne"
              >
                View Invoice
              </Link>
            </div>
          </div>

          <aside className="h-fit rounded-sm border border-border/70 bg-card/30 p-5">
            <h2 className="font-display text-lg text-ivory">Tracking</h2>
            <div className="mt-4">
              <OrderTimeline status={order.status} history={history} />
            </div>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}

export default OrderConfirmation;
