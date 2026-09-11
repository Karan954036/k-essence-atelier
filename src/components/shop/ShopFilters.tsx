import { Check, RotateCcw, SlidersHorizontal } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ProductFilters } from "@/lib/catalog";
import { cn } from "@/lib/utils";

type ShopFiltersProps = {
  filters: ProductFilters;
  onFilterChange: (next: ProductFilters) => void;
  onReset: () => void;
  activeCount: number;
  className?: string;
  onApply?: () => void;
};

const CATEGORIES = [
  "All",
  "Luxury Attar",
  "Signature Perfume",
  "Traditional Attar",
  "Premium Attar",
  "Floral Perfume",
  "Everyday Perfume",
  "Luxury Perfume",
  "Oud Collection",
];

const GENDERS = ["All", "Unisex", "Men", "Women"];

const FAMILIES = ["All", "Woody", "Floral", "Amber", "Musky", "Oriental", "Spicy", "Gourmand"];

const POPULAR_NOTES = [
  "Oud",
  "Rose",
  "Musk",
  "Sandalwood",
  "Saffron",
  "Amber",
  "Bergamot",
  "Cardamom",
  "Vanilla",
  "Jasmine",
  "Cedarwood",
  "Patchouli",
  "Leather",
];

const CONCENTRATIONS = ["All", "Pure Attar (Alcohol-Free)", "Eau de Parfum", "Extrait de Parfum"];

const SIZES = ["All", "10ml", "20ml", "50ml", "100ml"];

const COLLECTIONS = [
  { slug: "all", title: "All Collections" },
  { slug: "royal-collection", title: "Royal Collection" },
  { slug: "signature-attars", title: "Signature Attars" },
  { slug: "oud-collection", title: "The Oud Collection" },
  { slug: "luxury-perfumes", title: "Luxury Perfumes" },
];

const OCCASIONS = [
  "All",
  "Royal & Festive",
  "Evening / Special Occasion",
  "Daily Luxury",
  "Office / Signature",
  "Romantic / Date Night",
];

export function ShopFilters({
  filters,
  onFilterChange,
  onReset,
  activeCount,
  className,
  onApply,
}: ShopFiltersProps) {
  const toggleNote = (note: string) => {
    const currentNotes = filters.notes ?? [];
    const exists = currentNotes.includes(note);
    const nextNotes = exists ? currentNotes.filter((n) => n !== note) : [...currentNotes, note];
    onFilterChange({ ...filters, notes: nextNotes });
  };

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {/* Filters Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gold" />
          <span className="eyebrow text-xs">FILTERS ({activeCount})</span>
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase transition hover:text-gold"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Availability Instant Toggle */}
      <div className="flex items-center justify-between rounded-sm border border-border/70 bg-card/40 px-3.5 py-3">
        <div>
          <p className="text-xs font-medium text-foreground">In Stock Only</p>
          <p className="text-[0.65rem] text-muted-foreground">Ready to ship immediately</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(filters.inStockOnly)}
          onClick={() => onFilterChange({ ...filters, inStockOnly: !filters.inStockOnly })}
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
            filters.inStockOnly ? "bg-gold" : "bg-muted",
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-obsidian shadow transition duration-200 ease-in-out",
              filters.inStockOnly
                ? "translate-x-4 bg-background"
                : "translate-x-0 bg-foreground/60",
            )}
          />
        </button>
      </div>

      {/* Accordion Filter Groups */}
      <Accordion
        type="multiple"
        defaultValue={["category", "family", "price", "gender"]}
        className="w-full space-y-1"
      >
        {/* Category */}
        <AccordionItem value="category" className="border-border/60">
          <AccordionTrigger className="text-xs tracking-wider uppercase text-ivory/90 hover:no-underline hover:text-gold">
            Category
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1.5 pt-1">
              {CATEGORIES.map((cat) => {
                const isSelected = (!filters.category && cat === "All") || filters.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        ...filters,
                        category: cat === "All" ? undefined : cat,
                      })
                    }
                    className={cn(
                      "flex w-full items-center justify-between rounded-xs px-2.5 py-1.5 text-left text-xs transition",
                      isSelected
                        ? "bg-gold/15 text-gold font-medium"
                        : "text-muted-foreground hover:bg-card hover:text-foreground",
                    )}
                  >
                    <span>{cat}</span>
                    {isSelected && <Check className="h-3 w-3 text-gold" />}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Gender */}
        <AccordionItem value="gender" className="border-border/60">
          <AccordionTrigger className="text-xs tracking-wider uppercase text-ivory/90 hover:no-underline hover:text-gold">
            Gender
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {GENDERS.map((g) => {
                const isSelected = (!filters.gender && g === "All") || filters.gender === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        ...filters,
                        gender: g === "All" ? undefined : g,
                      })
                    }
                    className={cn(
                      "rounded-xs border px-3 py-1.5 text-center text-xs tracking-wide transition",
                      isSelected
                        ? "border-gold/60 bg-gold/10 text-champagne"
                        : "border-border/80 text-muted-foreground hover:border-gold/40 hover:text-foreground",
                    )}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price" className="border-border/60">
          <AccordionTrigger className="text-xs tracking-wider uppercase text-ivory/90 hover:no-underline hover:text-gold">
            Price
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1">
              {[
                { label: "All Prices", min: undefined, max: undefined },
                { label: "Under ₹1,500", min: undefined, max: 1500 },
                { label: "₹1,500 – ₹2,500", min: 1500, max: 2500 },
                { label: "Above ₹2,500", min: 2500, max: undefined },
              ].map((tier) => {
                const isSelected = filters.minPrice === tier.min && filters.maxPrice === tier.max;
                return (
                  <button
                    key={tier.label}
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        ...filters,
                        minPrice: tier.min,
                        maxPrice: tier.max,
                      })
                    }
                    className={cn(
                      "flex w-full items-center justify-between rounded-xs px-2.5 py-1.5 text-left text-xs transition",
                      isSelected
                        ? "bg-gold/15 text-gold font-medium"
                        : "text-muted-foreground hover:bg-card hover:text-foreground",
                    )}
                  >
                    <span>{tier.label}</span>
                    {isSelected && <Check className="h-3 w-3 text-gold" />}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Fragrance Family */}
        <AccordionItem value="family" className="border-border/60">
          <AccordionTrigger className="text-xs tracking-wider uppercase text-ivory/90 hover:no-underline hover:text-gold">
            Fragrance Family
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {FAMILIES.map((fam) => {
                const isSelected = (!filters.family && fam === "All") || filters.family === fam;
                return (
                  <button
                    key={fam}
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        ...filters,
                        family: fam === "All" ? undefined : fam,
                      })
                    }
                    className={cn(
                      "rounded-xs border px-2.5 py-1 text-xs tracking-wide transition",
                      isSelected
                        ? "border-gold bg-gold/15 text-champagne"
                        : "border-border/70 text-muted-foreground hover:border-gold/40 hover:text-foreground",
                    )}
                  >
                    {fam}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Fragrance Notes */}
        <AccordionItem value="notes" className="border-border/60">
          <AccordionTrigger className="text-xs tracking-wider uppercase text-ivory/90 hover:no-underline hover:text-gold">
            Key Notes
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {POPULAR_NOTES.map((note) => {
                const isSelected = (filters.notes ?? []).includes(note);
                return (
                  <button
                    key={note}
                    type="button"
                    onClick={() => toggleNote(note)}
                    className={cn(
                      "rounded-xs border px-2 py-1 text-[0.7rem] transition",
                      isSelected
                        ? "border-gold/80 bg-gold/20 text-gold"
                        : "border-border/60 text-muted-foreground hover:border-gold/40 hover:text-foreground",
                    )}
                  >
                    {note}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Concentration */}
        <AccordionItem value="concentration" className="border-border/60">
          <AccordionTrigger className="text-xs tracking-wider uppercase text-ivory/90 hover:no-underline hover:text-gold">
            Concentration
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1.5 pt-1">
              {CONCENTRATIONS.map((c) => {
                const isSelected =
                  (!filters.concentration && c === "All") || filters.concentration === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        ...filters,
                        concentration: c === "All" ? undefined : c,
                      })
                    }
                    className={cn(
                      "flex w-full items-center justify-between rounded-xs px-2.5 py-1.5 text-left text-xs transition",
                      isSelected
                        ? "bg-gold/15 text-gold font-medium"
                        : "text-muted-foreground hover:bg-card hover:text-foreground",
                    )}
                  >
                    <span>{c}</span>
                    {isSelected && <Check className="h-3 w-3 text-gold" />}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Size / Volume */}
        <AccordionItem value="size" className="border-border/60">
          <AccordionTrigger className="text-xs tracking-wider uppercase text-ivory/90 hover:no-underline hover:text-gold">
            Size / Volume
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {SIZES.map((sz) => {
                const isSelected = (!filters.size && sz === "All") || filters.size === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        ...filters,
                        size: sz === "All" ? undefined : sz,
                      })
                    }
                    className={cn(
                      "rounded-xs border px-2 py-1.5 text-center text-xs transition",
                      isSelected
                        ? "border-gold/70 bg-gold/15 text-champagne"
                        : "border-border/70 text-muted-foreground hover:border-gold/40 hover:text-foreground",
                    )}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Collection */}
        <AccordionItem value="collection" className="border-border/60">
          <AccordionTrigger className="text-xs tracking-wider uppercase text-ivory/90 hover:no-underline hover:text-gold">
            Collections
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1.5 pt-1">
              {COLLECTIONS.map((col) => {
                const isSelected =
                  (!filters.collection && col.slug === "all") || filters.collection === col.slug;
                return (
                  <button
                    key={col.slug}
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        ...filters,
                        collection: col.slug === "all" ? undefined : col.slug,
                      })
                    }
                    className={cn(
                      "flex w-full items-center justify-between rounded-xs px-2.5 py-1.5 text-left text-xs transition",
                      isSelected
                        ? "bg-gold/15 text-gold font-medium"
                        : "text-muted-foreground hover:bg-card hover:text-foreground",
                    )}
                  >
                    <span>{col.title}</span>
                    {isSelected && <Check className="h-3 w-3 text-gold" />}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Occasion */}
        <AccordionItem value="occasion" className="border-border/60">
          <AccordionTrigger className="text-xs tracking-wider uppercase text-ivory/90 hover:no-underline hover:text-gold">
            Occasion
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1.5 pt-1">
              {OCCASIONS.map((occ) => {
                const isSelected = (!filters.occasion && occ === "All") || filters.occasion === occ;
                return (
                  <button
                    key={occ}
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        ...filters,
                        occasion: occ === "All" ? undefined : occ,
                      })
                    }
                    className={cn(
                      "flex w-full items-center justify-between rounded-xs px-2.5 py-1.5 text-left text-xs transition",
                      isSelected
                        ? "bg-gold/15 text-gold font-medium"
                        : "text-muted-foreground hover:bg-card hover:text-foreground",
                    )}
                  >
                    <span>{occ}</span>
                    {isSelected && <Check className="h-3 w-3 text-gold" />}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Minimum Rating */}
        <AccordionItem value="rating" className="border-border/60">
          <AccordionTrigger className="text-xs tracking-wider uppercase text-ivory/90 hover:no-underline hover:text-gold">
            Rating
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1.5 pt-1">
              {[
                { label: "All Ratings", rating: undefined },
                { label: "4.8 ★ & Above", rating: 4.8 },
                { label: "4.6 ★ & Above", rating: 4.6 },
                { label: "4.0 ★ & Above", rating: 4.0 },
              ].map((r) => {
                const isSelected = filters.rating === r.rating;
                return (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => onFilterChange({ ...filters, rating: r.rating })}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xs px-2.5 py-1.5 text-left text-xs transition",
                      isSelected
                        ? "bg-gold/15 text-gold font-medium"
                        : "text-muted-foreground hover:bg-card hover:text-foreground",
                    )}
                  >
                    <span>{r.label}</span>
                    {isSelected && <Check className="h-3 w-3 text-gold" />}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Longevity & Sillage */}
        <AccordionItem value="performance" className="border-border/60">
          <AccordionTrigger className="text-xs tracking-wider uppercase text-ivory/90 hover:no-underline hover:text-gold">
            Longevity & Sillage
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1 text-xs">
              <div>
                <p className="mb-1 text-[0.68rem] text-muted-foreground">Longevity Scale:</p>
                <div className="flex gap-1">
                  {[
                    { label: "All", val: undefined },
                    { label: "8+ Hours", val: 8 },
                    { label: "10+ Hours", val: 9 },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => onFilterChange({ ...filters, longevityMin: item.val })}
                      className={cn(
                        "flex-1 rounded-xs border py-1 text-center text-[0.65rem] transition",
                        filters.longevityMin === item.val
                          ? "border-gold bg-gold/15 text-gold font-medium"
                          : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1 text-[0.68rem] text-muted-foreground">Sillage Trail:</p>
                <div className="flex gap-1">
                  {[
                    { label: "All", val: undefined },
                    { label: "Moderate (7+)", val: 7 },
                    { label: "Heavy (9+)", val: 8 },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => onFilterChange({ ...filters, sillageMin: item.val })}
                      className={cn(
                        "flex-1 rounded-xs border py-1 text-center text-[0.65rem] transition",
                        filters.sillageMin === item.val
                          ? "border-gold bg-gold/15 text-gold font-medium"
                          : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Optional Apply button for mobile */}
      {onApply && (
        <div className="sticky bottom-0 mt-4 border-t border-border bg-obsidian/95 py-3">
          <button
            type="button"
            onClick={onApply}
            className="w-full rounded-sm border border-gold bg-gold/90 py-3 text-xs tracking-[0.2em] font-medium text-obsidian uppercase transition hover:brightness-110"
          >
            Apply Filters ({activeCount})
          </button>
        </div>
      )}
    </div>
  );
}
