import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUpDown,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { ProductCard } from "@/components/site/ProductCard";
import { ShopFilters } from "@/components/shop/ShopFilters";
import {
  productsQuery,
  filterAndSortProducts,
  sortOptions,
  type ProductFilters,
  type SortValue,
} from "@/lib/catalog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type ShopSearch = {
  q?: string | undefined;
  kind?: string | undefined;
  family?: string | undefined;
  collection?: string | undefined;
  sort?: string | undefined;
  category?: string | undefined;
  gender?: string | undefined;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    kind: typeof search["kind"] === "string" ? search["kind"] : undefined,
    family: typeof search["family"] === "string" ? search["family"] : undefined,
    collection: typeof search["collection"] === "string" ? search["collection"] : undefined,
    sort: typeof search["sort"] === "string" ? search["sort"] : undefined,
    category: typeof search["category"] === "string" ? search["category"] : undefined,
    gender: typeof search["gender"] === "string" ? search["gender"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop Fragrances & Attars | K ESSENCE" },
      {
        name: "description",
        content:
          "Discover the full collection of K ESSENCE luxury perfumes and artisanal attars. Filter by fragrance family, notes, concentration, and occasion.",
      },
    ],
  }),
  component: ShopPage,
});

const ITEMS_PER_PAGE = 8;

function ShopPage() {
  const searchParams = Route.useSearch();
  const { data: products = [], isLoading } = useQuery(productsQuery);

  // Filter state
  const [filters, setFilters] = useState<ProductFilters>(() => ({
    searchQuery: searchParams.q ?? "",
    category: searchParams.category ?? searchParams.kind ?? undefined,
    family: searchParams.family ?? undefined,
    collection: searchParams.collection ?? undefined,
    gender: searchParams.gender ?? undefined,
  }));

  const [sort, setSort] = useState<string>(searchParams.sort ?? "recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync state if URL search params change
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: searchParams.q ?? prev.searchQuery ?? "",
      category: searchParams.category ?? searchParams.kind ?? prev.category,
      family: searchParams.family ?? prev.family,
      collection: searchParams.collection ?? prev.collection,
      gender: searchParams.gender ?? prev.gender,
    }));
    if (searchParams.sort) setSort(searchParams.sort);
  }, [searchParams]);

  // Reset page when filters change
  const handleFilterChange = (next: ProductFilters) => {
    setFilters(next);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: "",
      category: undefined,
      gender: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      family: undefined,
      notes: [],
      concentration: undefined,
      size: undefined,
      rating: undefined,
      inStockOnly: false,
      collection: undefined,
      occasion: undefined,
      longevityMin: undefined,
      sillageMin: undefined,
    });
    setSort("recommended");
    setCurrentPage(1);
  };

  // Filtered & Sorted items
  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(products, filters, sort);
  }, [products, filters, sort]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.gender) count++;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
    if (filters.family) count++;
    if (filters.notes && filters.notes.length > 0) count += filters.notes.length;
    if (filters.concentration) count++;
    if (filters.size) count++;
    if (filters.rating !== undefined) count++;
    if (filters.inStockOnly) count++;
    if (filters.collection) count++;
    if (filters.occasion) count++;
    if (filters.longevityMin !== undefined) count++;
    if (filters.sillageMin !== undefined) count++;
    return count;
  }, [filters]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  return (
    <SiteShell>
      {/* Top Banner / Hero */}
      <div className="relative border-b border-border bg-charcoal/30 py-12 md:py-16">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(50% 60% at 50% 10%, oklch(0.24 0.05 60) 0%, transparent 80%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
          <p className="eyebrow">The Atelier Collection</p>
          <h1 className="mt-3 font-display text-4xl text-ivory sm:text-5xl md:text-6xl">
            Fragrances & Attars
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Explore handcrafted extraits de parfum, traditionally distilled attars, and bespoke
            gifting sets. Designed to leave a lasting impression.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Top Controls Toolbar: Search, Active count, Sort Dropdown */}
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={filters.searchQuery ?? ""}
              onChange={(e) => handleFilterChange({ ...filters, searchQuery: e.target.value })}
              placeholder="Search by scent, note, family..."
              className="w-full rounded-sm border border-input bg-card/60 pl-10 pr-9 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-gold/60 focus:outline-none"
            />
            {filters.searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => handleFilterChange({ ...filters, searchQuery: "" })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Filter Button & Desktop Sort */}
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            {/* Mobile Filter Trigger */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex items-center gap-2 rounded-sm border border-border bg-card/60 px-4 py-2.5 text-xs text-foreground lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 text-gold" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-gold px-1.5 py-0.2 text-[0.6rem] font-medium text-obsidian">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-muted-foreground sm:inline-block">Sort:</span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none rounded-sm border border-input bg-card/60 py-2.5 pl-3 pr-8 text-xs text-foreground focus:border-gold/60 focus:outline-none cursor-pointer"
                >
                  {sortOptions.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      className="bg-obsidian text-foreground"
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-4 pb-2">
            <span className="text-[0.68rem] tracking-wider text-muted-foreground uppercase mr-1">
              Active:
            </span>
            {filters.category && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs text-champagne">
                Category: {filters.category}
                <button
                  type="button"
                  onClick={() => handleFilterChange({ ...filters, category: undefined })}
                >
                  <X className="h-3 w-3 hover:text-white" />
                </button>
              </span>
            )}
            {filters.gender && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs text-champagne">
                Gender: {filters.gender}
                <button
                  type="button"
                  onClick={() => handleFilterChange({ ...filters, gender: undefined })}
                >
                  <X className="h-3 w-3 hover:text-white" />
                </button>
              </span>
            )}
            {filters.family && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs text-champagne">
                Family: {filters.family}
                <button
                  type="button"
                  onClick={() => handleFilterChange({ ...filters, family: undefined })}
                >
                  <X className="h-3 w-3 hover:text-white" />
                </button>
              </span>
            )}
            {filters.minPrice !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs text-champagne">
                Price: Above ₹{filters.minPrice}
                <button
                  type="button"
                  onClick={() =>
                    handleFilterChange({ ...filters, minPrice: undefined, maxPrice: undefined })
                  }
                >
                  <X className="h-3 w-3 hover:text-white" />
                </button>
              </span>
            )}
            {filters.maxPrice !== undefined && filters.minPrice === undefined && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs text-champagne">
                Price: Under ₹{filters.maxPrice}
                <button
                  type="button"
                  onClick={() =>
                    handleFilterChange({ ...filters, minPrice: undefined, maxPrice: undefined })
                  }
                >
                  <X className="h-3 w-3 hover:text-white" />
                </button>
              </span>
            )}
            {(filters.notes ?? []).map((n) => (
              <span
                key={n}
                className="inline-flex items-center gap-1 rounded-sm border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs text-champagne"
              >
                Note: {n}
                <button
                  type="button"
                  onClick={() =>
                    handleFilterChange({
                      ...filters,
                      notes: (filters.notes ?? []).filter((item) => item !== n),
                    })
                  }
                >
                  <X className="h-3 w-3 hover:text-white" />
                </button>
              </span>
            ))}
            {filters.concentration && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs text-champagne">
                {filters.concentration}
                <button
                  type="button"
                  onClick={() => handleFilterChange({ ...filters, concentration: undefined })}
                >
                  <X className="h-3 w-3 hover:text-white" />
                </button>
              </span>
            )}
            {filters.size && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs text-champagne">
                Size: {filters.size}
                <button
                  type="button"
                  onClick={() => handleFilterChange({ ...filters, size: undefined })}
                >
                  <X className="h-3 w-3 hover:text-white" />
                </button>
              </span>
            )}
            {filters.inStockOnly && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs text-champagne">
                In Stock Only
                <button
                  type="button"
                  onClick={() => handleFilterChange({ ...filters, inStockOnly: false })}
                >
                  <X className="h-3 w-3 hover:text-white" />
                </button>
              </span>
            )}
            {filters.collection && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs text-champagne">
                Collection: {filters.collection}
                <button
                  type="button"
                  onClick={() => handleFilterChange({ ...filters, collection: undefined })}
                >
                  <X className="h-3 w-3 hover:text-white" />
                </button>
              </span>
            )}
            {filters.occasion && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs text-champagne">
                Occasion: {filters.occasion}
                <button
                  type="button"
                  onClick={() => handleFilterChange({ ...filters, occasion: undefined })}
                >
                  <X className="h-3 w-3 hover:text-white" />
                </button>
              </span>
            )}
            {filters.rating && (
              <span className="inline-flex items-center gap-1 rounded-sm border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs text-champagne">
                {filters.rating}★+
                <button
                  type="button"
                  onClick={() => handleFilterChange({ ...filters, rating: undefined })}
                >
                  <X className="h-3 w-3 hover:text-white" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[0.68rem] tracking-wider text-muted-foreground underline uppercase transition hover:text-gold ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Main Layout: Desktop Sidebar + Product Grid */}
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-sm border border-border bg-card/30 p-5 backdrop-blur-md">
              <ShopFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                activeCount={activeFilterCount}
              />
            </div>
          </aside>

          {/* Product Grid Area */}
          <main>
            {/* Products count header */}
            <div className="mb-6 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing{" "}
                <strong className="text-foreground">
                  {filteredProducts.length === 0
                    ? "0"
                    : `${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        filteredProducts.length,
                      )}`}
                </strong>{" "}
                of <strong className="text-foreground">{filteredProducts.length}</strong> fragrances
              </span>
              {filters.searchQuery && (
                <span className="italic">Results for “{filters.searchQuery}”</span>
              )}
            </div>

            {/* Loading state */}
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex aspect-4/5 flex-col rounded-sm border border-border bg-card/30 p-4 animate-pulse"
                  >
                    <div className="h-48 w-full rounded-sm bg-charcoal/60" />
                    <div className="mt-4 h-3 w-1/3 rounded-xs bg-charcoal/80" />
                    <div className="mt-2 h-5 w-3/4 rounded-xs bg-charcoal" />
                    <div className="mt-auto flex justify-between pt-4">
                      <div className="h-4 w-1/4 rounded-xs bg-charcoal" />
                      <div className="h-8 w-16 rounded-xs bg-charcoal" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-border py-20 px-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-2xl text-ivory">No Fragrances Found</h3>
                <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
                  We couldn't find any compositions matching your filter combination. Try clearing
                  some filters or searching for another note.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="light-sweep mt-6 inline-flex items-center gap-2 rounded-sm border border-gold/60 bg-gold/10 px-6 py-2.5 text-xs tracking-[0.2em] text-champagne uppercase transition hover:bg-gold/20"
                >
                  <span>Clear All Filters</span>
                </button>
              </div>
            ) : (
              /* Products Grid */
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-3">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-14 flex items-center justify-center gap-2 border-t border-border pt-8">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 200, behavior: "smooth" });
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-foreground transition hover:border-gold/60 hover:text-gold disabled:opacity-30 disabled:hover:border-border disabled:hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNumber = idx + 1;
                  const isActive = currentPage === pageNumber;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pageNumber);
                        window.scrollTo({ top: 200, behavior: "smooth" });
                      }}
                      className={cn(
                        "h-9 w-9 rounded-sm border text-xs transition",
                        isActive
                          ? "border-gold bg-gold/20 text-champagne font-medium"
                          : "border-border text-muted-foreground hover:border-gold/40 hover:text-foreground",
                      )}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  type="button"
                  aria-label="Next page"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 200, behavior: "smooth" });
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-foreground transition hover:border-gold/60 hover:text-gold disabled:opacity-30 disabled:hover:border-border disabled:hover:text-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Sheet Drawer */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent
          side="bottom"
          className="glass-panel flex h-[85vh] max-h-[85vh] flex-col rounded-t-lg border-t border-gold/30 bg-obsidian/95 p-0 sm:max-w-none"
        >
          <SheetHeader className="border-b border-border px-6 py-4 text-left">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-display text-xl text-ivory">Filter Collection</SheetTitle>
              <span className="text-xs text-muted-foreground">{filteredProducts.length} items</span>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <ShopFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              activeCount={activeFilterCount}
              onApply={() => setMobileFiltersOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </SiteShell>
  );
}
