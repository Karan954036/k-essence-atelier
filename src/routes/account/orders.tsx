import { createFileRoute, Link, useNavigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { useAuth } from "@/lib/auth";
import { listMyOrders } from "@/lib/orders.functions";
import { inr } from "@/lib/catalog";
import { statusLabel, paymentMethodLabel, isException } from "@/lib/order-status";
import { Package, FileText, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/account/orders")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "My Orders | K ESSENCE" },
      { name: "description", content: "View your K ESSENCE order history, status and invoices." },
      { property: "og:title", content: "My Orders | K ESSENCE" },
    ],
  }),
  component: MyOrdersPage,
});

function MyOrdersPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/account/orders") {
    return <Outlet />;
  }

  return <MyOrdersList />;
}

function MyOrdersList() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login", search: { returnTo: "/account/orders" } as never });
    }
  }, [authLoading, user, navigate]);

  const fetchOrders = useServerFn(listMyOrders);
  const query = useQuery({
    queryKey: ["my-orders", user?.id ?? null],
    enabled: Boolean(user?.id),
    queryFn: () => fetchOrders({}),
  });

  if (authLoading || !user) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-4xl px-4 py-16 text-sm text-muted-foreground">
          Checking your credentials…
        </div>
      </SiteShell>
    );
  }

  const orders = (query.data as any[]) ?? [];

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow text-[0.7rem] text-gold">Account</p>
            <h1 className="font-display text-3xl text-ivory">My Orders</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track your fragrance deliveries and view invoices.
            </p>
          </div>
          <Link
            to="/account"
            className="text-xs tracking-[0.18em] text-champagne uppercase hover:text-gold"
          >
            ← Account Details
          </Link>
        </div>

        <div className="hairline-gold mt-6 h-px" />

        {query.isLoading ? (
          <div className="py-20 text-center text-sm text-muted-foreground">Loading your orders…</div>
        ) : orders.length === 0 ? (
          <div className="mx-auto max-w-md py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-gold/5 text-champagne">
              <Package className="h-6 w-6" />
            </div>
            <h2 className="font-display text-2xl text-ivory">No orders placed yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Discover our collection of artisanal perfumes and signature attars.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-sm border border-gold/60 bg-gold/10 px-6 py-2.5 text-xs tracking-[0.2em] text-champagne uppercase transition hover:bg-gold/20"
            >
              Explore Collection <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {orders.map((order) => {
              const dateStr = new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              const items = (order.order_items as any[]) ?? [];
              const isEx = isException(order.status);

              return (
                <div
                  key={order.id}
                  className="rounded-sm border border-border/70 bg-card/30 p-6 transition hover:border-gold/30"
                >
                  <div className="flex flex-col justify-between gap-4 border-b border-border/50 pb-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-sm font-semibold tracking-wider text-ivory">
                          {order.order_number}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium tracking-wide uppercase ${
                            order.status === "delivered"
                              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : isEx
                                ? "border border-rose-500/30 bg-rose-500/10 text-rose-400"
                                : "border border-gold/40 bg-gold/10 text-champagne"
                          }`}
                        >
                          {statusLabel(order.status)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {paymentMethodLabel(order.payment_method)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Placed on {dateStr}
                        {order.invoice_number ? ` • Invoice ${order.invoice_number}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 sm:text-right">
                      <div>
                        <div className="text-xs text-muted-foreground">Total Amount</div>
                        <div className="font-display text-lg text-champagne">
                          {inr(Number(order.total))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between text-sm text-muted-foreground"
                      >
                        <div>
                          <span className="text-ivory">{it.product_name}</span>{" "}
                          <span className="text-xs text-muted-foreground/80">({it.variant_label})</span>
                          <span className="ml-2 text-xs">× {it.quantity}</span>
                        </div>
                        <div className="text-foreground">
                          {inr(Number(it.unit_price) * Number(it.quantity))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
                    <div className="text-xs text-muted-foreground">
                      Delivery to: <span className="text-ivory">{order.ship_full_name ?? order.customer_name}</span> ({order.ship_city}, {order.ship_state})
                    </div>
                    <div className="flex items-center gap-4 text-xs tracking-[0.18em] uppercase">
                      <Link
                        to="/order/$orderNumber"
                        params={{ orderNumber: order.order_number }}
                        className="inline-flex items-center gap-1.5 text-champagne hover:text-gold"
                      >
                        Track Order <ArrowRight className="h-3 w-3" />
                      </Link>
                      <Link
                        to="/account/orders/$orderNumber/invoice"
                        params={{ orderNumber: order.order_number }}
                        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-ivory"
                      >
                        <FileText className="h-3.5 w-3.5" /> Invoice
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SiteShell>
  );
}

export default MyOrdersPage;
