// DEMO / PLACEHOLDER catalog data used during Phase 1 development only.
// These are NOT actual K ESSENCE products. In Phase 2 these shapes are backed
// by database tables (products, product_variants, fragrance_notes, media,
// product_3d_models) and managed from the Admin CMS.

export type Badge = "BEST SELLER" | "NEW" | "TRENDING" | "LIMITED" | "EXCLUSIVE" | "SALE";

export type ProductSize = { label: string; price: number; mrp: number };

export type DemoProduct = {
  slug: string;
  name: string;
  category: string;
  kind: "perfume" | "attar" | "gift-set";
  badge?: Badge;
  rating: number;
  reviews: number;
  mrp: number;
  price: number;
  sizes: ProductSize[];
  family: string;
  notes: { top: string[]; heart: string[]; base: string[] };
  performance: { longevity: number; sillage: number; projection: number };
  /** Set when a real GLB/GLTF model has been uploaded from Admin. */
  modelUrl?: string;
  inStock: boolean;
  /** Bottle tint used by the procedural 3D / fallback visual. */
  tint: string;
};

export const demoProducts: DemoProduct[] = [
  {
    slug: "royal-oud",
    name: "Royal Oud",
    category: "Luxury Attar",
    kind: "attar",
    badge: "BEST SELLER",
    rating: 4.8,
    reviews: 124,
    mrp: 1699,
    price: 1299,
    sizes: [
      { label: "10ml", price: 1299, mrp: 1699 },
      { label: "20ml", price: 2199, mrp: 2899 },
    ],
    family: "Woody",
    notes: { top: ["Bergamot", "Saffron"], heart: ["Rose", "Oud"], base: ["Musk", "Amber"] },
    performance: { longevity: 9, sillage: 8, projection: 8 },
    inStock: true,
    tint: "#3a2416",
  },
  {
    slug: "amber-noir",
    name: "Amber Noir",
    category: "Signature Perfume",
    kind: "perfume",
    badge: "TRENDING",
    rating: 4.7,
    reviews: 96,
    mrp: 2499,
    price: 1899,
    sizes: [
      { label: "50ml", price: 1899, mrp: 2499 },
      { label: "100ml", price: 2999, mrp: 3899 },
    ],
    family: "Amber",
    notes: { top: ["Cardamom", "Bergamot"], heart: ["Amber", "Jasmine"], base: ["Vanilla", "Cedar"] },
    performance: { longevity: 8, sillage: 8, projection: 7 },
    inStock: true,
    tint: "#4a2c12",
  },
  {
    slug: "sandal-musk",
    name: "Sandal Musk",
    category: "Traditional Attar",
    kind: "attar",
    badge: "NEW",
    rating: 4.6,
    reviews: 61,
    mrp: 1299,
    price: 999,
    sizes: [
      { label: "10ml", price: 999, mrp: 1299 },
      { label: "20ml", price: 1699, mrp: 2199 },
    ],
    family: "Musky",
    notes: { top: ["Sandalwood"], heart: ["White Musk"], base: ["Patchouli", "Amber"] },
    performance: { longevity: 8, sillage: 6, projection: 6 },
    inStock: true,
    tint: "#5d4630",
  },
  {
    slug: "oud-royale",
    name: "Oud Royale",
    category: "Premium Attar",
    kind: "attar",
    badge: "EXCLUSIVE",
    rating: 4.9,
    reviews: 152,
    mrp: 3899,
    price: 2999,
    sizes: [
      { label: "10ml", price: 2999, mrp: 3899 },
      { label: "20ml", price: 4999, mrp: 6499 },
    ],
    family: "Oriental",
    notes: { top: ["Saffron", "Nutmeg"], heart: ["Oud", "Rose"], base: ["Sandalwood", "Musk"] },
    performance: { longevity: 10, sillage: 9, projection: 9 },
    inStock: true,
    tint: "#2b1a10",
  },
  {
    slug: "royal-rose",
    name: "Royal Rose",
    category: "Floral Perfume",
    kind: "perfume",
    badge: "BEST SELLER",
    rating: 4.7,
    reviews: 88,
    mrp: 2199,
    price: 1699,
    sizes: [
      { label: "50ml", price: 1699, mrp: 2199 },
      { label: "100ml", price: 2699, mrp: 3499 },
    ],
    family: "Floral",
    notes: { top: ["Litchi", "Bergamot"], heart: ["Damask Rose", "Peony"], base: ["Musk", "Cedar"] },
    performance: { longevity: 7, sillage: 7, projection: 7 },
    inStock: true,
    tint: "#5a2231",
  },
  {
    slug: "musk-noir",
    name: "Musk Noir",
    category: "Everyday Perfume",
    kind: "perfume",
    badge: "SALE",
    rating: 4.5,
    reviews: 74,
    mrp: 1799,
    price: 1199,
    sizes: [
      { label: "50ml", price: 1199, mrp: 1799 },
      { label: "100ml", price: 1999, mrp: 2799 },
    ],
    family: "Musky",
    notes: { top: ["Green Apple"], heart: ["White Musk", "Iris"], base: ["Vetiver", "Amber"] },
    performance: { longevity: 7, sillage: 6, projection: 6 },
    inStock: true,
    tint: "#232326",
  },
  {
    slug: "saffron-oud",
    name: "Saffron Oud",
    category: "Oud Collection",
    kind: "attar",
    badge: "LIMITED",
    rating: 4.8,
    reviews: 43,
    mrp: 3299,
    price: 2599,
    sizes: [
      { label: "10ml", price: 2599, mrp: 3299 },
      { label: "20ml", price: 4299, mrp: 5499 },
    ],
    family: "Spicy",
    notes: { top: ["Saffron", "Pink Pepper"], heart: ["Oud", "Leather"], base: ["Amber", "Musk"] },
    performance: { longevity: 9, sillage: 9, projection: 8 },
    inStock: false,
    tint: "#6b3a12",
  },
  {
    slug: "velvet-amber",
    name: "Velvet Amber",
    category: "Luxury Perfume",
    kind: "perfume",
    badge: "NEW",
    rating: 4.6,
    reviews: 37,
    mrp: 2899,
    price: 2299,
    sizes: [
      { label: "50ml", price: 2299, mrp: 2899 },
      { label: "100ml", price: 3599, mrp: 4499 },
    ],
    family: "Gourmand",
    notes: { top: ["Tonka", "Bergamot"], heart: ["Amber", "Vanilla Orchid"], base: ["Benzoin", "Sandalwood"] },
    performance: { longevity: 8, sillage: 7, projection: 7 },
    inStock: true,
    tint: "#4d3418",
  },
];

export const bestSellers = demoProducts.filter((p) => p.badge === "BEST SELLER" || p.rating >= 4.8);
export const signaturePerfumes = demoProducts.filter((p) => p.kind === "perfume");
export const premiumAttars = demoProducts.filter((p) => p.kind === "attar");
export const newArrivals = demoProducts.filter((p) => p.badge === "NEW" || p.badge === "LIMITED");

export const featuredCollections = [
  {
    slug: "royal-collection",
    title: "Royal Collection",
    line: "Regal oud, saffron and rose",
    tint: "#3a2416",
  },
  {
    slug: "signature-attars",
    title: "Signature Attars",
    line: "Alcohol-free, traditionally blended",
    tint: "#5d4630",
  },
  {
    slug: "oud-collection",
    title: "The Oud Collection",
    line: "Deep, resinous, unmistakable",
    tint: "#2b1a10",
  },
  {
    slug: "luxury-perfumes",
    title: "Luxury Perfumes",
    line: "Modern eau de parfum, long lasting",
    tint: "#4a2c12",
  },
];

export const demoReviews = [
  {
    name: "Aarav S.",
    location: "Delhi",
    rating: 5,
    text: "Royal Oud lasts the whole day on me. The sillage is genuinely impressive for an attar.",
  },
  {
    name: "Meera K.",
    location: "Mumbai",
    rating: 5,
    text: "Amber Noir feels far more expensive than it is. Packaging felt like a gift in itself.",
  },
  {
    name: "Rehan A.",
    location: "Lucknow",
    rating: 4,
    text: "Sandal Musk is beautifully balanced — soft, warm, never sharp. Reordering already.",
  },
];
