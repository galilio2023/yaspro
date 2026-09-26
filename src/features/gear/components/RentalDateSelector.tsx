"use client";

import { useMemo } from "react";
import { Calendar, Sparkles, Tag } from "lucide-react";
import { RentalDateRange } from "../types";
import { Badge } from "@/components/ui/badge";

interface RentalDateSelectorProps {
  dateRange: RentalDateRange;
  onChange: (range: RentalDateRange) => void;
}

export function calculateRentalMultiplier(totalDays: number): {
  multiplier: number;
  discountPct: number;
  discountLabel: string;
} {
  if (totalDays <= 1) {
    return { multiplier: 1, discountPct: 0, discountLabel: "Standard Daily Rate" };
  }
  if (totalDays === 2 || totalDays === 3) {
    // 2-3 Days: Weekend shoot discount (3 days for the price of 2)
    const multiplier = 2;
    const discountPct = Math.round(((totalDays - multiplier) / totalDays) * 100);
    return {
      multiplier,
      discountPct,
      discountLabel: totalDays === 3 ? "Weekend Deal: 1 Day Free (33% OFF)" : "2-Day Production Rate",
    };
  }
  if (totalDays >= 4 && totalDays < 7) {
    const multiplier = totalDays - 1;
    const discountPct = Math.round((1 / totalDays) * 100);
    return {
      multiplier,
      discountPct,
      discountLabel: `Multi-Day Production: 1 Day Free (${discountPct}% OFF)`,
    };
  }
  // 7+ Days: Weekly rate (7 days billed as 4 days)
  const weeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;
  const multiplier = weeks * 4 + Math.min(remainingDays, 3);
  const discountPct = Math.round(((totalDays - multiplier) / totalDays) * 100);
  return {
    multiplier,
    discountPct,
    discountLabel: `Weekly Tier: 3 Days Free per Week (${discountPct}% OFF)`,
  };
}

export function RentalDateSelector({ dateRange, onChange }: RentalDateSelectorProps) {
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const handleDateChange = (pickup: string, returnDateStr: string) => {
    const start = new Date(pickup);
    const end = new Date(returnDateStr);

    let diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 1 || isNaN(diffDays)) {
      diffDays = 1;
    }

    const { multiplier, discountPct } = calculateRentalMultiplier(diffDays);

    onChange({
      pickupDate: pickup,
      returnDate: returnDateStr < pickup ? pickup : returnDateStr,
      totalDays: diffDays,
      billingMultiplier: multiplier,
      discountPercentage: discountPct,
    });
  };

  const setPreset = (days: number) => {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + (days - 1));

    const pickupStr = start.toISOString().split("T")[0];
    const returnStr = end.toISOString().split("T")[0];
    handleDateChange(pickupStr, returnStr);
  };

  const { discountLabel, discountPct } = calculateRentalMultiplier(dateRange.totalDays);

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-4 sm:p-5 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-brand-purple-light">
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="text-white text-sm font-bold flex items-center gap-2">
              <span>Rental Schedule &amp; Production Dates</span>
              <span className="text-[10px] text-text-muted font-normal uppercase tracking-wider font-mono">
                Dubai Local Time (GST)
              </span>
            </h3>
            <p className="text-xs text-text-secondary">
              Select shoot dates to automatically calculate multi-day commercial discounts.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPreset(1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              dateRange.totalDays === 1
                ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20"
                : "bg-white/5 text-text-secondary hover:text-white hover:bg-white/10"
            }`}
          >
            1 Day
          </button>
          <button
            type="button"
            onClick={() => setPreset(3)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              dateRange.totalDays === 3
                ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20"
                : "bg-white/5 text-text-secondary hover:text-white hover:bg-white/10"
            }`}
          >
            Weekend (3 Days)
          </button>
          <button
            type="button"
            onClick={() => setPreset(7)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              dateRange.totalDays === 7
                ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20"
                : "bg-white/5 text-text-secondary hover:text-white hover:bg-white/10"
            }`}
          >
            1 Week (7 Days)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 items-center">
        {/* Pickup Date */}
        <div>
          <label
            htmlFor="pickup-date-input"
            className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Pickup / Delivery Date
          </label>
          <input
            id="pickup-date-input"
            type="date"
            min={todayStr}
            value={dateRange.pickupDate}
            onChange={(e) => handleDateChange(e.target.value, dateRange.returnDate)}
            className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple transition-colors"
          />
        </div>

        {/* Return Date */}
        <div>
          <label
            htmlFor="return-date-input"
            className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-1.5"
          >
            Return Date
          </label>
          <input
            id="return-date-input"
            type="date"
            min={dateRange.pickupDate}
            value={dateRange.returnDate}
            onChange={(e) => handleDateChange(dateRange.pickupDate, e.target.value)}
            className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple transition-colors"
          />
        </div>

        {/* Duration & Applied Tier Status */}
        <div className="flex flex-col justify-center sm:col-span-2 lg:col-span-1 pt-1 sm:pt-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-text-secondary font-medium">
              Shoot Duration:
            </span>
            <span className="text-sm font-bold text-white font-mono">
              {dateRange.totalDays} {dateRange.totalDays === 1 ? "Day" : "Days"}
              {dateRange.billingMultiplier !== dateRange.totalDays && (
                <span className="text-xs text-brand-purple-light font-normal ml-1">
                  (Billed as {dateRange.billingMultiplier} days)
                </span>
              )}
            </span>
          </div>

          <div className="mt-2">
            <Badge
              variant={discountPct > 0 ? "gold" : "secondary"}
              className="text-[11px] gap-1.5 w-full justify-center py-1 font-semibold"
            >
              {discountPct > 0 ? <Sparkles size={12} /> : <Tag size={12} />}
              <span>{discountLabel}</span>
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
