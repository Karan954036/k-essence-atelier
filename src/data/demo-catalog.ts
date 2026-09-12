// DEMO / PLACEHOLDER catalog data used during development and as resilient offline fallback.
// In Phase 2 these shapes are backed by Supabase tables (products, product_variants,
// fragrance_notes, media, product_3d_models) and managed from the Admin CMS.

export type Badge = "BEST SELLER" | "NEW" | "TRENDING" | "LIMITED" | "EXCLUSIVE" | "SALE";

export type ProductSize = { label: string; price: number; mrp: number; stock?: number };

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
  gender: "Unisex" | "Men" | "Women";
  concentration: string;
  occasions: string[];
  notes: { top: string[]; heart: string[]; base: string[] };
  performance: { longevity: number; sillage: number; projection: number };
  description: string;
  story?: string;
  volume: string;
  shelfLife: string;
  ingredients: string;
  howToUse: string;
  manufacturing: string;
  /** Set when a real GLB/GLTF model has been uploaded from Admin. */
  modelUrl?: string;
  inStock: boolean;
  /** Bottle tint used by the procedural 3D / fallback visual. */
  tint: string;
  collectionSlug?: string;
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
      { label: "10ml", price: 1299, mrp: 1699, stock: 25 },
      { label: "20ml", price: 2199, mrp: 2899, stock: 18 },
    ],
    family: "Woody",
    gender: "Unisex",
    concentration: "Pure Attar (100% Alcohol-Free Oil)",
    occasions: ["Royal & Festive", "Evening / Special Occasion", "Signature Scent"],
    notes: {
      top: ["Bergamot", "Saffron"],
      heart: ["Rose", "Oud"],
      base: ["Musk", "Amber", "Sandalwood"],
    },
    performance: { longevity: 9, sillage: 8, projection: 8 },
    description:
      "A regal woody attar composed of aged Assam oudh, Kashmiri saffron, and velvet Bulgarian rose, rooted in warm amber and musk.",
    story:
      "Royal Oud draws directly upon imperial Indian perfumery traditions. Steeped in deg-bhapka copper stills and aged in seasoned glass carboys, each batch matures for 45 days before hand-filling.",
    volume: "10ml / 20ml Concentrated Oil",
    shelfLife: "36 Months from Manufacturing Date",
    ingredients:
      "Simmondsia Chinensis (Jojoba) Seed Oil, Parfum (Fragrance Blend with Natural Agarwood Extract), Santalum Album (Sandalwood) Oil, Crocus Sativus (Saffron) Stigma Extract, Rosa Damascena Flower Oil, Alpha-Isomethyl Ionone, Citronellol, Geraniol, Linalool, Coumarin.",
    howToUse:
      "Apply 1–2 drops to pulse points (inner wrists, base of throat, behind ears) using the precision glass dipstick. Allow the oil to warm with your body heat; do not rub vigorously.",
    manufacturing:
      "Handcrafted and blended in small batches at K ESSENCE Atelier, Kannauj & Mumbai, India. Batch No: KE-RO-2026-B1.",
    inStock: true,
    tint: "#3a2416",
    collectionSlug: "royal-collection",
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
      { label: "50ml", price: 1899, mrp: 2499, stock: 20 },
      { label: "100ml", price: 2999, mrp: 3899, stock: 12 },
    ],
    family: "Amber",
    gender: "Unisex",
    concentration: "Eau de Parfum (25% Oil Concentration)",
    occasions: ["Evening / Special Occasion", "Date Night", "Signature Scent"],
    notes: {
      top: ["Cardamom", "Bergamot", "Pink Pepper"],
      heart: ["Amber", "Jasmine", "Cinnamon"],
      base: ["Madagascar Vanilla", "Cedarwood", "Patchouli"],
    },
    performance: { longevity: 8, sillage: 8, projection: 7 },
    description:
      "An intoxicating nocturnal blend of warm crystalline amber, smoked vanilla, and spiced cardamom encased in an obsidian glass flacon.",
    story:
      "Created for twilight and velvet evenings. Amber Noir balances resinous amber with crisp Italian bergamot, evolving into a sweet, dry smoky finish that lingers for hours.",
    volume: "50ml / 100ml Vaporisateur Spray",
    shelfLife: "36 Months from Manufacturing Date",
    ingredients:
      "Alcohol Denat. (Organic Sugarcane), Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Coumarin, Benzyl Benzoate, Eugenol, Citral, Cinnamal, Evernia Prunastri (Oakmoss) Extract.",
    howToUse:
      "Spritz 2–3 times onto pulse points from a distance of 6 inches. For enhanced projection, apply a mist across collarbones and jacket lapels.",
    manufacturing:
      "Formulated and matured in temperature-controlled vats at K ESSENCE Atelier, India. Batch No: KE-AN-2026-B2.",
    inStock: true,
    tint: "#4a2c12",
    collectionSlug: "luxury-perfumes",
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
      { label: "10ml", price: 999, mrp: 1299, stock: 30 },
      { label: "20ml", price: 1699, mrp: 2199, stock: 16 },
    ],
    family: "Musky",
    gender: "Unisex",
    concentration: "Pure Attar (100% Alcohol-Free Oil)",
    occasions: ["Daily Luxury", "Office / Signature", "Meditation & Calm"],
    notes: {
      top: ["Mysore Sandalwood", "Neroli"],
      heart: ["White Musk", "Cedar"],
      base: ["Patchouli", "Ambergris Accord"],
    },
    performance: { longevity: 8, sillage: 6, projection: 6 },
    description:
      "A serene and comforting accord of genuine sandalwood heartwood paired with pristine white musk and sheer golden amber.",
    story:
      "Sandal Musk is an ode to tranquility. Designed to sit close to the skin as an intimate, grounding scent bubble that calms the senses throughout the busiest day.",
    volume: "10ml / 20ml Concentrated Oil",
    shelfLife: "36 Months from Manufacturing Date",
    ingredients:
      "Santalum Album (Sandalwood) Oil, Simmondsia Chinensis Seed Oil, Parfum (Musk accord), Pogostemon Cablin (Patchouli) Leaf Oil, Farnesol, Geraniol.",
    howToUse:
      "Glide the glass rod lightly over the wrists and neckline. Perfect for personal sanctuary wear, daily office presence, or spiritual rituals.",
    manufacturing:
      "Slow-distilled and cold-filtered at K ESSENCE Atelier, India. Batch No: KE-SM-2026-B1.",
    inStock: true,
    tint: "#5d4630",
    collectionSlug: "signature-attars",
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
      { label: "10ml", price: 2999, mrp: 3899, stock: 10 },
      { label: "20ml", price: 4999, mrp: 6499, stock: 6 },
    ],
    family: "Oriental",
    gender: "Unisex",
    concentration: "Pure Attar (100% Alcohol-Free Oil)",
    occasions: ["Royal & Festive", "Evening / Special Occasion", "Wedding Celebrations"],
    notes: {
      top: ["Saffron", "Nutmeg", "Thyme"],
      heart: ["Vintage Cambodian Oud", "Taif Rose"],
      base: ["Sandalwood", "Black Musk", "Leather Accord"],
    },
    performance: { longevity: 10, sillage: 9, projection: 9 },
    description:
      "The pinnacle of high perfumery. Rare vintage oud resin infused with dark Taif rose, warm nutmeg, and aged Indian sandalwood.",
    story:
      "Distilled from wild-harvested agarwood aged over 12 years. Oud Royale is powerful, complex, and unyielding—a benchmark of Indian luxury.",
    volume: "10ml / 20ml Concentrated Oil in Gilded Crystal Flacon",
    shelfLife: "36 Months from Manufacturing Date",
    ingredients:
      "Aquilaria Agallocha (Agarwood) Wood Oil, Crocus Sativus Stigma Extract, Rosa Damascena Oil, Santalum Album Wood Oil, Natural Resinoid Musk Blend.",
    howToUse:
      "A solitary drop on clean pulse points is sufficient for 24-hour presence. Allow the deep base notes to unfold over several hours.",
    manufacturing:
      "Numbered artisanal micro-batches produced at K ESSENCE Atelier, India. Batch No: KE-OR-2026-ROYAL.",
    inStock: true,
    tint: "#2b1a10",
    collectionSlug: "oud-collection",
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
      { label: "50ml", price: 1699, mrp: 2199, stock: 22 },
      { label: "100ml", price: 2699, mrp: 3499, stock: 14 },
    ],
    family: "Floral",
    gender: "Women",
    concentration: "Eau de Parfum (22% Oil Concentration)",
    occasions: ["Romantic / Date Night", "Daily Luxury", "Festive Celebrations"],
    notes: {
      top: ["Litchi", "Bergamot", "Rhubarb"],
      heart: ["Damask Rose", "Peony", "Nutmeg"],
      base: ["White Musk", "Cedarwood", "Cashmeran"],
    },
    performance: { longevity: 7, sillage: 7, projection: 7 },
    description:
      "A modern dewy floral masterpiece featuring crisp dawn roses, sweet litchi, and velvety musk with a touch of radiant cedar.",
    story:
      "Royal Rose evokes the dew-covered petal gardens of Kannauj at dawn. Tender yet distinctly regal, crafted for those who celebrate luminous elegance.",
    volume: "50ml / 100ml Vaporisateur Spray",
    shelfLife: "36 Months from Manufacturing Date",
    ingredients:
      "Alcohol Denat., Parfum (Fragrance), Aqua, Citronellol, Geraniol, Linalool, Limonene, Benzyl Salicylate, Hydroxycitronellal, Eugenol.",
    howToUse:
      "Spray liberally over pulse points, hair ends, and clothing. Reapply throughout the day if desired for a fresh bloom.",
    manufacturing:
      "Crafted with natural rose extracts at K ESSENCE Atelier, India. Batch No: KE-RR-2026-B3.",
    inStock: true,
    tint: "#5a2231",
    collectionSlug: "royal-collection",
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
      { label: "50ml", price: 1199, mrp: 1799, stock: 26 },
      { label: "100ml", price: 1999, mrp: 2799, stock: 15 },
    ],
    family: "Musky",
    gender: "Men",
    concentration: "Eau de Parfum (20% Oil Concentration)",
    occasions: ["Daily Luxury", "Office / Signature", "Casual Elegance"],
    notes: {
      top: ["Green Apple", "Grapefruit"],
      heart: ["White Musk", "Iris", "Lavender"],
      base: ["Haitian Vetiver", "Amber", "Oakmoss"],
    },
    performance: { longevity: 7, sillage: 6, projection: 6 },
    description:
      "Crisp green apple and powdery iris layered over clean skin musk and earthy Haitian vetiver for unmatched daily refinement.",
    story:
      "Designed as the quintessential daily signature. Musk Noir is fresh, masculine, and sophisticated without ever overpowering a room.",
    volume: "50ml / 100ml Vaporisateur Spray",
    shelfLife: "36 Months from Manufacturing Date",
    ingredients:
      "Alcohol Denat., Parfum, Aqua, Limonene, Linalool, Alpha-Isomethyl Ionone, Citronellol, Coumarin, Evernia Prunastri Extract, Citral.",
    howToUse: "Apply 2–4 spritzes on the neck, shoulders, and wrists every morning after grooming.",
    manufacturing: "Precision-compounded at K ESSENCE Atelier, India. Batch No: KE-MN-2026-B1.",
    inStock: true,
    tint: "#232326",
    collectionSlug: "luxury-perfumes",
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
      { label: "10ml", price: 2599, mrp: 3299, stock: 0 },
      { label: "20ml", price: 4299, mrp: 5499, stock: 0 },
    ],
    family: "Spicy",
    gender: "Men",
    concentration: "Pure Attar (100% Alcohol-Free Oil)",
    occasions: ["Evening / Special Occasion", "Royal & Festive", "Winter Nights"],
    notes: {
      top: ["Saffron", "Pink Pepper", "Bitter Almond"],
      heart: ["Smoked Oud", "Tuscan Leather"],
      base: ["Amber", "Dark Musk", "Birch Tar"],
    },
    performance: { longevity: 9, sillage: 9, projection: 8 },
    description:
      "Fiery Kashmiri saffron, warm crushed pink pepper, and smoked agarwood wrapped in rich vintage leather.",
    story:
      "A daring, smoky composition celebrating the spicy warmth of Indian bazaar traditions combined with the regal majesty of oud.",
    volume: "10ml / 20ml Concentrated Oil",
    shelfLife: "36 Months from Manufacturing Date",
    ingredients:
      "Simmondsia Chinensis Seed Oil, Parfum (Saffron & Leather Accord), Aquilaria Wood Extract, Benzyl Benzoate, Eugenol, Isoeugenol, Cinnamal.",
    howToUse:
      "Touch a drop onto pulse points. Ideal for cool evenings and grand celebratory gatherings.",
    manufacturing:
      "Limited edition maturation at K ESSENCE Atelier, India. Batch No: KE-SO-2026-LTD.",
    inStock: false,
    tint: "#6b3a12",
    collectionSlug: "oud-collection",
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
      { label: "50ml", price: 2299, mrp: 2899, stock: 19 },
      { label: "100ml", price: 3599, mrp: 4499, stock: 9 },
    ],
    family: "Gourmand",
    gender: "Unisex",
    concentration: "Extrait de Parfum (30% Oil Concentration)",
    occasions: ["Evening / Special Occasion", "Romantic / Date Night", "Festive Celebrations"],
    notes: {
      top: ["Tonka Bean", "Bergamot", "Almond"],
      heart: ["Golden Amber", "Vanilla Orchid", "Heliotrope"],
      base: ["Benzoin Tears", "Creamy Sandalwood", "Praline"],
    },
    performance: { longevity: 8, sillage: 7, projection: 7 },
    description:
      "A sumptuous gourmand amber laced with toasted tonka bean, roasted almond, Madagascar vanilla orchid, and benzoin tears.",
    story:
      "Crafted as an opulent olfactory dessert. Velvet Amber melts into the skin like warm silk, creating an addictive trail of golden decadence.",
    volume: "50ml / 100ml Vaporisateur Spray",
    shelfLife: "36 Months from Manufacturing Date",
    ingredients:
      "Alcohol Denat., Parfum, Aqua, Coumarin, Benzyl Benzoate, Limonene, Linalool, Anise Alcohol, Benzyl Alcohol, Cinnamal.",
    howToUse:
      "Spritz 2–3 pumps across chest and collarbones. Layer with Sandal Musk attar for a bespoke gourmand sillage.",
    manufacturing:
      "Artisanal Extrait de Parfum batch blended at K ESSENCE Atelier, India. Batch No: KE-VA-2026-B1.",
    inStock: true,
    tint: "#4d3418",
    collectionSlug: "luxury-perfumes",
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
    date: "14 Feb 2026",
    verified: true,
    title: "Incredible Longevity and Imperial Character",
    text: "Royal Oud lasts the whole day on me. The sillage is genuinely impressive for an attar without ever being cloying. Compliments every time.",
  },
  {
    name: "Meera K.",
    location: "Mumbai",
    rating: 5,
    date: "28 Jan 2026",
    verified: true,
    title: "A True Luxury Experience",
    text: "Amber Noir feels far more expensive than it is. Packaging felt like a gift in itself and the dry-down of vanilla and cedar is sublime.",
  },
  {
    name: "Rehan A.",
    location: "Lucknow",
    rating: 4,
    date: "02 Mar 2026",
    verified: true,
    title: "Authentic Mysore Sandalwood",
    text: "Sandal Musk is beautifully balanced — soft, warm, never sharp. It has become my everyday signature for meetings and evening unwinding.",
  },
  {
    name: "Zoya P.",
    location: "Bengaluru",
    rating: 5,
    date: "20 Feb 2026",
    verified: true,
    title: "Most Beautiful Rose Perfume in India",
    text: "Royal Rose has a juicy litchi opening that turns into royal velvety petals. Not synthetic at all. Love the bottle presentation.",
  },
];
