import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import {
  Star,
  ShoppingBag,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Check,
  Plus,
  Minus,
  Clock,
  Wind,
  Layers,
  FlaskConical,
  Award,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { ProductCard } from "@/components/site/ProductCard";
import { Product3DViewer } from "@/components/product/Product3DViewer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  productBySlugQuery,
  productsQuery,
  fetchRelatedProducts,
  inr,
  type CatalogProduct,
  type CatalogVariant,
} from "@/lib/catalog";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { recordRecentlyViewed, useRecentlyViewed } from "@/lib/recently-viewed";
import { demoReviews } from "@/data/demo-catalog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params, context }) => {
    const product = await context.queryClient.ensureQueryData(productBySlugQuery(params.slug));
    if (!product) {
      throw notFound();
    }
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    return {
      meta: [
        { title: `${p?.name || "Product"} | K ESSENCE Atelier` },
        {
          name: "description",
          content:
            p?.description ||
            "Artisanal luxury perfumes and traditional attars hand-blended by K ESSENCE.",
        },
      ],
    };
  },
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const { data: product } = useQuery(productBySlugQuery(slug));
  const { data: allProducts = [] } = useQuery(productsQuery);

  const { addItem, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Track recently viewed
  const recentlyViewedSlugs = useRecentlyViewed(product?.slug);

  // Selected Variant & Quantity
  const [selectedVariant, setSelectedVariant] = useState<CatalogVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Initialize first variant when product loads
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0] ?? null);
      setQuantity(1);
    }
  }, [product]);

  // Related products
  const relatedProducts = useMemo(() => {
    if (!product || allProducts.length === 0) return [];
    return fetchRelatedProducts(product, allProducts, 4);
  }, [product, allProducts]);

  // Recently viewed products
  const recentlyViewedProducts = useMemo(() => {
    if (allProducts.length === 0 || !recentlyViewedSlugs.length) return [];
    return allProducts.filter(
      (p) => recentlyViewedSlugs.includes(p.slug) && p.slug !== product?.slug,
    );
  }, [allProducts, recentlyViewedSlugs, product?.slug]);

  if (!product) {
    return (
      <SiteShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <h1 className="font-display text-3xl text-ivory">Fragrance Not Found</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The fragrance you are seeking may have been archived or is temporarily unavailable.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-sm border border-gold/60 bg-gold/10 px-6 py-3 text-xs tracking-widest text-champagne uppercase hover:bg-gold/20"
          >
            Explore Catalogue
          </Link>
        </div>
      </SiteShell>
    );
  }

  // Active pricing based on selected variant or base product
  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const activeMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
  const activeStock = selectedVariant ? selectedVariant.stock : product.inStock ? 20 : 0;
  const isOutOfStock = activeStock <= 0 || !product.inStock;
  const savings = Math.max(0, activeMrp - activePrice);
  const savingsPercent = Math.round((savings / activeMrp) * 100);

  const isSaved = isInWishlist(product.slug);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(
      {
        productId: product.id,
        productSlug: product.slug,
        name: product.name,
        variantLabel: selectedVariant?.label || "Standard",
        price: activePrice,
        mrp: activeMrp,
        tint: product.tint,
        category: product.categoryName,
        modelUrl: product.modelUrl,
      },
      quantity,
    );
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(
      {
        productId: product.id,
        productSlug: product.slug,
        name: product.name,
        variantLabel: selectedVariant?.label || "Standard",
        price: activePrice,
        mrp: activeMrp,
        tint: product.tint,
        category: product.categoryName,
        modelUrl: product.modelUrl,
      },
      quantity,
    );
    openCart();
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link Copied to Clipboard", {
        description: "Share this exquisite fragrance with connoisseurs.",
      });
    }
  };

  return (
    <SiteShell>
      {/* Breadcrumb Navigation */}
      <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Link to="/" className="transition hover:text-champagne">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
          <Link to="/shop" className="transition hover:text-champagne">
            Shop
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
          <Link
            to="/shop"
            search={{ category: product.categoryName }}
            className="transition hover:text-champagne"
          >
            {product.categoryName}
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
          <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* Main Product Showcase Section */}
      <section className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* Left Column: Interactive 3D Bottle Showcase & Studio Visuals */}
          <div className="relative">
            <Product3DViewer
              name={product.name}
              tint={product.tint}
              modelUrl={product.modelUrl}
              badge={product.badge}
              family={product.family}
            />

            {/* Guaranteed Authenticity Callout */}
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-sm border border-border/70 bg-card/30 p-3">
                <Award className="mx-auto h-4 w-4 text-gold" />
                <p className="mt-1 text-[0.68rem] font-medium text-ivory">Pure Essence</p>
                <p className="text-[0.6rem] text-muted-foreground">High oil concentration</p>
              </div>
              <div className="rounded-sm border border-border/70 bg-card/30 p-3">
                <ShieldCheck className="mx-auto h-4 w-4 text-gold" />
                <p className="mt-1 text-[0.68rem] font-medium text-ivory">100% Authentic</p>
                <p className="text-[0.6rem] text-muted-foreground">Direct from Atelier</p>
              </div>
              <div className="rounded-sm border border-border/70 bg-card/30 p-3">
                <Truck className="mx-auto h-4 w-4 text-gold" />
                <p className="mt-1 text-[0.68rem] font-medium text-ivory">Express Delivery</p>
                <p className="text-[0.6rem] text-muted-foreground">Insured & Tamper-proof</p>
              </div>
            </div>
          </div>

          {/* Right Column: Product Narrative & Purchasing Architecture */}
          <div className="flex flex-col">
            {/* Category & Badge */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="eyebrow text-xs">{product.categoryName}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-xs text-gold-soft">{product.gender}</span>
              </div>
              {product.badge && (
                <span className="rounded-sm border border-gold/50 bg-gold/10 px-2.5 py-0.5 text-[0.6rem] tracking-[0.2em] text-gold uppercase">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="mt-3 font-display text-4xl leading-tight text-ivory sm:text-5xl">
              {product.name}
            </h1>

            {/* Ratings Summary */}
            <div className="mt-3 flex items-center gap-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i < Math.floor(product.rating)
                        ? "fill-gold text-gold"
                        : "fill-muted text-muted-foreground/40",
                    )}
                  />
                ))}
              </div>
              <span className="font-medium text-champagne">{product.rating.toFixed(1)}</span>
              <span>•</span>
              <a href="#reviews" className="underline hover:text-champagne transition">
                {product.reviews} customer reviews
              </a>
            </div>

            {/* Pricing Tier */}
            <div className="mt-6 flex items-baseline gap-3 border-y border-border/70 py-4">
              <span className="font-display text-3xl text-champagne sm:text-4xl">
                {inr(activePrice)}
              </span>
              {activeMrp > activePrice && (
                <>
                  <span className="text-sm text-muted-foreground line-through sm:text-base">
                    {inr(activeMrp)}
                  </span>
                  <span className="rounded-sm bg-bronze/20 px-2 py-0.5 text-xs font-medium text-champagne border border-bronze/30">
                    SAVE {savingsPercent}% ({inr(savings)})
                  </span>
                </>
              )}
              <span className="ml-auto text-[0.7rem] text-muted-foreground/80">
                Inclusive of all taxes
              </span>
            </div>

            {/* Short Narrative */}
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground/90">
              {product.description}
            </p>

            {/* Variant / Size Selection */}
            {product.variants.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="tracking-wider uppercase text-ivory font-medium">
                    Available Sizes / Volumes:
                  </span>
                  <span className="text-gold-soft">
                    Selected: {selectedVariant?.label} ({inr(activePrice)})
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariant?.label === variant.label;
                    return (
                      <button
                        key={variant.label}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={cn(
                          "relative flex min-w-24 flex-col items-center justify-center rounded-sm border px-4 py-2.5 text-center transition",
                          isSelected
                            ? "border-gold bg-gold/15 text-champagne shadow-md"
                            : "border-border bg-card/40 text-muted-foreground hover:border-gold/40 hover:text-foreground",
                        )}
                      >
                        <span className="text-xs font-medium">{variant.label}</span>
                        <span className="text-[0.65rem] opacity-80">{inr(variant.price)}</span>
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-obsidian">
                            <Check className="h-2.5 w-2.5 stroke-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock Availability Indicator */}
            <div className="mt-6 flex items-center gap-2 text-xs">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  !isOutOfStock ? "bg-emerald-400 animate-pulse" : "bg-destructive",
                )}
              />
              {!isOutOfStock ? (
                <span className="text-emerald-400 font-medium">
                  In Stock • Freshly Matured & Ships Within 24 Hours
                </span>
              ) : (
                <span className="text-destructive font-medium">
                  Currently Sold Out • Join Waiting List
                </span>
              )}
            </div>

            {/* Quantity Selector & Action CTAs */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {/* Quantity Stepper */}
              <div className="flex h-12 w-32 items-center justify-between rounded-sm border border-border bg-card/60 px-3">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-muted-foreground hover:text-ivory disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-display text-base text-ivory">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={quantity >= activeStock || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.min(activeStock, q + 1))}
                  className="text-muted-foreground hover:text-ivory disabled:opacity-30"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="light-sweep flex flex-1 h-12 items-center justify-center gap-2 rounded-sm border border-gold/70 bg-card/80 px-6 text-xs font-medium tracking-[0.24em] text-champagne uppercase transition hover:bg-gold/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add to Bag</span>
              </button>

              {/* Buy Now */}
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="light-sweep flex flex-1 h-12 items-center justify-center gap-2 rounded-sm border border-gold bg-gradient-to-r from-gold to-champagne px-6 text-xs font-medium tracking-[0.24em] text-obsidian uppercase shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>Buy Now</span>
              </button>

              {/* Wishlist & Share Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Save to Wishlist"
                  onClick={() => toggleWishlist(product.slug, product.name)}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-sm border transition",
                    isSaved
                      ? "border-gold bg-gold/20 text-gold shadow-sm"
                      : "border-border bg-card/40 text-muted-foreground hover:border-gold/50 hover:text-gold",
                  )}
                >
                  <Heart className={cn("h-4 w-4", isSaved && "fill-gold")} />
                </button>
                <button
                  type="button"
                  aria-label="Share Fragrance"
                  onClick={handleShare}
                  className="flex h-12 w-12 items-center justify-center rounded-sm border border-border bg-card/40 text-muted-foreground transition hover:border-gold/50 hover:text-gold"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Olfactory Characteristics Grid */}
            <div className="mt-10 rounded-sm border border-border/80 bg-card/40 p-5">
              <h3 className="eyebrow text-xs mb-4">Fragrance Architecture</h3>

              {/* Olfactory Pyramid */}
              <div className="space-y-4">
                {/* Top notes */}
                <div className="flex items-start gap-4">
                  <div className="flex h-7 w-20 shrink-0 items-center justify-center rounded-xs border border-gold/40 bg-gold/10 text-[0.65rem] tracking-wider uppercase text-gold font-medium">
                    Top
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {product.notes.top.map((note) => (
                      <span
                        key={note}
                        className="rounded-xs border border-border bg-charcoal/60 px-2.5 py-1 text-xs text-foreground/90"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Heart notes */}
                <div className="flex items-start gap-4">
                  <div className="flex h-7 w-20 shrink-0 items-center justify-center rounded-xs border border-gold/40 bg-gold/10 text-[0.65rem] tracking-wider uppercase text-gold font-medium">
                    Heart
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {product.notes.heart.map((note) => (
                      <span
                        key={note}
                        className="rounded-xs border border-border bg-charcoal/60 px-2.5 py-1 text-xs text-foreground/90"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Base notes */}
                <div className="flex items-start gap-4">
                  <div className="flex h-7 w-20 shrink-0 items-center justify-center rounded-xs border border-gold/40 bg-gold/10 text-[0.65rem] tracking-wider uppercase text-gold font-medium">
                    Base
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {product.notes.base.map((note) => (
                      <span
                        key={note}
                        className="rounded-xs border border-border bg-charcoal/60 px-2.5 py-1 text-xs text-foreground/90"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="hairline-gold my-5 h-px" />

              {/* Performance Meters */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-gold" />
                    <span>Longevity</span>
                  </div>
                  <p className="mt-1 font-display text-lg text-champagne">
                    {product.performance.longevity}/10
                  </p>
                  <p className="text-[0.6rem] text-muted-foreground">
                    {product.performance.longevity >= 9 ? "12+ Hours (Beast Mode)" : "8–10 Hours"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Wind className="h-3.5 w-3.5 text-gold" />
                    <span>Sillage</span>
                  </div>
                  <p className="mt-1 font-display text-lg text-champagne">
                    {product.performance.sillage}/10
                  </p>
                  <p className="text-[0.6rem] text-muted-foreground">
                    {product.performance.sillage >= 8 ? "Heavy Radiant Trail" : "Moderate Aura"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Layers className="h-3.5 w-3.5 text-gold" />
                    <span>Projection</span>
                  </div>
                  <p className="mt-1 font-display text-lg text-champagne">
                    {product.performance.projection}/10
                  </p>
                  <p className="text-[0.6rem] text-muted-foreground">
                    {product.performance.projection >= 8 ? "6 Feet Enveloping" : "Arm's Length"}
                  </p>
                </div>
              </div>
            </div>

            {/* Accordion Sections: Story, Ingredients, How to Use, Provenance */}
            <div className="mt-8 border-t border-border pt-2">
              <Accordion type="single" collapsible defaultValue="story" className="w-full">
                {/* Olfactory Story */}
                <AccordionItem value="story" className="border-border">
                  <AccordionTrigger className="text-xs tracking-wider uppercase text-ivory hover:text-gold hover:no-underline">
                    Olfactory Story & Inspiration
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2 text-xs leading-relaxed text-muted-foreground">
                      <p>{product.story || product.description}</p>
                      <p>
                        Concentration:{" "}
                        <strong className="text-ivory">{product.concentration}</strong>
                      </p>
                      <p>
                        Suitable Occasions:{" "}
                        <span className="text-champagne">{product.occasions.join(" • ")}</span>
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Ingredients & Purity */}
                <AccordionItem value="ingredients" className="border-border">
                  <AccordionTrigger className="text-xs tracking-wider uppercase text-ivory hover:text-gold hover:no-underline">
                    Ingredients & Purity
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2 text-xs leading-relaxed text-muted-foreground">
                      <p>{product.ingredients}</p>
                      <p className="text-[0.7rem] italic text-muted-foreground/80">
                        100% IFRA Compliant • Vegan & Cruelty-Free • No Phthalates or Harmful
                        Preservatives
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* How to Apply */}
                <AccordionItem value="usage" className="border-border">
                  <AccordionTrigger className="text-xs tracking-wider uppercase text-ivory hover:text-gold hover:no-underline">
                    Ritual of Application
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2 text-xs leading-relaxed text-muted-foreground">
                      <p>{product.howToUse}</p>
                      <p className="text-[0.7rem] text-gold-soft">
                        Tip: Apply immediately after bathing over moisturized skin to prolong the
                        fragrance dry-down by up to 4 additional hours.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Packaging, Volume & Shelf Life */}
                <AccordionItem value="volume" className="border-border">
                  <AccordionTrigger className="text-xs tracking-wider uppercase text-ivory hover:text-gold hover:no-underline">
                    Specifications & Shelf Life
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2 text-xs text-muted-foreground">
                      <p>
                        Volume: <strong className="text-ivory">{product.volume}</strong>
                      </p>
                      <p>
                        Shelf Life: <strong className="text-ivory">{product.shelfLife}</strong>
                      </p>
                      <p>
                        Storage: Store in a cool, dark environment away from direct sunlight and
                        extreme temperature fluctuations.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Manufacturing Provenance */}
                <AccordionItem value="manufacturing" className="border-border">
                  <AccordionTrigger className="text-xs tracking-wider uppercase text-ivory hover:text-gold hover:no-underline">
                    Manufacturing Provenance
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2 text-xs text-muted-foreground">
                      <p>{product.manufacturing}</p>
                      <p>
                        Country of Origin: <strong className="text-ivory">India</strong>
                      </p>
                      <p className="text-[0.7rem] text-muted-foreground/80">
                        Crafted under strict artisanal supervision complying with ISO 9001 and Good
                        Manufacturing Practices (GMP).
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section id="reviews" className="border-t border-border bg-charcoal/20 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="eyebrow">Connoisseur Feedback</p>
              <h2 className="mt-2 font-display text-3xl text-ivory">Customer Reviews</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <span className="font-display text-xl text-champagne">
                {product.rating.toFixed(1)} / 5.0
              </span>
              <span className="text-xs text-muted-foreground">({product.reviews} verified)</span>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {demoReviews.slice(0, 3).map((review) => (
              <div
                key={review.name}
                className="flex flex-col justify-between rounded-sm border border-border bg-card/40 p-6"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                      ))}
                    </div>
                    <span className="text-[0.65rem] text-muted-foreground">{review.date}</span>
                  </div>
                  <h4 className="mt-3 font-display text-base text-ivory">{review.title}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    “{review.text}”
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 text-[0.7rem]">
                  <span className="font-medium text-foreground">{review.name}</span>
                  <span className="text-gold-soft">Verified Buyer</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Fragrances Section */}
      {relatedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="eyebrow">Complementary Blends</p>
              <h2 className="mt-2 font-display text-3xl text-ivory">You May Also Admire</h2>
            </div>
            <Link
              to="/shop"
              search={{ family: product.family }}
              className="text-xs tracking-wider uppercase text-gold hover:text-champagne transition"
            >
              View More In {product.family} →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Fragrances Section */}
      {recentlyViewedProducts.length > 0 && (
        <section className="border-t border-border bg-charcoal/10 py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-8">
              <p className="eyebrow">Your Session</p>
              <h2 className="mt-2 font-display text-2xl text-ivory">Recently Viewed</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {recentlyViewedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
