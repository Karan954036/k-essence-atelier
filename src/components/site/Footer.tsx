import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube } from "lucide-react";
const LOGO_SRC = "/k-essence-logo.jpeg";

const columns = [
  { title: "Shop", items: ["Perfumes", "Attars", "Oud", "Collections", "Gift Sets"] },
  { title: "Customer Support", items: ["Contact", "Track Order", "Shipping", "Returns", "FAQ"] },
  { title: "Company", items: ["About", "Manufacturing", "Wholesale", "Privacy", "Terms"] },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-charcoal/40">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 lg:grid-cols-[1.3fr_repeat(3,minmax(0,1fr))] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img src={LOGO_SRC} alt="K ESSENCE" className="h-12 w-12 rounded-full object-cover" />
            <span className="font-display text-xl tracking-[0.3em] text-champagne">K ESSENCE</span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            A perfume and attar manufacturer, blending Indian and oriental fragrance heritage with
            modern perfumery. Crafted for those who leave a trace.
          </p>
          <div className="mt-6 flex gap-4 text-foreground/70">
            <a
              href="https://www.instagram.com/kumar_essence/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="transition hover:text-gold"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <span aria-label="Facebook (not yet configured)" className="opacity-40">
              <Facebook className="h-5 w-5" />
            </span>
            <span aria-label="YouTube (not yet configured)" className="opacity-40">
              <Youtube className="h-5 w-5" />
            </span>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="eyebrow mb-5">{col.title}</p>
            <ul className="space-y-3">
              {col.items.map((item) => (
                <li key={item}>
                  <Link
                    to="/"
                    className="text-sm text-muted-foreground transition hover:text-champagne"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="hairline-gold h-px" />
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p>© {new Date().getFullYear()} K ESSENCE. All rights reserved.</p>
        <p className="tracking-[0.2em] uppercase">Where tradition meets modern luxury</p>
      </div>
    </footer>
  );
}
