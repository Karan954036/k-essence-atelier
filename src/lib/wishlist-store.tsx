import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

type WishlistContextType = {
  wishlistSlugs: string[];
  toggleWishlist: (slug: string, productName?: string) => void;
  isInWishlist: (slug: string) => boolean;
  totalWishlist: number;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

const WISHLIST_STORAGE_KEY = "k_essence_wishlist_v1";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistSlugs, setWishlistSlugs] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistSlugs));
    } catch (e) {
      console.error("Failed to save wishlist to localStorage", e);
    }
  }, [wishlistSlugs]);

  const toggleWishlist = (slug: string, productName?: string) => {
    const isSaved = wishlistSlugs.includes(slug);
    if (isSaved) {
      setWishlistSlugs((prev) => prev.filter((s) => s !== slug));
      toast.info(productName ? `Removed ${productName} from wishlist` : "Removed from wishlist");
    } else {
      setWishlistSlugs((prev) => [...prev, slug]);
      toast.success(productName ? `Saved ${productName} to wishlist` : "Saved to wishlist");
    }
  };

  const isInWishlist = (slug: string) => wishlistSlugs.includes(slug);

  return (
    <WishlistContext.Provider
      value={{
        wishlistSlugs,
        toggleWishlist,
        isInWishlist,
        totalWishlist: wishlistSlugs.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}
