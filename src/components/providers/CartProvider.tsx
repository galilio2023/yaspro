"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { GearItem, RentalDateRange, DeliveryMethod } from "@/features/gear/types";
import { calculateGearCartTotals, type GearRentalPricingBreakdown } from "@/features/gear/lib/cart-pricing";

const CART_STORAGE_KEY = "yaspro_cinema_cart_v1";

export interface CartContextValue {
  items: GearItem[];
  itemIds: string[];
  isInCart: (id: string) => boolean;
  addItem: (item: GearItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: GearItem) => void;
  clearCart: () => void;
  dateRange: RentalDateRange;
  setDateRange: (range: RentalDateRange) => void;
  deliveryMethod: DeliveryMethod;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCartDrawer: () => void;
  totalCount: number;
  totals: GearRentalPricingBreakdown;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

function getInitialDateRange(): RentalDateRange {
  const today = new Date().toISOString().split("T")[0];
  return {
    pickupDate: today,
    returnDate: today,
    totalDays: 1,
    billingMultiplier: 1,
    discountPercentage: 0,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<GearItem[]>([]);
  const [dateRange, setDateRange] = useState<RentalDateRange>(getInitialDateRange);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("studio_delivery");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (Array.isArray(parsed.items)) setItems(parsed.items);
        if (parsed.dateRange) setDateRange(parsed.dateRange);
        if (parsed.deliveryMethod) setDeliveryMethod(parsed.deliveryMethod);
      }
    } catch {
      // Ignore localStorage errors (e.g. incognito quota)
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync back to localStorage whenever items, dates, or delivery change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          items,
          dateRange,
          deliveryMethod,
        })
      );
    } catch {
      // Ignore localStorage quota errors
    }
  }, [items, dateRange, deliveryMethod, isHydrated]);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed.items)) setItems(parsed.items);
          if (parsed.dateRange) setDateRange(parsed.dateRange);
          if (parsed.deliveryMethod) setDeliveryMethod(parsed.deliveryMethod);
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Listen to open-cart custom event (useful from anywhere, e.g. CommandPalette)
  useEffect(() => {
    const handleOpenTrigger = () => setIsCartOpen(true);
    window.addEventListener("open-gear-cart", handleOpenTrigger);
    return () => window.removeEventListener("open-gear-cart", handleOpenTrigger);
  }, []);

  const addItem = useCallback((item: GearItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toggleItem = useCallback((item: GearItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [...prev, item];
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCartDrawer = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const itemIds = useMemo(() => items.map((i) => i.id), [items]);

  const isInCart = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items]
  );

  const totals = useMemo(() => {
    return calculateGearCartTotals(items, dateRange, deliveryMethod);
  }, [items, dateRange, deliveryMethod]);

  const value = useMemo(
    () => ({
      items,
      itemIds,
      isInCart,
      addItem,
      removeItem,
      toggleItem,
      clearCart,
      dateRange,
      setDateRange,
      deliveryMethod,
      setDeliveryMethod,
      isCartOpen,
      openCart,
      closeCart,
      toggleCartDrawer,
      totalCount: items.length,
      totals,
      isHydrated,
    }),
    [
      items,
      itemIds,
      isInCart,
      addItem,
      removeItem,
      toggleItem,
      clearCart,
      dateRange,
      deliveryMethod,
      isCartOpen,
      openCart,
      closeCart,
      toggleCartDrawer,
      totals,
      isHydrated,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a <CartProvider>");
  }
  return context;
}
