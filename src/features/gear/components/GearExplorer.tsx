"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, X, ShieldCheck, Layers, Bot, AlertCircle, ArrowLeft, ChevronDown } from "lucide-react";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations/MotionWrappers";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { CategoryFilterBar, CategoryOption } from "@/components/ui/category-filter";
import { GearCard } from "./GearCard";
import { RentalDateSelector } from "./RentalDateSelector";
import { ProductsCategoriesGrid } from "./ProductsCategoriesGrid";
import { GEAR_DATA, GEAR_CATEGORIES } from "../data";
import { GearCategory, GearItem } from "../types";
import type { MatchedGearPackage } from "@/lib/ai/ai-kit-matcher";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useCart } from "@/components/providers/CartProvider";

export interface GearExplorerProps {
  initialGear?: readonly GearItem[];
}

export function GearExplorer({
  initialGear = GEAR_DATA,
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
    addItem,
    dateRange,
    setDateRange,
  } = useCart();

  // AI Kit Matcher state
  const [aiPrompt, setAiPrompt] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [matchedKit, setMatchedKit] = useState<MatchedGearPackage | null>(null);
  const [matcherError, setMatcherError] = useState<string | null>(null);

  const handleMatchPackage = async (customPrompt?: string) => {
    const textToMatch = customPrompt || aiPrompt;
    if (!textToMatch.trim()) return;
    setIsMatching(true);
    setMatcherError(null);
    try {
      const res = await fetch("/api/ai/gear-matcher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: textToMatch }),
      });
      const data = await res.json();
      if (res.ok && data.package) {
        setMatchedKit(data.package);
      } else {
        setMatcherError(data.error || "Failed to assemble gear kit.");
      }
    } catch {
      setMatcherError("Network error contacting AI rental engine.");
    } finally {
      setIsMatching(false);
    }
  };

  const handleAddAllToCart = () => {
    if (!matchedKit) return;
    matchedKit.items.forEach((m) => addItem(m.item));
  };

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
    return selectedCategory === "all"
      ? initialGear
      : initialGear.filter((g) => g.category === selectedCategory);
  }, [selectedCategory, initialGear]);

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
                className="px-4 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-sm group"
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
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                  {filteredGear.length} {isArabic ? "معدة" : "units"}
                </span>
              </div>
            </div>
          </div>

          {/* 1. Production Date Selector */}
          <FadeUp delay={0.05}>
            <RentalDateSelector dateRange={dateRange} onChange={setDateRange} />
          </FadeUp>

          {/* 2. AI Production Kit Matcher */}
          <FadeUp delay={0.08}>
            <div className="mb-6 sm:mb-8 p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl bg-slate-950/80 border border-purple-500/20 backdrop-blur-xl shadow-xl shadow-purple-500/5 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Bot size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">AI Production Kit Matcher</h3>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                        Intelligent Builder
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">Describe your scene or shoot type to auto-assemble a compatible camera, optics, and lighting package.</p>
                  </div>
                </div>

                {matchedKit && (
                  <button
                    type="button"
                    onClick={() => setMatchedKit(null)}
                    className="text-xs text-text-muted hover:text-white flex items-center gap-1 self-end sm:self-auto cursor-pointer"
                  >
                    <X size={14} />
                    <span>Clear Package</span>
                  </button>
                )}
              </div>

              {/* Prompt Bar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleMatchPackage();
                    }}
                    placeholder="e.g. Anamorphic commercial in Dubai desert or run & gun doc interview..."
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleMatchPackage()}
                  disabled={isMatching || !aiPrompt.trim()}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer shrink-0"
                >
                  {isMatching ? (
                    <span className="animate-pulse">Matching Cinema Gear...</span>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Assemble Kit</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] text-text-muted">Popular Scenarios:</span>
                {[
                  { label: "🎬 Anamorphic Cinema", prompt: "Anamorphic commercial cinema shoot with large format camera and anamorphic glass" },
                  { label: "🏃 Run & Gun Documentary", prompt: "Fast run and gun documentary with wireless mic and lightweight camera" },
                  { label: "🎙️ Multi-Cam Interview", prompt: "Broadcast podcast interview with studio lighting and directional shotgun mic" },
                ].map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setAiPrompt(p.prompt);
                      handleMatchPackage(p.prompt);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-purple-400 border border-white/5 transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {matcherError && (
                <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <span>{matcherError}</span>
                </div>
              )}

              {/* AI Matched Package Card */}
              {matchedKit && (
                <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-black/60 border border-purple-500/30 space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                          {matchedKit.targetGenre}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                          12% Package Discount
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1">{matchedKit.packageTitle}</h4>
                      <p className="text-xs text-text-muted mt-0.5">{matchedKit.rationale}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-text-muted line-through font-mono">
                        {formatCurrency(matchedKit.totalDailyRate)} / day
                      </div>
                      <div className="text-xl font-bold font-mono text-purple-400">
                        {formatCurrency(matchedKit.packageDailyRate)}
                        <span className="text-xs font-normal text-text-muted"> / day</span>
                      </div>
                    </div>
                  </div>

                  {/* Matched Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {matchedKit.items.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono text-purple-400 mb-1">
                            <span>{m.role}</span>
                            <span className="text-white font-bold">{formatCurrency(m.item.dailyRate)}</span>
                          </div>
                          <div className="text-xs font-bold text-white">{m.item.name}</div>
                          <p className="text-[11px] text-text-muted mt-1 leading-snug">{m.whyNeeded}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer with Compatibility & Add All button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs">
                      {matchedKit.compatibility.isCompatible ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-medium">
                          <ShieldCheck size={15} />
                          <span>Optical &amp; Power Compatibility Cleared</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-purple-400 font-mono">
                          <AlertCircle size={15} />
                          <span>{matchedKit.compatibility.warnings[0] || "Review kit configuration"}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddAllToCart}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Layers size={14} />
                      <span>Add Entire Kit to Cart ({matchedKit.items.length} items)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </FadeUp>

          {/* Catalog Status & Count Bar */}
          {filteredGear.length > 0 && (
            <div className="flex items-center justify-between py-2 text-xs text-text-muted font-mono border-b border-white/5">
              <span>
                {isArabic
                  ? `معاينة ${displayedGear.length} من أصل ${filteredGear.length} قطعة ومعدة سينمائية`
                  : `Showing ${displayedGear.length} of ${filteredGear.length} calibrated cinema units`}
              </span>
              <span className="hidden sm:inline text-purple-400">
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
                    className="px-8 py-3.5 rounded-full border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 text-xs font-bold transition-all shadow-lg shadow-purple-500/10 cursor-pointer flex items-center gap-2"
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
