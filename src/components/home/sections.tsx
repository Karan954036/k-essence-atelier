import { Link } from "@tanstack/react-router";
import { Star, Sparkles, ShieldCheck, Leaf, Gift, ArrowRight } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/site/Reveal";
import { ProductCard } from "@/components/site/ProductCard";
import {
  bestSellers,
  demoReviews,
  featuredCollections,
  newArrivals,
  premiumAttars,
  signaturePerfumes,
  type DemoProduct,
} from "@/data/demo-catalog";

function ProductRow({
  eyebrow,
  title,
  copy,
  products,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  products: DemoProduct[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
      <Reveal>
        <SectionHeading eyebrow={eyebrow} title={title} {...(copy ? { copy } : {})} />
      </Reveal>
      <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {products.slice(0, 4).map((p, i) => (
          <Reveal key={p.slug} delay={i * 90}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function FeaturedCollections() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="Featured"
          title="Collections"
          copy="Four houses of scent — modern perfumery, traditional attars, and gifting."
        />
      </Reveal>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {featuredCollections.map((c, i) => (
          <Reveal key={c.slug} delay={i * 90}>
            <Link
              to="/"
              className="light-sweep group relative block h-72 overflow-hidden rounded-sm border border-border transition-all duration-500 hover:-translate-y-2 hover:border-gold/40"
            >
              <div
                className="absolute inset-0 transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                style={{
                  background: `radial-gradient(70% 60% at 50% 30%, ${c.tint} 0%, oklch(0.1 0.006 60) 75%)`,
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="eyebrow text-[0.55rem]">Collection</p>
                <h3 className="mt-2 font-display text-2xl text-ivory">{c.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{c.line}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-[0.6rem] tracking-[0.22em] text-gold-soft uppercase">
                  Discover <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function BestSellersSection() {
  return (
    <ProductRow
      eyebrow="Most loved"
      title="Best Sellers"
      copy="The scents our customers return to. Demo placeholder catalogue during development."
      products={bestSellers}
    />
  );
}

export function SignaturePerfumesSection() {
  return (
    <ProductRow
      eyebrow="Eau de parfum"
      title="Signature Perfumes"
      copy="Modern, long-wearing compositions in champagne-glass flacons."
      products={signaturePerfumes}
    />
  );
}

export function PremiumAttarsSection() {
  return (
    <ProductRow
      eyebrow="Alcohol-free"
      title="Premium Attars"
      copy="Traditionally blended oils — oud, sandalwood, saffron and musk."
      products={premiumAttars}
    />
  );
}

export function NewArrivalsSection() {
  return (
    <ProductRow
      eyebrow="Just in"
      title="New Arrivals"
      copy="Fresh compositions and limited runs."
      products={newArrivals}
    />
  );
}

export function FragranceExperience() {
  return (
    <section className="relative overflow-hidden py-24">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 70% at 20% 30%, oklch(0.26 0.05 60) 0%, transparent 65%), radial-gradient(50% 60% at 85% 70%, oklch(0.28 0.06 30) 0%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl px-4 text-center lg:px-8">
        <Reveal>
          <p className="eyebrow">The experience</p>
          <h2 className="mt-4 font-display text-3xl text-ivory sm:text-4xl md:text-5xl">
            Find the scent that becomes yours
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            A guided fragrance discovery journey — by mood, occasion, intensity and note family —
            is being built into K ESSENCE. Explore the collection meanwhile.
          </p>
          <Link
            to="/"
            className="light-sweep mt-9 inline-flex items-center gap-3 rounded-sm border border-gold/60 bg-gold/10 px-8 py-4 text-[0.7rem] tracking-[0.24em] text-champagne uppercase transition hover:bg-gold/20"
          >
            <Sparkles className="h-4 w-4" />
            Find Your Fragrance
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function StorySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow">Our house</p>
          <h2 className="mt-4 font-display text-3xl text-ivory sm:text-4xl md:text-5xl">
            A fragrance house, from blend to bottle
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              K ESSENCE is a perfume and attar manufacturing brand. We compose, blend, fill and
              finish our fragrances ourselves, so the scent you wear is the scent we intended.
            </p>
            <p>
              Our work draws on Indian and oriental fragrance traditions — oud, sandalwood, rose,
              saffron and musk — expressed through modern perfumery.
            </p>
            <p className="text-xs text-muted-foreground/70">
              Detailed manufacturing information, capacity and any certifications will be published
              here once provided by the brand.
            </p>
          </div>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 text-[0.65rem] tracking-[0.24em] text-gold-soft uppercase transition hover:text-gold"
          >
            Our manufacturing <ArrowRight className="h-3 w-3" />
          </Link>
        </Reveal>

        <Reveal delay={140}>
          <div className="grid grid-cols-2 gap-4">
            {["Composition", "Blending", "Filling", "Finishing"].map((label, i) => (
              <div
                key={label}
                className="light-sweep relative h-44 overflow-hidden rounded-sm border border-border"
                style={{
                  background: `radial-gradient(70% 70% at 50% 30%, oklch(${0.22 + i * 0.03} 0.05 ${55 + i * 8}) 0%, oklch(0.1 0.006 60) 78%)`,
                }}
              >
                <span className="absolute bottom-4 left-4 text-[0.6rem] tracking-[0.22em] text-champagne uppercase">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const values = [
  { icon: Leaf, title: "Crafted With Care", copy: "Blended in small, closely monitored batches." },
  { icon: Sparkles, title: "Premium Fragrance Experience", copy: "Layered compositions with a considered dry-down." },
  { icon: ShieldCheck, title: "Quality Focused", copy: "Checked for consistency before it reaches you." },
  { icon: Gift, title: "Made for Every Occasion", copy: "From daily wear to celebration and gifting." },
];

export function WhySection() {
  return (
    <section className="border-y border-border bg-charcoal/30 py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="Why K ESSENCE" title="Made to be remembered" />
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 90}>
              <div className="h-full rounded-sm border border-border bg-card/50 p-6 transition-colors duration-500 hover:border-gold/40">
                <v.icon className="h-6 w-6 text-gold" />
                <h3 className="mt-5 font-display text-xl text-ivory">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ReviewsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
      <Reveal>
        <SectionHeading
          eyebrow="Demo reviews"
          title="What wearers say"
          copy="Sample placeholder reviews shown during development — not verified customer reviews."
        />
      </Reveal>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {demoReviews.map((r, i) => (
          <Reveal key={r.name} delay={i * 110}>
            <figure className="h-full rounded-sm border border-border bg-card/50 p-7">
              <div className="flex gap-1">
                {Array.from({ length: r.rating }).map((_, s) => (
                  <Star key={s} className="h-3.5 w-3.5 fill-gold text-gold" />
                ))}
              </div>
              <blockquote className="mt-5 font-display text-lg leading-relaxed text-ivory/90">
                “{r.text}”
              </blockquote>
              <figcaption className="mt-6 text-xs tracking-[0.18em] text-muted-foreground uppercase">
                {r.name} — {r.location}
                <span className="ml-2 text-muted-foreground/60">(demo)</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function NewsletterSection() {
  return (
    <section className="relative overflow-hidden border-t border-border py-24">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 90% at 50% 0%, oklch(0.24 0.05 65) 0%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-xl px-4 text-center lg:px-8">
        <Reveal>
          <p className="eyebrow">The list</p>
          <h2 className="mt-4 font-display text-3xl text-ivory sm:text-4xl">
            New releases, first
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Occasional letters on new compositions, limited runs and gifting.
          </p>
          <form
            className="mt-8 flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 rounded-sm border border-input bg-obsidian/60 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-gold/60 focus:outline-none"
            />
            <button
              type="submit"
              className="light-sweep rounded-sm border border-gold/60 bg-gold/10 px-7 py-3.5 text-[0.68rem] tracking-[0.22em] text-champagne uppercase transition hover:bg-gold/20"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-3 text-[0.65rem] text-muted-foreground/70">
            Sign-up storage is connected in a later phase.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
