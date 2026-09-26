"use client";

import { useState, useMemo } from "react";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations/MotionWrappers";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { CategoryFilterBar, CategoryOption } from "@/components/ui/category-filter";
import { GearCard } from "./GearCard";
import { GearCartDrawer } from "./GearCartDrawer";
import { RentalDateSelector } from "./RentalDateSelector";
import { GEAR_DATA, GEAR_CATEGORIES } from "../data";
import { GearCategory, GearItem, RentalDateRange } from "../types";

export interface GearExplorerProps {
  initialGear?: readonly GearItem[];
}

export function GearExplorer({
  initialGear = GEAR_DATA,
}: GearExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<GearCategory>("all");
  const [cart, setCart] = useState<string[]>([]);

  // Default to 1-day shoot starting today
  const [dateRange, setDateRange] = useState<RentalDateRange>(() => {
    const today = new Date().toISOString().split("T")[0];
    return {
      pickupDate: today,
      returnDate: today,
      totalDays: 1,
      billingMultiplier: 1,
      discountPercentage: 0,
    };
  });

  const categoriesWithOptions: CategoryOption<GearCategory>[] = useMemo(() => {
    return GEAR_CATEGORIES.map((cat) => ({
      id: cat.id as GearCategory,
      label: cat.label,
      count:
        cat.id === "all"
          ? initialGear.length
          : initialGear.filter((g) => g.category === cat.id).length,
    }));
  }, [initialGear]);

  const filteredGear = useMemo(() => {
    return selectedCategory === "all"
      ? initialGear
      : initialGear.filter((g) => g.category === selectedCategory);
  }, [selectedCategory, initialGear]);

  const toggleCart = (id: string) => {
    setCart((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const selectedItems = useMemo(() => {
    return GEAR_DATA.filter((g) => cart.includes(g.id));
  }, [cart]);

  return (
    <div className="w-full">
      {/* 1. Production Date Selector */}
      <FadeUp delay={0.05}>
        <RentalDateSelector dateRange={dateRange} onChange={setDateRange} />
      </FadeUp>

      {/* 2. Category Pills Filter Bar */}
      <FadeUp delay={0.1}>
        <CategoryFilterBar
          categories={categoriesWithOptions}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </FadeUp>

      {/* 3. Gear Grid or Empty State */}
      {filteredGear.length > 0 ? (
        <StaggerContainer as="ul" role="list" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {filteredGear.map((item) => (
            <StaggerItem as="li" key={item.id} className="h-full">
              <GearCard
                item={item}
                inCart={cart.includes(item.id)}
                onToggle={toggleCart}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <EmptyState
          title="No Equipment Found"
          description="There are currently no items available in this category. Check back soon or view all rental gear."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className="rounded-xl"
            >
              View All Equipment
            </Button>
          }
        />
      )}

      {/* 4. Floating Multi-Day Rental Cart Drawer */}
      <GearCartDrawer
        items={selectedItems}
        dateRange={dateRange}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
      />
    </div>
  );
}
