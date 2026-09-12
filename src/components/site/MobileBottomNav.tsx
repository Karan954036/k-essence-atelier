import { Link } from "@tanstack/react-router";
import { Home, Store, Search, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";

export function MobileBottomNav() {
  const { openCart, totalItems } = useCart();
  const { totalWishlist } = useWishlist();

  return (
    <nav className="glass-panel fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 rounded-none border-x-0 border-b-0 py-2 lg:hidden bg-obsidian/95 backdrop-blur-md">
      <Link
        to="/"
        className="flex flex-col items-center gap-1 py-1 text-[0.6rem] tracking-[0.14em] text-foreground/70 uppercase transition hover:text-gold"
      >
        <Home className="h-4.5 w-4.5" />
        Home
      </Link>

      <Link
        to="/shop"
        className="flex flex-col items-center gap-1 py-1 text-[0.6rem] tracking-[0.14em] text-foreground/70 uppercase transition hover:text-gold"
      >
        <Store className="h-4.5 w-4.5" />
        Shop
      </Link>

      <Link
        to="/shop"
        className="flex flex-col items-center gap-1 py-1 text-[0.6rem] tracking-[0.14em] text-foreground/70 uppercase transition hover:text-gold"
      >
        <Search className="h-4.5 w-4.5" />
        Search
      </Link>

      <Link
        to="/shop"
        search={{ sort: "rating" }}
        className="relative flex flex-col items-center gap-1 py-1 text-[0.6rem] tracking-[0.14em] text-foreground/70 uppercase transition hover:text-gold"
      >
        <Heart className="h-4.5 w-4.5" />
        {totalWishlist > 0 && (
          <span className="absolute top-0 right-4 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gold text-[0.55rem] font-medium text-obsidian">
            {totalWishlist}
          </span>
        )}
        Wishlist
      </Link>

      <button
        type="button"
        onClick={openCart}
        className="relative flex flex-col items-center gap-1 py-1 text-[0.6rem] tracking-[0.14em] text-foreground/70 uppercase transition hover:text-gold cursor-pointer"
      >
        <ShoppingBag className="h-4.5 w-4.5" />
        {totalItems > 0 && (
          <span className="absolute top-0 right-4 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gold text-[0.55rem] font-medium text-obsidian">
            {totalItems}
          </span>
        )}
        Bag
      </button>
    </nav>
  );
}
