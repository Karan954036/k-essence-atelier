import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, User, Heart, ShoppingBag, Menu, X } from "lucide-react";
// Use the local public asset for the logo to avoid preview-hosted URLs
const LOGO_SRC = "/k-essence-logo.jpeg";
import { megaMenus, simpleLinks } from "@/lib/navigation";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

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

  const { openCart, totalItems } = useCart();
  const { totalWishlist } = useWishlist();
  const { user, signOut } = useAuth();
  const [acctOpen, setAcctOpen] = useState(false);

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
        scrolled
          ? "glass-panel border-x-0 border-t-0 shadow-none"
          : "bg-transparent border-b border-transparent",
      )}
      onMouseLeave={() => setOpen(null)}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-4 py-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Open menu"
            className="text-foreground/80 transition hover:text-gold lg:hidden cursor-pointer"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            to="/shop"
            aria-label="Search the collection"
            className="hidden items-center gap-2 text-xs tracking-[0.2em] text-foreground/70 transition hover:text-gold lg:flex"
          >
            <Search className="h-4 w-4 shrink-0" />
            SEARCH
          </Link>
        </div>

        <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="K ESSENCE home">
          <img src={LOGO_SRC} alt="K ESSENCE" className="h-11 w-11 rounded-full object-cover sm:h-12 sm:w-12" />
          <span className="font-display text-lg tracking-[0.34em] text-champagne sm:text-xl">
            K ESSENCE
          </span>
        </Link>

        <div className="flex min-w-0 items-center justify-end gap-4 text-foreground/80">
          <Link
            to="/shop"
            aria-label="Search the collection"
            className="transition hover:text-gold lg:hidden"
          >
            <Search className="h-5 w-5" />
          </Link>
          {!user ? (
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login" className="transition hover:text-gold">
                Login
              </Link>
              <Link to="/register" className="transition hover:text-gold">
                Register
              </Link>
            </div>
          ) : (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setAcctOpen((s) => !s)}
                className="transition hover:text-gold"
                aria-label="Account menu"
              >
                <User className="h-5 w-5" />
              </button>
              {acctOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-md border border-border bg-background p-2 shadow-lg">
                  <div className="px-3 py-2 text-sm text-foreground/80">{user.user_metadata?.full_name ?? user.email}</div>
                  <Link to="/account" className="block px-3 py-2 text-sm hover:text-gold">
                    Account
                  </Link>
                  <button onClick={() => signOut()} className="block w-full text-left px-3 py-2 text-sm hover:text-red-500">
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
          <Link
            to="/shop"
            search={{ sort: "rating" }}
            aria-label="Wishlist"
            className="relative hidden transition hover:text-gold sm:block"
          >
            <Heart className="h-5 w-5" />
            {totalWishlist > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full border border-gold/40 bg-obsidian px-1 text-[0.6rem] font-medium text-gold">
                {totalWishlist}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label="Shopping Bag"
            className="relative transition hover:text-gold cursor-pointer"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-medium text-obsidian shadow-sm">
                {totalItems}
              </span>
            )}
          </button>
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
        <Link
          to="/shop"
          className="text-[0.7rem] tracking-[0.24em] text-foreground/75 uppercase transition hover:text-gold"
          onMouseEnter={() => setOpen(null)}
        >
          Shop
        </Link>
        {megaMenus.map((menu) => (
          <button
            key={menu.label}
            className={cn(
              "text-[0.7rem] tracking-[0.24em] uppercase transition cursor-pointer",
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
            to={l.to}
            className="text-[0.7rem] tracking-[0.24em] text-foreground/75 uppercase transition hover:text-gold"
            onMouseEnter={() => setOpen(null)}
          >
            {l.label}
          </Link>
        ))}

        {open && (
          <div className="absolute top-full left-0 w-full z-50">
            <div className="glass-panel mx-auto grid max-w-7xl grid-cols-[repeat(3,minmax(0,1fr))_18rem] gap-10 rounded-b-lg px-10 py-9">
              {megaMenus
                .find((m) => m.label === open)!
                .columns.map((col) => (
                  <div key={col.title} className="min-w-0">
                    <p className="eyebrow mb-4">{col.title}</p>
                    <ul className="space-y-2.5">
                      {col.items.map((navItem) => (
                        <li key={navItem.label}>
                          <Link
                            to="/shop"
                            search={navItem.search}
                            className="text-sm text-foreground/75 transition hover:text-champagne"
                            onClick={() => setOpen(null)}
                          >
                            {navItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              <Link
                to="/shop"
                search={{ collection: "oud-collection" }}
                onClick={() => setOpen(null)}
                className="light-sweep relative overflow-hidden rounded-md border border-border"
              >
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
              </Link>
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
            <div className="mb-6">
              <Link
                to="/shop"
                className="font-display text-lg tracking-wider text-champagne flex items-center justify-between py-2 border-b border-border/60"
                onClick={() => setMobileOpen(false)}
              >
                <span>ALL FRAGRANCES</span>
                <span className="text-xs text-gold">EXPLORE →</span>
              </Link>
            </div>
            {megaMenus.map((menu) => (
              <div key={menu.label} className="mb-7">
                <p className="eyebrow mb-3">{menu.label}</p>
                <ul className="grid grid-cols-2 gap-2">
                  {menu.columns
                    .flatMap((c) => c.items)
                    .map((navItem) => (
                      <li key={navItem.label}>
                        <Link
                          to="/shop"
                          search={navItem.search}
                          className="text-sm text-foreground/75"
                          onClick={() => setMobileOpen(false)}
                        >
                          {navItem.label}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
            <div className="mt-4 grid gap-2 border-t border-border pt-6">
              {simpleLinks.slice(1).map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  className="text-sm text-foreground/75"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
