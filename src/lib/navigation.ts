/** Shop filter shape shared by the /shop route and all navigation links. */
export type ShopSearch = {
  kind?: string | undefined;
  family?: string | undefined;
  collection?: string | undefined;
  q?: string | undefined;
  sort?: string | undefined;
};

export type NavItem = { label: string; search: ShopSearch };

export type MegaMenu = {
  label: string;
  columns: { title: string; items: NavItem[] }[];
};

const item = (label: string, search: ShopSearch = {}): NavItem => ({ label, search });

export const megaMenus: MegaMenu[] = [
  {
    label: "Shop",
    columns: [
      {
        title: "Fragrance",
        items: [
          item("All Fragrances"),
          item("Perfumes", { kind: "perfume" }),
          item("Attars", { kind: "attar" }),
          item("Oud Collection", { collection: "oud-collection" }),
          item("Woody", { family: "Woody" }),
          item("Musky", { family: "Musky" }),
        ],
      },
      {
        title: "Collections",
        items: [
          item("Royal Collection", { collection: "royal-collection" }),
          item("Signature Attars", { collection: "signature-attars" }),
          item("Luxury Perfumes", { collection: "luxury-perfumes" }),
        ],
      },
      {
        title: "Discover",
        items: [
          item("Top Rated", { sort: "rating" }),
          item("Lowest Price", { sort: "price-asc" }),
          item("Highest Price", { sort: "price-desc" }),
        ],
      },
    ],
  },
  {
    label: "Perfumes",
    columns: [
      {
        title: "By family",
        items: [
          item("Amber", { kind: "perfume", family: "Amber" }),
          item("Floral", { kind: "perfume", family: "Floral" }),
          item("Gourmand", { kind: "perfume", family: "Gourmand" }),
        ],
      },
      {
        title: "By tier",
        items: [
          item("Luxury Perfumes", { collection: "luxury-perfumes" }),
          item("All Perfumes", { kind: "perfume" }),
        ],
      },
      {
        title: "By rating",
        items: [item("Top Rated Perfumes", { kind: "perfume", sort: "rating" })],
      },
    ],
  },
  {
    label: "Attars",
    columns: [
      {
        title: "Style",
        items: [
          item("All Attars", { kind: "attar" }),
          item("Oud Attars", { kind: "attar", family: "Oriental" }),
          item("Spicy Attars", { kind: "attar", family: "Spicy" }),
        ],
      },
      {
        title: "Family",
        items: [
          item("Musk Attars", { kind: "attar", family: "Musky" }),
          item("Woody Attars", { kind: "attar", family: "Woody" }),
        ],
      },
      {
        title: "Ingredient",
        items: [item("Oud", { q: "oud" }), item("Sandalwood", { q: "sandal" }), item("Saffron", { q: "saffron" })],
      },
    ],
  },
  {
    label: "Collections",
    columns: [
      {
        title: "Signature",
        items: [
          item("Royal Collection", { collection: "royal-collection" }),
          item("Signature Attars", { collection: "signature-attars" }),
          item("The Oud Collection", { collection: "oud-collection" }),
        ],
      },
      {
        title: "Luxury",
        items: [item("Luxury Perfumes", { collection: "luxury-perfumes" })],
      },
      {
        title: "Browse",
        items: [item("Everything", {}), item("Top Rated", { sort: "rating" })],
      },
    ],
  },
];

export const simpleLinks = [
  { label: "Home", to: "/" },
  { label: "Gifting", to: "/gifting" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;
