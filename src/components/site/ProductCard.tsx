import { Heart, ShoppingBag, Star, Box } from "lucide-react";
import type { DemoProduct } from "@/data/demo-catalog";
import { cn } from "@/lib/utils";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * Luxury product card. When a product has a real uploaded GLB/GLTF model it is
 * labelled "3D VIEW"; otherwise the animated tint visual is labelled clearly as
 * a placeholder visual (no real product photography yet).
 */
export function ProductCard({ product, className }: { product: DemoProduct; className?: string }) {
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-sm border border-border bg-card/60 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/40",
        className,
      )}
      style={{ boxShadow: "var(--shadow-lift)" }}
    >
      <div className="light-sweep relative aspect-4/5 overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          style={{
            background: `radial-gradient(65% 60% at 50% 35%, ${product.tint} 0%, oklch(0.12 0.008 60) 72%)`,
          }}
        />
        {/* Bottle silhouette placeholder — replaced by real media / GLB from Admin. */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="h-[52%] w-[26%] rounded-[14%/8%] border border-champagne/25 transition-transform duration-700 group-hover:-translate-y-1.5"
            style={{
              background:
                "linear-gradient(150deg, oklch(1 0 0 / 16%), transparent 45%, oklch(1 0 0 / 8%))",
              backdropFilter: "blur(2px)",
            }}
          >
            <div className="mx-auto -mt-3 h-3 w-1/3 rounded-sm bg-gold/70" />
          </div>
        </div>

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {product.badge ? (
            <span className="rounded-sm border border-gold/40 bg-obsidian/70 px-2 py-1 text-[0.55rem] tracking-[0.2em] text-gold-soft uppercase">
              {product.badge}
            </span>
          ) : (
            <span />
          )}
          <button
            aria-label={`Add ${product.name} to wishlist`}
            className="rounded-full border border-border bg-obsidian/70 p-2 text-foreground/70 transition hover:border-gold/50 hover:text-gold"
          >
            <Heart className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-3">
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-obsidian/70 px-2 py-1 text-[0.5rem] tracking-[0.18em] text-muted-foreground uppercase">
            <Box className="h-3 w-3" />
            {product.modelUrl ? "3D view" : "Placeholder visual"}
          </span>
          {!product.inStock && (
            <span className="rounded-sm bg-obsidian/80 px-2 py-1 text-[0.5rem] tracking-[0.18em] text-muted-foreground uppercase">
              Sold out
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="eyebrow text-[0.55rem]">{product.family}</p>
        <h3 className="font-display text-xl leading-tight text-ivory">{product.name}</h3>
        <p className="text-xs text-muted-foreground">{product.category}</p>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          <span className="text-champagne">{product.rating.toFixed(1)}</span>
          <span>({product.reviews})</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div>
            <p className="font-display text-lg text-champagne">{inr(product.price)}</p>
            <p className="text-[0.7rem] text-muted-foreground">
              <span className="line-through">{inr(product.mrp)}</span>
              {off > 0 && <span className="ml-2 text-bronze">{off}% off</span>}
            </p>
          </div>
          <button
            disabled={!product.inStock}
            className="inline-flex items-center gap-2 rounded-sm border border-gold/40 px-3 py-2 text-[0.6rem] tracking-[0.2em] text-gold-soft uppercase transition hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
