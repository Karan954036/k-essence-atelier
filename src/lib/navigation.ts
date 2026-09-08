export type MegaMenu = {
  label: string;
  columns: { title: string; items: string[] }[];
};

export const megaMenus: MegaMenu[] = [
  {
    label: "Shop",
    columns: [
      {
        title: "Fragrance",
        items: ["Perfumes", "Attars", "Premium Attars", "Oud Collection", "Non-Alcoholic Fragrances", "Perfume Oils"],
      },
      {
        title: "Sets",
        items: ["Gift Sets", "Combo Sets", "Discovery Sets"],
      },
      {
        title: "Discover",
        items: ["New Arrivals", "Best Sellers"],
      },
    ],
  },
  {
    label: "Perfumes",
    columns: [
      { title: "By audience", items: ["Men", "Women", "Unisex"] },
      { title: "By tier", items: ["Premium", "Everyday", "Luxury"] },
      { title: "By performance", items: ["Long Lasting"] },
    ],
  },
  {
    label: "Attars",
    columns: [
      { title: "Style", items: ["Traditional Attars", "Luxury Attars", "Oud Attars"] },
      { title: "Family", items: ["Musk Attars", "Floral Attars", "Woody Attars"] },
      { title: "Ingredient", items: ["Sandalwood", "Saffron"] },
    ],
  },
  {
    label: "Collections",
    columns: [
      { title: "Signature", items: ["Royal Collection", "Signature Collection", "Oud Collection"] },
      { title: "Occasion", items: ["Arabic Collection", "Daily Wear", "Wedding Collection"] },
      { title: "Special", items: ["Luxury Collection", "Limited Edition", "Best Sellers"] },
    ],
  },
  {
    label: "Gifting",
    columns: [
      { title: "Sets", items: ["Gift Sets", "Couples Sets", "Discovery Sets"] },
      { title: "For", items: ["Men's Gifts", "Women's Gifts"] },
      { title: "Occasions", items: ["Corporate Gifting", "Festival Gifts"] },
    ],
  },
];

export const simpleLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;
