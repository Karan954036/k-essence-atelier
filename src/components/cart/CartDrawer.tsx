import { Link } from "@tanstack/react-router";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-store";
import { inr } from "@/lib/catalog";
import { toast } from "sonner";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    totalItems,
    subtotal,
    totalMrp,
    totalSavings,
    freeShippingThreshold,
    shippingRemaining,
  } = useCart();

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleCheckout = () => {
    toast.success("Ready for Checkout", {
      description: `Proceeding with ${totalItems} item(s) • Total ${inr(subtotal)}. Payment gateway integration scheduled in Phase 3.`,
    });
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent
        side="right"
        className="glass-panel flex w-full flex-col border-l border-gold/25 bg-obsidian/95 p-0 sm:max-w-md"
      >
        {/* Header */}
        <SheetHeader className="border-b border-border/80 px-6 py-5 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="h-5 w-5 text-gold" />
              <SheetTitle className="font-display text-xl tracking-wider text-ivory">
                SHOPPING BAG
              </SheetTitle>
            </div>
            <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-champagne">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </span>
          </div>

          {/* Free shipping progress bar */}
          <div className="mt-4 rounded-sm border border-border/60 bg-charcoal/40 p-3">
            <div className="flex items-center gap-2 text-xs">
              <Truck className="h-3.5 w-3.5 text-gold" />
              {shippingRemaining > 0 ? (
                <span className="text-muted-foreground">
                  Add <strong className="text-champagne">{inr(shippingRemaining)}</strong> for free
                  express delivery
                </span>
              ) : (
                <span className="font-medium text-champagne">
                  ✓ Complimentary insured delivery unlocked!
                </span>
              )}
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full bg-gradient-to-r from-bronze via-gold to-champagne transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </SheetHeader>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-charcoal/60 text-muted-foreground">
              <ShoppingBag className="h-8 w-8 stroke-1 text-gold/70" />
            </div>
            <h3 className="mt-4 font-display text-xl text-ivory">Your bag is empty</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Explore our hand-blended attars and signature perfumes crafted for those who leave a
              trace.
            </p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="light-sweep mt-6 inline-flex items-center gap-2 rounded-sm border border-gold/60 bg-gold/10 px-6 py-3 text-xs tracking-[0.2em] text-champagne uppercase transition hover:bg-gold/20"
            >
              <Link to="/shop" onClick={() => setIsCartOpen(false)}>
                Explore Collection
              </Link>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.map((item) => {
              const off = Math.round(((item.mrp - item.price) / item.mrp) * 100);
              return (
                <div
                  key={`${item.productSlug}-${item.variantLabel}`}
                  className="group relative flex gap-4 rounded-sm border border-border/70 bg-card/40 p-3.5 transition-colors hover:border-gold/30"
                >
                  {/* Thumbnail / Tint bottle */}
                  <Link
                    to="/product/$slug"
                    params={{ slug: item.productSlug }}
                    onClick={() => setIsCartOpen(false)}
                    className="relative flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border"
                    style={{
                      background: `radial-gradient(70% 70% at 50% 35%, ${item.tint} 0%, oklch(0.12 0.008 60) 80%)`,
                    }}
                  >
                    <div
                      className="h-10 w-5 rounded-xs border border-champagne/30"
                      style={{
                        background:
                          "linear-gradient(150deg, oklch(1 0 0 / 20%), transparent 50%, oklch(1 0 0 / 10%))",
                      }}
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to="/product/$slug"
                          params={{ slug: item.productSlug }}
                          onClick={() => setIsCartOpen(false)}
                          className="font-display text-base leading-snug text-ivory transition hover:text-champagne"
                        >
                          {item.name}
                        </Link>
                        <button
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeItem(item.productSlug, item.variantLabel)}
                          className="text-muted-foreground/60 transition hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
                        {item.category} •{" "}
                        <span className="text-gold-soft">{item.variantLabel}</span>
                      </p>
                    </div>

                    {/* Price and Stepper */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 rounded-sm border border-border bg-charcoal/80 px-2 py-1">
                        <button
                          aria-label="Decrease quantity"
                          onClick={() =>
                            updateQuantity(item.productSlug, item.variantLabel, item.quantity - 1)
                          }
                          className="text-muted-foreground hover:text-ivory"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-5 text-center text-xs font-medium text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          aria-label="Increase quantity"
                          onClick={() =>
                            updateQuantity(item.productSlug, item.variantLabel, item.quantity + 1)
                          }
                          className="text-muted-foreground hover:text-ivory"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-display text-sm text-champagne">
                          {inr(item.price * item.quantity)}
                        </p>
                        {off > 0 && (
                          <p className="text-[0.65rem] text-muted-foreground line-through">
                            {inr(item.mrp * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border bg-charcoal/30 px-6 py-5">
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
                <span>
                  {shippingRemaining === 0 ? (
                    <span className="text-champagne font-medium">FREE</span>
                  ) : (
                    inr(99)
                  )}
                </span>
              </div>
              <div className="hairline-gold my-2 h-px" />
              <div className="flex justify-between text-sm font-medium text-foreground">
                <span className="font-display text-base text-ivory">Estimated Total</span>
                <span className="font-display text-lg text-champagne">
                  {inr(subtotal + (shippingRemaining === 0 ? 0 : 99))}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="light-sweep mt-5 flex w-full items-center justify-center gap-2 rounded-sm border border-gold bg-gradient-to-r from-gold/90 to-champagne/90 py-3.5 text-xs font-medium tracking-[0.24em] text-obsidian uppercase shadow-md transition hover:brightness-110"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <div className="mt-4 flex items-center justify-center gap-3 text-[0.65rem] text-muted-foreground/80">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-gold" />
                100% Authentic Handcrafted
              </span>
              <span>•</span>
              <span>Safe & Secure Checkout</span>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
