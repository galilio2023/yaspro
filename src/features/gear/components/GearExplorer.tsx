"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations/MotionWrappers";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { CategoryOption } from "@/components/ui/category-filter";
import { GearCard } from "./GearCard";
import { RentalDateSelector } from "./RentalDateSelector";
import { ProductsCategoriesGrid } from "./ProductsCategoriesGrid";
import { GEAR_DATA, GEAR_CATEGORIES } from "../data";
import { GearCategory, GearItem } from "../types";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useCart } from "@/components/providers/CartProvider";

export interface GearExplorerProps {
  initialGear?: readonly GearItem[];
  checkRangeAvailability?: (
    pickupDate: string,
    returnDate: string
  ) => Promise<{ unavailableIds: string[]; bookedQuantities: Record<string, number> }>;
}

export function GearExplorer({
  initialGear = GEAR_DATA,
  checkRangeAvailability,
}: GearExplorerProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") as GearCategory | null;
  const validUrlCategory =
    categoryParam && GEAR_CATEGORIES.some((c) => c.id === categoryParam)
      ? categoryParam
      : null;

  const [userCategory, setUserCategory] = useState<GearCategory | null>(null);
  const [prevUrlCategory, setPrevUrlCategory] = useState(validUrlCategory);

  if (validUrlCategory !== prevUrlCategory) {
    setPrevUrlCategory(validUrlCategory);
    setUserCategory(null);
  }

  const selectedCategory = userCategory ?? validUrlCategory ?? "all";
  const setSelectedCategory = (cat: GearCategory) => setUserCategory(cat);

  const {
    isInCart,
    toggleItem,
    dateRange,
    setDateRange,
  } = useCart();

  const { isArabic } = useLanguage();

  const categoriesWithOptions: CategoryOption<GearCategory>[] = useMemo(() => {
    return GEAR_CATEGORIES.map((cat) => ({
      id: cat.id as GearCategory,
      label: isArabic && cat.arabicLabel ? cat.arabicLabel : cat.label,
      count:
        cat.id === "all"
          ? initialGear.length
          : initialGear.filter((g) => g.category === cat.id).length,
    }));
  }, [initialGear, isArabic]);

  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [showAllUnfiltered, setShowAllUnfiltered] = useState<boolean>(false);
  const [unavailableIds, setUnavailableIds] = useState<string[]>([]);

  if (typeof useEffect === "function") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (
        typeof checkRangeAvailability !== "function" ||
        !dateRange?.pickupDate ||
        !dateRange?.returnDate
      ) {
        return;
      }
      let cancelled = false;
      checkRangeAvailability(dateRange.pickupDate, dateRange.returnDate)
        .then((res) => {
          if (!cancelled && res && Array.isArray(res.unavailableIds)) {
            setUnavailableIds(res.unavailableIds);
          }
        })
        .catch(() => {});
      return () => {
        cancelled = true;
      };
    }, [checkRangeAvailability, dateRange?.pickupDate, dateRange?.returnDate]);
  }

  const categoryCounts = useMemo(() => {
    return {
      cameras: initialGear.filter((g) => g.category === "cameras").length,
      lenses: initialGear.filter((g) => g.category === "lenses").length,
      accessories: initialGear.filter((g) => g.category === "accessories").length,
      lighting: initialGear.filter((g) => g.category === "lighting").length,
      audio: initialGear.filter((g) => g.category === "audio").length,
      bundles: initialGear.filter((g) => g.category === "bundles").length,
    };
  }, [initialGear]);

  const filteredGear = useMemo(() => {
    const base =
      selectedCategory === "all"
        ? initialGear
        : initialGear.filter((g) => g.category === selectedCategory);
    if (!unavailableIds.length) return base;
    return base.map((g) =>
      unavailableIds.includes(g.id) ? { ...g, isAvailable: false } : g
    );
  }, [selectedCategory, initialGear, unavailableIds]);

  // Reset pagination when category changes
  const handleCategoryChange = (cat: GearCategory) => {
    setSelectedCategory(cat);
    setVisibleCount(12);
    if (cat !== "all") {
      setShowAllUnfiltered(false);
    }
  };

  const displayedGear = useMemo(() => {
    return filteredGear.slice(0, visibleCount);
  }, [filteredGear, visibleCount]);

  const toggleCart = (id: string) => {
    if (unavailableIds.includes(id)) return;
    const item = initialGear.find((g) => g.id === id) || GEAR_DATA.find((g) => g.id === id);
    if (item) toggleItem(item);
  };

  return (
    <div className="w-full">
      {/* When browsing all: Show JUST the title section with the 6 cards */}
      {selectedCategory === "all" && !showAllUnfiltered ? (
        <div className="w-full py-4 sm:py-8">
          <ProductsCategoriesGrid
            selectedCategory={selectedCategory}
            counts={categoryCounts}
            onSelectCategory={(cat) => handleCategoryChange(cat as GearCategory)}
          />
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Focused Category Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setShowAllUnfiltered(false);
                }}
                className="px-4 py-2 rounded-xl bg-brand-violet/20 hover:bg-brand-violet/30 text-brand-mauve border border-brand-mauve/30 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-sm shadow-brand-violet/20 group"
              >
                <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>{isArabic ? "الرجوع لكافة الفئات" : "Back to All Categories"}</span>
              </button>

              <div className="h-5 w-px bg-white/10 hidden sm:block" />

              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">{isArabic ? "الفئة:" : "Category:"}</span>
                <span className="font-bold text-white uppercase text-base sm:text-lg tracking-wide">
                  {categoriesWithOptions.find((c) => c.id === selectedCategory)?.label || (isArabic ? "جميع المعدات" : "All Equipment")}
                </span>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-brand-mauve/15 text-brand-mauve border border-brand-mauve/30 font-semibold">
                  {filteredGear.length} {isArabic ? "معدة" : "units"}
                </span>
              </div>
            </div>
          </div>

          {/* 1. Production Date Selector */}
          <FadeUp delay={0.05}>
            <RentalDateSelector dateRange={dateRange} onChange={setDateRange} />
          </FadeUp>



          {/* Catalog Status & Count Bar */}
          {filteredGear.length > 0 && (
            <div className="flex items-center justify-between py-2 text-xs text-text-muted font-mono border-b border-white/5">
              <span>
                {isArabic
                  ? `معاينة ${displayedGear.length} من أصل ${filteredGear.length} قطعة ومعدة سينمائية`
                  : `Showing ${displayedGear.length} of ${filteredGear.length} calibrated cinema units`}
              </span>
              <span className="hidden sm:inline text-brand-mauve font-semibold">
                {Math.round((displayedGear.length / filteredGear.length) * 100)}% Loaded
              </span>
            </div>
          )}

          {/* Gear Grid or Empty State */}
          {filteredGear.length > 0 ? (
            <>
              <StaggerContainer as="ul" role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 items-stretch">
                {displayedGear.map((item) => (
                  <StaggerItem as="li" key={item.id} className="h-full">
                    <GearCard
                      item={item}
                      inCart={isInCart(item.id)}
                      onToggle={toggleCart}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>

              {/* Load More Button */}
              {visibleCount < filteredGear.length && (
                <div className="flex flex-col items-center justify-center mt-12 space-y-3">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="px-8 py-3.5 rounded-full border border-brand-mauve/40 bg-brand-violet/20 hover:bg-brand-violet/35 text-brand-mauve hover:text-brand-lavender text-xs font-bold transition-all shadow-lg shadow-brand-violet/25 cursor-pointer flex items-center gap-2"
                  >
                    <span>
                      {isArabic
                        ? `عرض المزيد (+12 من أصل ${filteredGear.length - visibleCount} متبقية)`
                        : `Load More Cinema Gear (+12 of ${filteredGear.length - visibleCount} remaining)`}
                    </span>
                  </button>
                  <span className="text-[11px] font-mono text-text-muted">
                    {isArabic ? "تحميل تقدمي سريع للأداء العالي" : "Fast progressive loading for optimum performance"}
                  </span>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title={isArabic ? "لا توجد معدات متوفرة حالياً" : "No Equipment Found"}
              description={
                isArabic
                  ? "لا توجد عناصر متاحة حالياً في هذه الفئة. يرجى مراجعة الكتالوج الكامل أو التواصل معنا لتوفير طلب خاص."
                  : "There are currently no items available in this category. Check back soon or view all rental gear."
              }
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory("all");
                    setShowAllUnfiltered(false);
                  }}
                  className="rounded-xl cursor-pointer"
                >
                  {isArabic ? "الرجوع للفئات" : "Back to Categories"}
                </Button>
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
