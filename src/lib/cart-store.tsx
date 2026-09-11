import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

export type CartItem = {
  productId: string;
  productSlug: string;
  name: string;
  variantLabel: string;
  price: number;
  mrp: number;
  quantity: number;
  tint: string;
  category: string;
  modelUrl?: string | null | undefined;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productSlug: string, variantLabel: string) => void;
  updateQuantity: (productSlug: string, variantLabel: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  subtotal: number;
  totalMrp: number;
  totalSavings: number;
  freeShippingThreshold: number;
  shippingRemaining: number;
};

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = "k_essence_cart_v1";
const FREE_SHIPPING_THRESHOLD = 1499;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [items]);

  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.productSlug === item.productSlug && i.variantLabel === item.variantLabel,
      );

      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx]!,
          quantity: next[existingIdx]!.quantity + quantity,
        };
        return next;
      }
      return [...prev, { ...item, quantity }];
    });

    toast.success(`Added ${item.name} (${item.variantLabel}) to cart`, {
      description: "Ready for checkout",
      action: {
        label: "View Cart",
        onClick: () => setIsCartOpen(true),
      },
    });
  };

  const removeItem = (productSlug: string, variantLabel: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productSlug === productSlug && i.variantLabel === variantLabel)),
    );
  };

  const updateQuantity = (productSlug: string, variantLabel: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productSlug, variantLabel);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productSlug === productSlug && i.variantLabel === variantLabel ? { ...i, quantity } : i,
      ),
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalMrp = items.reduce((sum, i) => sum + i.mrp * i.quantity, 0);
  const totalSavings = Math.max(0, totalMrp - subtotal);
  const shippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        totalItems,
        subtotal,
        totalMrp,
        totalSavings,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        shippingRemaining,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
