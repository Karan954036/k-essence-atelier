import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Star, Box } from "lucide-react";
import type { DemoProduct } from "@/data/demo-catalog";
import type { CatalogProduct } from "@/lib/catalog";
import { inr } from "@/lib/catalog";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: CatalogProduct | DemoProduct;
  className?: string;
};

/**
 * Luxury product card. When a product has a real uploaded GLB/GLTF model it is
 * labelled "3D VIEW"; otherwise the animated tint visual is labelled clearly as
 * a placeholder visual.
 */
export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const isSaved = isInWishlist(product.slug);
  const categoryName = "categoryName" in product ? product.categoryName : product.category;

  const defaultVariantLabel =
    "variants" in product && product.variants.length > 0
      ? product.variants[0]!.label
      : "sizes" in product && product.sizes.length > 0
        ? product.sizes[0]!.label
        : "Standard";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addItem({
      productId: product.slug,
      productSlug: product.slug,
      name: product.name,
      variantLabel: defaultVariantLabel,
      price: product.price,
      mrp: product.mrp,
      tint: product.tint,
      category: categoryName,
      modelUrl: product.modelUrl ?? null,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.slug, product.name);
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-sm border border-border bg-card/60 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/40",
        className,
      )}
      style={{ boxShadow: "var(--shadow-lift)" }}
    >
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="light-sweep relative aspect-4/5 overflow-hidden block cursor-pointer"
        aria-label={`View details for ${product.name}`}
      >
        <div
          className="absolute inset-0 transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          style={{
            background: `radial-gradient(65% 60% at 50% 35%, ${product.tint} 0%, oklch(0.12 0.008 60) 72%)`,
          }}
        />
        {/* Bottle silhouette placeholder */}
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

        {/* Top badging & Wishlist button */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3 z-10">
          {product.badge ? (
            <span className="rounded-sm border border-gold/40 bg-obsidian/70 px-2 py-1 text-[0.55rem] tracking-[0.2em] text-gold-soft uppercase">
              {product.badge}
            </span>
          ) : (
            <span />
          )}
          <button
            type="button"
            aria-label={`Add ${product.name} to wishlist`}
            onClick={handleWishlist}
            className={cn(
              "rounded-full border p-2 transition",
              isSaved
                ? "border-gold bg-gold/20 text-gold shadow-sm"
                : "border-border bg-obsidian/70 text-foreground/70 hover:border-gold/50 hover:text-gold",
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", isSaved && "fill-gold")} />
          </button>
        </div>

        {/* Bottom indicator */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-3 z-10">
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
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="eyebrow text-[0.55rem]">{product.family}</p>
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="font-display text-xl leading-tight text-ivory transition hover:text-champagne"
        >
          {product.name}
        </Link>
        <p className="text-xs text-muted-foreground">{categoryName}</p>

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
            type="button"
            disabled={!product.inStock}
            onClick={handleAddToCart}
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
