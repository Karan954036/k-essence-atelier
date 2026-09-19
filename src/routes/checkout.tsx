import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth";
import { inr } from "@/lib/catalog";
import { placeOrder, listMyAddresses } from "@/lib/orders.functions";

export const Route = createFileRoute("/checkout")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Secure Checkout | K ESSENCE" },
      {
        name: "description",
        content:
          "Complete your K ESSENCE order — confirm your shipping address and pay with Cash on Delivery.",
      },
      { property: "og:title", content: "Secure Checkout | K ESSENCE" },
      {
        property: "og:description",
        content: "Confirm your shipping details and place your K ESSENCE fragrance order.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Checkout,
});

const FREE_SHIPPING = 1499;
const SHIPPING_FEE = 99;

function Checkout() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { items, subtotal, totalSavings, clearCart, totalItems } = useCart();

  const shippingFee = subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;

  const addressesFn = useServerFn(listMyAddresses);
  const addresses = useQuery({
    queryKey: ["my-addresses", user?.id ?? null],
    enabled: Boolean(user?.id),
    queryFn: () => addressesFn({}),
  });

  const submit = useServerFn(placeOrder);
  const [busy, setBusy] = useState(false);
  const idempotencyKey = useRef(
    `ke-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
  );

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    saveAddress: true,
  });
  const [selectedAddress, setSelectedAddress] = useState<string>("new");

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/login", search: { returnTo: "/checkout" } as never });
    }
  }, [isLoading, user, navigate]);

  useEffect(() => {
    if (user?.email && !form.email) {
      setForm((f) => ({
        ...f,
        email: user.email,
        fullName: f.fullName || (user.user_metadata?.full_name ?? ""),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const saved = useMemo(() => (addresses.data as any[]) ?? [], [addresses.data]);

  function useSaved(id: string) {
    setSelectedAddress(id);
    const a = saved.find((s) => s.id === id);
    if (!a) return;
    setForm((f) => ({
      ...f,
      fullName: a.full_name ?? f.fullName,
      mobile: a.mobile ?? "",
      address: a.address ?? "",
      city: a.city ?? "",
      state: a.state ?? "",
      pincode: a.pincode ?? "",
      country: a.country ?? "India",
      saveAddress: false,
    }));
  }

  async function onPlaceOrder() {
    if (items.length === 0) return;
    setBusy(true);
    try {
      const result = await submit({
        data: {
          items: items.map((i) => ({
            productSlug: i.productSlug,
            variantLabel: i.variantLabel,
            quantity: i.quantity,
          })),
          contact: { fullName: form.fullName, mobile: form.mobile, email: form.email || undefined },
          address: {
            address: form.address,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            country: form.country,
          },
          saveAddress: form.saveAddress && selectedAddress === "new",
          idempotencyKey: idempotencyKey.current,
        },
      });
      clearCart();
      navigate({ to: "/order/$orderNumber", params: { orderNumber: result.orderNumber } });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not place your order");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading || !user) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-muted-foreground">Loading…</div>
      </SiteShell>
    );
  }

  if (items.length === 0) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="font-display text-3xl text-ivory">Your bag is empty</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Add a fragrance to your bag before checking out.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-block rounded-sm border border-gold/60 bg-gold/10 px-7 py-3 text-xs tracking-[0.2em] text-champagne uppercase"
          >
            Explore Collection
          </Link>
        </div>
      </SiteShell>
    );
  }

  const field =
    "w-full rounded-sm border border-border bg-charcoal/40 px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold/60";

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-display text-3xl tracking-wide text-ivory">Checkout</h1>
        <div className="hairline-gold mt-4 h-px" />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-8">
            {saved.length > 0 && (
              <section>
                <h2 className="eyebrow mb-3 text-[0.7rem]">Saved Addresses</h2>
                <div className="space-y-2">
                  {saved.map((a) => (
                    <label
                      key={a.id}
                      className="flex cursor-pointer gap-3 rounded-sm border border-border/70 bg-card/30 p-3 text-sm"
                    >
                      <input
                        type="radio"
                        name="saved-address"
                        checked={selectedAddress === a.id}
                        onChange={() => useSaved(a.id)}
                      />
                      <span className="text-muted-foreground">
                        <strong className="text-ivory">{a.full_name}</strong> • {a.mobile}
                        <br />
                        {a.address}, {a.city}, {a.state} {a.pincode}
                      </span>
                    </label>
                  ))}
                  <label className="flex cursor-pointer items-center gap-3 rounded-sm border border-border/70 bg-card/30 p-3 text-sm text-ivory">
                    <input
                      type="radio"
                      name="saved-address"
                      checked={selectedAddress === "new"}
                      onChange={() => setSelectedAddress("new")}
                    />
                    Use a new address
                  </label>
                </div>
              </section>
            )}

            <section>
              <h2 className="eyebrow mb-3 text-[0.7rem]">Contact & Shipping</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className={field}
                  placeholder="Full name"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
                <input
                  className={field}
                  placeholder="Mobile number"
                  inputMode="numeric"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                />
                <input
                  className={`${field} sm:col-span-2`}
                  placeholder="Email (for order updates)"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <textarea
                  className={`${field} sm:col-span-2`}
                  rows={3}
                  placeholder="Flat / house no., street, area"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
                <input
                  className={field}
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
                <input
                  className={field}
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
                <input
                  className={field}
                  placeholder="Pincode"
                  inputMode="numeric"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                />
                <input
                  className={field}
                  placeholder="Country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </div>
              {selectedAddress === "new" && (
                <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={form.saveAddress}
                    onChange={(e) => setForm({ ...form, saveAddress: e.target.checked })}
                  />
                  Save this address for future orders
                </label>
              )}
            </section>

            <section>
              <h2 className="eyebrow mb-3 text-[0.7rem]">Payment Method</h2>
              <div className="space-y-2">
                <label className="flex items-center gap-3 rounded-sm border border-gold/50 bg-gold/5 p-3 text-sm text-ivory">
                  <input type="radio" checked readOnly name="payment" />
                  Cash on Delivery
                </label>
                <div className="flex items-center gap-3 rounded-sm border border-border/60 bg-card/20 p-3 text-sm text-muted-foreground/70">
                  <input type="radio" disabled />
                  UPI / Card — coming soon
                </div>
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-sm border border-border/70 bg-card/30 p-5">
            <h2 className="font-display text-lg text-ivory">Order Summary</h2>
            <div className="mt-4 space-y-3">
              {items.map((i) => (
                <div key={`${i.productSlug}-${i.variantLabel}`} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    <span className="text-ivory">{i.name}</span>
                    <br />
                    {i.variantLabel} × {i.quantity}
                  </span>
                  <span className="text-champagne">{inr(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="hairline-gold my-4 h-px" />
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} items)</span>
                <span className="text-foreground">{inr(subtotal)}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-gold">
                  <span>Special Savings</span>
                  <span>-{inr(totalSavings)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? "FREE" : inr(shippingFee)}</span>
              </div>
              <div className="hairline-gold my-2 h-px" />
              <div className="flex justify-between text-sm font-medium">
                <span className="font-display text-base text-ivory">Total Payable</span>
                <span className="font-display text-lg text-champagne">{inr(total)}</span>
              </div>
            </div>

            <button
              onClick={onPlaceOrder}
              disabled={busy}
              className="light-sweep mt-6 w-full rounded-sm border border-gold bg-gradient-to-r from-gold/90 to-champagne/90 py-3.5 text-xs font-medium tracking-[0.24em] text-obsidian uppercase disabled:opacity-60"
            >
              {busy ? "Placing order…" : "Place Order • Cash on Delivery"}
            </button>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}

export default Checkout;
