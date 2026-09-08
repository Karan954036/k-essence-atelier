import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, User, Heart, ShoppingBag, Menu, X } from "lucide-react";
import logo from "@/assets/k-essence-logo.asset.json";
import { megaMenus, simpleLinks } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function AnnouncementBar({
  text = "Crafted in India • Premium Fragrances • Signature Attars",
  enabled = true,
}: {
  text?: string;
  enabled?: boolean;
}) {
  if (!enabled) return null;
  return (
    <div className="border-b border-border bg-charcoal/60">
      <p className="eyebrow mx-auto max-w-7xl px-4 py-2.5 text-center text-[0.625rem] sm:text-[0.6875rem]">
        {text}
      </p>
    </div>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled ? "glass-panel border-x-0 border-t-0 shadow-none" : "bg-transparent border-b border-transparent",
      )}
      onMouseLeave={() => setOpen(null)}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-4 py-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Open menu"
            className="text-foreground/80 transition hover:text-gold lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            aria-label="Search"
            className="hidden items-center gap-2 text-xs tracking-[0.2em] text-foreground/70 transition hover:text-gold lg:flex"
          >
            <Search className="h-4 w-4 shrink-0" />
            SEARCH
          </button>
        </div>

        <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="K ESSENCE home">
          <img src={logo.url} alt="K ESSENCE" className="h-11 w-11 rounded-full object-cover sm:h-12 sm:w-12" />
          <span className="font-display text-lg tracking-[0.34em] text-champagne sm:text-xl">K ESSENCE</span>
        </Link>

        <div className="flex min-w-0 items-center justify-end gap-4 text-foreground/80">
          <button aria-label="Search" className="transition hover:text-gold lg:hidden">
            <Search className="h-5 w-5" />
          </button>
          <Link to="/" aria-label="Account" className="hidden transition hover:text-gold sm:block">
            <User className="h-5 w-5" />
          </Link>
          <Link to="/" aria-label="Wishlist" className="hidden transition hover:text-gold sm:block">
            <Heart className="h-5 w-5" />
          </Link>
          <Link to="/" aria-label="Cart" className="transition hover:text-gold">
            <ShoppingBag className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <div className="hairline-gold hidden h-px lg:block" />

      {/* Desktop nav + mega menu */}
      <nav className="relative hidden justify-center gap-9 py-3 lg:flex">
        <Link
          to="/"
          className="text-[0.7rem] tracking-[0.24em] text-foreground/75 uppercase transition hover:text-gold"
          onMouseEnter={() => setOpen(null)}
        >
          Home
        </Link>
        {megaMenus.map((menu) => (
          <button
            key={menu.label}
            className={cn(
              "text-[0.7rem] tracking-[0.24em] uppercase transition",
              open === menu.label ? "text-gold" : "text-foreground/75 hover:text-gold",
            )}
            onMouseEnter={() => setOpen(menu.label)}
            onFocus={() => setOpen(menu.label)}
          >
            {menu.label}
          </button>
        ))}
        {simpleLinks.slice(1).map((l) => (
          <Link
            key={l.label}
            to="/"
            className="text-[0.7rem] tracking-[0.24em] text-foreground/75 uppercase transition hover:text-gold"
            onMouseEnter={() => setOpen(null)}
          >
            {l.label}
          </Link>
        ))}

        {open && (
          <div className="absolute top-full left-0 w-full">
            <div className="glass-panel mx-auto grid max-w-7xl grid-cols-[repeat(3,minmax(0,1fr))_18rem] gap-10 rounded-b-lg px-10 py-9">
              {megaMenus
                .find((m) => m.label === open)!
                .columns.map((col) => (
                  <div key={col.title} className="min-w-0">
                    <p className="eyebrow mb-4">{col.title}</p>
                    <ul className="space-y-2.5">
                      {col.items.map((item) => (
                        <li key={item}>
                          <Link
                            to="/"
                            className="text-sm text-foreground/75 transition hover:text-champagne"
                          >
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              <div className="light-sweep relative overflow-hidden rounded-md border border-border">
                <div
                  className="h-full min-h-40 w-full"
                  style={{
                    background:
                      "radial-gradient(70% 70% at 50% 30%, oklch(0.35 0.06 65) 0%, oklch(0.12 0.01 60) 70%)",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="eyebrow">Featured</p>
                  <p className="font-display text-xl text-champagne">The Oud Collection</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-obsidian/95 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between px-4 py-5">
            <span className="font-display text-lg tracking-[0.3em] text-champagne">K ESSENCE</span>
            <button aria-label="Close menu" onClick={() => setMobileOpen(false)}>
              <X className="h-6 w-6 text-foreground/80" />
            </button>
          </div>
          <div className="hairline-gold h-px" />
          <div className="h-[calc(100vh-5rem)] overflow-y-auto px-6 py-6">
            {megaMenus.map((menu) => (
              <div key={menu.label} className="mb-7">
                <p className="eyebrow mb-3">{menu.label}</p>
                <ul className="grid grid-cols-2 gap-2">
                  {menu.columns.flatMap((c) => c.items).map((item) => (
                    <li key={item}>
                      <Link to="/" className="text-sm text-foreground/75" onClick={() => setMobileOpen(false)}>
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
