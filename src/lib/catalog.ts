import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { demoProducts, featuredCollections, type DemoProduct } from "@/data/demo-catalog";

export type FragranceNotes = { top: string[]; heart: string[]; base: string[] };

export type CatalogVariant = {
  id: string;
  label: string;
  price: number;
  mrp: number;
  stock: number;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  kind: "perfume" | "attar" | "gift-set" | string;
  family: string;
  gender: "Unisex" | "Men" | "Women" | string;
  concentration: string;
  occasions: string[];
  badge: string | null;
  description: string;
  story: string;
  volume: string;
  shelfLife: string;
  ingredients: string;
  howToUse: string;
  manufacturing: string;
  tint: string;
  modelUrl: string | null;
  rating: number;
  reviews: number;
  mrp: number;
  price: number;
  inStock: boolean;
  isDemo: boolean;
  categoryName: string;
  categorySlug: string | null;
  collectionSlug: string | null;
  performance: { longevity: number; sillage: number; projection: number };
  variants: CatalogVariant[];
  notes: FragranceNotes;
};

export type CatalogCollection = {
  slug: string;
  title: string;
  tagline: string | null;
  tint: string;
};

const PRODUCT_SELECT =
  "*, categories(name, slug), collections(slug), product_variants(id, label, price, mrp, stock, sort_order), product_notes(layer, name, sort_order)";

type Row = Record<string, unknown>;

export function demoToCatalog(d: DemoProduct, index = 0): CatalogProduct {
  return {
    id: `demo-${d.slug}`,
    slug: d.slug,
    name: d.name,
    kind: d.kind,
    family: d.family,
    gender: d.gender,
    concentration: d.concentration,
    occasions: d.occasions,
    badge: d.badge ?? null,
    description: d.description,
    story: d.story ?? d.description,
    volume: d.volume,
    shelfLife: d.shelfLife,
    ingredients: d.ingredients,
    howToUse: d.howToUse,
    manufacturing: d.manufacturing,
    tint: d.tint,
    modelUrl: d.modelUrl ?? null,
    rating: d.rating,
    reviews: d.reviews,
    mrp: d.mrp,
    price: d.price,
    inStock: d.inStock,
    isDemo: true,
    categoryName: d.category,
    categorySlug: d.category.toLowerCase().replace(/\s+/g, "-"),
    collectionSlug: d.collectionSlug ?? null,
    performance: d.performance,
    variants: d.sizes.map((s, idx) => ({
      id: `${d.slug}-${s.label}`,
      label: s.label,
      price: s.price,
      mrp: s.mrp,
      stock: s.stock ?? (d.inStock ? 20 - idx * 5 : 0),
    })),
    notes: d.notes,
  };
}

export const fallbackCatalogProducts: CatalogProduct[] = demoProducts.map(demoToCatalog);

function toProduct(row: Row): CatalogProduct {
  const notes: FragranceNotes = { top: [], heart: [], base: [] };
  const rawNotes = [...((row["product_notes"] ?? []) as Row[])].sort(
    (a, b) => (Number(a["sort_order"]) || 0) - (Number(b["sort_order"]) || 0),
  );
  for (const n of rawNotes) {
    const layer = n["layer"] as keyof FragranceNotes;
    if (layer in notes) notes[layer].push(String(n["name"] ?? ""));
  }

  const variants = [...((row["product_variants"] ?? []) as Row[])]
    .sort((a, b) => (Number(a["sort_order"]) || 0) - (Number(b["sort_order"]) || 0))
    .map((v) => ({
      id: String(v["id"] ?? ""),
      label: String(v["label"] ?? ""),
      price: Number(v["price"] || 0),
      mrp: Number(v["mrp"] || 0),
      stock: Number(v["stock"] ?? 0),
    }));

  const slug = String(row["slug"] ?? "");
  const demoMatch = demoProducts.find((d) => d.slug === slug);
  const categoriesObj = row["categories"] as Record<string, unknown> | null | undefined;
  const collectionsObj = row["collections"] as Record<string, unknown> | null | undefined;

  return {
    id: String(row["id"] ?? `prod-${slug}`),
    slug,
    name: String(row["name"] ?? demoMatch?.name ?? ""),
    kind: String(row["kind"] ?? demoMatch?.kind ?? "perfume"),
    family: String(row["family"] ?? demoMatch?.family ?? "Woody"),
    gender: (row["gender"] as string) ?? demoMatch?.gender ?? "Unisex",
    concentration: String(
      row["concentration"] ??
        demoMatch?.concentration ??
        (row["kind"] === "attar" ? "Pure Attar (Alcohol-Free)" : "Eau de Parfum"),
    ),
    occasions: (row["occasions"] as string[]) ??
      demoMatch?.occasions ?? ["Royal & Festive", "Evening / Special Occasion"],
    badge: (row["badge"] as string) ?? null,
    description: String(
      row["description"] ??
        demoMatch?.description ??
        "A luxury artisanal fragrance handcrafted by K ESSENCE.",
    ),
    story: String(
      row["story"] ??
        demoMatch?.story ??
        row["description"] ??
        "Crafted with passion in the Indian perfume capital.",
    ),
    volume: String(
      row["volume"] ??
        demoMatch?.volume ??
        (row["kind"] === "attar" ? "10ml / 20ml Concentrated Oil" : "50ml / 100ml Vaporisateur"),
    ),
    shelfLife: String(
      row["shelf_life"] ?? demoMatch?.shelfLife ?? "36 Months from Manufacturing Date",
    ),
    ingredients: String(
      row["ingredients"] ??
        demoMatch?.ingredients ??
        "Parfum (Fragrance), Natural Essential Oils, IFRA Compliant Aromatics.",
    ),
    howToUse: String(
      row["how_to_use"] ?? demoMatch?.howToUse ?? "Apply to pulse points and let settle naturally.",
    ),
    manufacturing: String(
      row["manufacturing"] ??
        demoMatch?.manufacturing ??
        "Handcrafted at K ESSENCE Atelier, India.",
    ),
    tint: String(row["tint"] ?? demoMatch?.tint ?? "#3a2416"),
    modelUrl: (row["model_url"] as string) ?? demoMatch?.modelUrl ?? null,
    rating: Number(row["rating"] ?? demoMatch?.rating ?? 4.8),
    reviews: Number(row["review_count"] ?? demoMatch?.reviews ?? 50),
    mrp: Number(row["mrp"] ?? demoMatch?.mrp ?? 1999),
    price: Number(row["price"] ?? demoMatch?.price ?? 1499),
    inStock: Boolean(row["in_stock"]),
    isDemo: Boolean(row["is_demo"]),
    categoryName: (categoriesObj?.["name"] as string) ?? demoMatch?.category ?? "Luxury Fragrance",
    categorySlug: (categoriesObj?.["slug"] as string) ?? null,
    collectionSlug: (collectionsObj?.["slug"] as string) ?? demoMatch?.collectionSlug ?? null,
    performance: {
      longevity: Number(row["longevity"] ?? demoMatch?.performance.longevity ?? 8),
      sillage: Number(row["sillage"] ?? demoMatch?.performance.sillage ?? 7),
      projection: Number(row["projection"] ?? demoMatch?.performance.projection ?? 7),
    },
    variants:
      variants.length > 0
        ? variants
        : (demoMatch?.sizes.map((s) => ({
            id: `${slug}-${s.label}`,
            label: s.label,
            price: s.price,
            mrp: s.mrp,
            stock: s.stock ?? 15,
          })) ?? []),
    notes:
      notes.top.length > 0 || notes.heart.length > 0 || notes.base.length > 0
        ? notes
        : (demoMatch?.notes ?? { top: ["Bergamot"], heart: ["Oud"], base: ["Amber"] }),
  };
}

export async function fetchProducts(): Promise<CatalogProduct[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return fallbackCatalogProducts;
    }
    return ((data ?? []) as Row[]).map(toProduct);
  } catch (err) {
    console.warn("Supabase fetchProducts failed or offline; using fallback catalogue:", err);
    return fallbackCatalogProducts;
  }
}

export async function fetchProductBySlug(slug: string): Promise<CatalogProduct | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      const match = fallbackCatalogProducts.find((p) => p.slug === slug);
      return match ?? null;
    }
    return toProduct(data as Row);
  } catch {
    const match = fallbackCatalogProducts.find((p) => p.slug === slug);
    return match ?? null;
  }
}

export async function fetchCollections(): Promise<CatalogCollection[]> {
  try {
    const { data, error } = await supabase
      .from("collections")
      .select("slug, title, tagline, tint, sort_order")
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return featuredCollections.map((c) => ({
        slug: c.slug,
        title: c.title,
        tagline: c.line,
        tint: c.tint,
      }));
    }
    return ((data ?? []) as Row[]).map((c) => ({
      slug: String(c["slug"] ?? ""),
      title: String(c["title"] ?? ""),
      tagline: (c["tagline"] as string) ?? null,
      tint: String(c["tint"] ?? "#3a2416"),
    }));
  } catch {
    return featuredCollections.map((c) => ({
      slug: c.slug,
      title: c.title,
      tagline: c.line,
      tint: c.tint,
    }));
  }
}

export function fetchRelatedProducts(
  current: CatalogProduct,
  all: CatalogProduct[],
  limit = 4,
): CatalogProduct[] {
  return all
    .filter((p) => p.slug !== current.slug)
    .sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      if (a.kind === current.kind) scoreA += 3;
      if (b.kind === current.kind) scoreB += 3;
      if (a.family === current.family) scoreA += 2;
      if (b.family === current.family) scoreB += 2;
      if (a.collectionSlug && a.collectionSlug === current.collectionSlug) scoreA += 2;
      if (b.collectionSlug && b.collectionSlug === current.collectionSlug) scoreB += 2;
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

export const productsQuery = queryOptions({
  queryKey: ["catalog", "products"],
  queryFn: fetchProducts,
  staleTime: 60_000,
});

export const productBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["catalog", "product", slug],
    queryFn: () => fetchProductBySlug(slug),
    staleTime: 60_000,
  });

export const collectionsQuery = queryOptions({
  queryKey: ["catalog", "collections"],
  queryFn: fetchCollections,
  staleTime: 5 * 60_000,
});

export const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "best-selling", label: "Best Selling" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "discount", label: "Biggest Savings" },
] as const;

export type SortValue = (typeof sortOptions)[number]["value"];

export type ProductFilters = {
  searchQuery?: string | undefined;
  category?: string | undefined;
  gender?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  family?: string | undefined;
  notes?: string[] | undefined;
  concentration?: string | undefined;
  size?: string | undefined;
  rating?: number | undefined;
  inStockOnly?: boolean | undefined;
  collection?: string | undefined;
  occasion?: string | undefined;
  longevityMin?: number | undefined;
  sillageMin?: number | undefined;
};

export function filterAndSortProducts(
  products: CatalogProduct[],
  filters: ProductFilters,
  sort: string = "recommended",
): CatalogProduct[] {
  const filtered = products.filter((p) => {
    // Text search (name, description, family, category, notes)
    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase().trim();
      const allNotes = [...p.notes.top, ...p.notes.heart, ...p.notes.base].join(" ").toLowerCase();
      const textMatches =
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.family.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        allNotes.includes(q);
      if (!textMatches) return false;
    }

    // Category
    if (filters.category && filters.category !== "all") {
      const catSlug = filters.category.toLowerCase().replace(/\s+/g, "-");
      const pCat = p.categoryName.toLowerCase().replace(/\s+/g, "-");
      if (pCat !== catSlug && p.kind !== filters.category) return false;
    }

    // Gender
    if (filters.gender && filters.gender !== "all") {
      if (filters.gender === "Unisex") {
        // unisex includes unisex
        if (p.gender !== "Unisex") return false;
      } else {
        // men or women can wear unisex as well, but strict filter:
        if (p.gender !== filters.gender && p.gender !== "Unisex") return false;
      }
    }

    // Price
    if (filters.minPrice !== undefined && p.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false;

    // Fragrance Family
    if (filters.family && filters.family !== "all") {
      if (p.family.toLowerCase() !== filters.family.toLowerCase()) return false;
    }

    // Fragrance Notes (any selected note match)
    if (filters.notes && filters.notes.length > 0) {
      const pNotes = [...p.notes.top, ...p.notes.heart, ...p.notes.base].map((n) =>
        n.toLowerCase(),
      );
      const hasNote = filters.notes.some((filterNote) =>
        pNotes.some((n) => n.includes(filterNote.toLowerCase())),
      );
      if (!hasNote) return false;
    }

    // Concentration
    if (filters.concentration && filters.concentration !== "all") {
      if (!p.concentration.toLowerCase().includes(filters.concentration.toLowerCase()))
        return false;
    }

    // Size / Volume
    if (filters.size && filters.size !== "all") {
      const hasSize = p.variants.some((v) => v.label.toLowerCase() === filters.size?.toLowerCase());
      if (!hasSize) return false;
    }

    // Rating
    if (filters.rating !== undefined && filters.rating > 0) {
      if (p.rating < filters.rating) return false;
    }

    // Availability
    if (filters.inStockOnly) {
      if (!p.inStock) return false;
    }

    // Collection
    if (filters.collection && filters.collection !== "all") {
      if (p.collectionSlug !== filters.collection) return false;
    }

    // Occasion
    if (filters.occasion && filters.occasion !== "all") {
      const hasOccasion = p.occasions.some((o) =>
        o.toLowerCase().includes(filters.occasion!.toLowerCase()),
      );
      if (!hasOccasion) return false;
    }

    // Longevity
    if (filters.longevityMin !== undefined && filters.longevityMin > 0) {
      if (p.performance.longevity < filters.longevityMin) return false;
    }

    // Sillage
    if (filters.sillageMin !== undefined && filters.sillageMin > 0) {
      if (p.performance.sillage < filters.sillageMin) return false;
    }

    return true;
  });

  // Sorting
  const sorted = [...filtered];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    case "best-selling":
      return sorted.sort(
        (a, b) =>
          (b.badge === "BEST SELLER" ? 1 : 0) - (a.badge === "BEST SELLER" ? 1 : 0) ||
          b.reviews - a.reviews,
      );
    case "newest":
      return sorted.sort((a, b) => (b.badge === "NEW" ? 1 : 0) - (a.badge === "NEW" ? 1 : 0));
    case "discount":
      return sorted.sort((a, b) => {
        const discA = (a.mrp - a.price) / a.mrp || 0;
        const discB = (b.mrp - b.price) / b.mrp || 0;
        return discB - discA;
      });
    case "recommended":
    default:
      return sorted;
  }
}
