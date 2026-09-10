import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  kind: string;
  family: string;
  badge: string | null;
  description: string | null;
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

type Row = Record<string, any>;

function toProduct(row: Row): CatalogProduct {
  const notes: FragranceNotes = { top: [], heart: [], base: [] };
  const rawNotes = [...((row['product_notes'] ?? []) as Row[])].sort(
    (a, b) => (a['sort_order'] ?? 0) - (b['sort_order'] ?? 0),
  );
  for (const n of rawNotes) {
    const layer = n['layer'] as keyof FragranceNotes;
    if (layer in notes) notes[layer].push(n['name'] as string);
  }

  const variants = [...((row['product_variants'] ?? []) as Row[])]
    .sort((a, b) => (a['sort_order'] ?? 0) - (b['sort_order'] ?? 0))
    .map((v) => ({
      id: v['id'] as string,
      label: v['label'] as string,
      price: Number(v['price']),
      mrp: Number(v['mrp']),
      stock: Number(v['stock'] ?? 0),
    }));

  return {
    id: row['id'],
    slug: row['slug'],
    name: row['name'],
    kind: row['kind'],
    family: row['family'] ?? "",
    badge: row['badge'] ?? null,
    description: row['description'] ?? null,
    tint: row['tint'] ?? "#3a2416",
    modelUrl: row['model_url'] ?? null,
    rating: Number(row['rating'] ?? 0),
    reviews: Number(row['review_count'] ?? 0),
    mrp: Number(row['mrp'] ?? 0),
    price: Number(row['price'] ?? 0),
    inStock: Boolean(row['in_stock']),
    isDemo: Boolean(row['is_demo']),
    categoryName: row['categories']?.['name'] ?? "",
    categorySlug: row['categories']?.['slug'] ?? null,
    collectionSlug: row['collections']?.['slug'] ?? null,
    performance: {
      longevity: Number(row['longevity'] ?? 0),
      sillage: Number(row['sillage'] ?? 0),
      projection: Number(row['projection'] ?? 0),
    },
    variants,
    notes,
  };
}

export async function fetchProducts(): Promise<CatalogProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map(toProduct);
}

export async function fetchCollections(): Promise<CatalogCollection[]> {
  const { data, error } = await supabase
    .from("collections")
    .select("slug, title, tagline, tint, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map((c) => ({
    slug: c['slug'],
    title: c['title'],
    tagline: c['tagline'] ?? null,
    tint: c['tint'] ?? "#3a2416",
  }));
}

export const productsQuery = queryOptions({
  queryKey: ["catalog", "products"],
  queryFn: fetchProducts,
  staleTime: 60_000,
});

export const collectionsQuery = queryOptions({
  queryKey: ["catalog", "collections"],
  queryFn: fetchCollections,
  staleTime: 5 * 60_000,
});

export const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "name", label: "A–Z" },
] as const;

export function sortProducts(list: CatalogProduct[], sort: string): CatalogProduct[] {
  const out = [...list];
  switch (sort) {
    case "price-asc":
      return out.sort((a, b) => a.price - b.price);
    case "price-desc":
      return out.sort((a, b) => b.price - a.price);
    case "rating":
      return out.sort((a, b) => b.rating - a.rating);
    case "name":
      return out.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return out;
  }
}
