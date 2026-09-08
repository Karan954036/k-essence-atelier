import { Link } from "@tanstack/react-router";
import { Home, Store, Search, Heart, User } from "lucide-react";

const items = [
  { label: "Home", icon: Home },
  { label: "Shop", icon: Store },
  { label: "Search", icon: Search },
  { label: "Wishlist", icon: Heart },
  { label: "Account", icon: User },
];

export function MobileBottomNav() {
  return (
    <nav className="glass-panel fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 rounded-none border-x-0 border-b-0 py-2 lg:hidden">
      {items.map(({ label, icon: Icon }) => (
        <Link
          key={label}
          to="/"
          className="flex flex-col items-center gap-1 py-1 text-[0.6rem] tracking-[0.14em] text-foreground/70 uppercase transition hover:text-gold"
        >
          <Icon className="h-4.5 w-4.5" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
