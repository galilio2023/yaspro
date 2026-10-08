"use client";

import { Check, X, Zap } from "lucide-react";
import { PODCAST_SERVICES } from "../data";
import { PodcastSessionItem } from "../types";
import { formatAED, MetaTag, SelectableCard, StepIntro } from "@/features/booking/components/ui/BookingKit";
import { cn } from "@/lib/utils";

interface Step3ServiceProps {
  session: PodcastSessionItem;
  onChange: (updates: Partial<PodcastSessionItem>) => void;
}

export function Step3Service({ session, onChange }: Step3ServiceProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <StepIntro
        index={3}
        total={4}
        title="Production Tier"
        description="Select whether you want raw footage capture, live-switched program mix, or full A24-grade post-production."
        aside={<MetaTag tone="amber">3 tiers</MetaTag>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {PODCAST_SERVICES.map((service) => {
          const isSelected = session.serviceKey === service.key;
          const isBest = service.best;

          return (
            <SelectableCard
              key={service.key}
              selected={isSelected}
              onSelect={() => onChange({ serviceKey: service.key })}
              className={cn("p-6 sm:p-7 flex-1 justify-between", isBest && !isSelected && "border-amber-500/40 bg-white/[0.02]")}
            >
              {/* Popular badge */}
              {isBest && (
                <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-amber-400 text-black text-[10px] font-mono tracking-wider uppercase font-bold mb-3 shadow-md shadow-amber-500/30">
                  <Zap size={11} className="fill-black" />
                  Most Popular
                </div>
              )}

              <div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                    {service.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed min-h-[36px]">
                    {service.sub}
                  </p>
                </div>

                {/* Price Display */}
                <div className="my-5 pb-5 border-b border-white/[0.08] flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight tabular-nums">
                    {formatAED(service.price)}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium font-mono">
                    / hour
                  </span>
                </div>

                {/* In Studio Features */}
                <div className="space-y-3 mb-6">
                  <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-400 font-bold">
                    In Studio Recording:
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs">
                        {feat.ok ? (
                          <div className="size-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={11} strokeWidth={2.5} />
                          </div>
                        ) : (
                          <div className="size-4 rounded-full bg-white/5 text-zinc-600 flex items-center justify-center shrink-0 mt-0.5">
                            <X size={11} />
                          </div>
                        )}
                        <span className={feat.ok ? "text-zinc-200" : "text-zinc-600 line-through"}>
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What you get after */}
                <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                  <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-400 font-bold">
                    What You Get After Session:
                  </p>
                  <ul className="space-y-2">
                    {service.after.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs">
                        {feat.ok ? (
                          <div className="size-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={11} strokeWidth={2.5} />
                          </div>
                        ) : (
                          <div className="size-4 rounded-full bg-white/5 text-zinc-600 flex items-center justify-center shrink-0 mt-0.5">
                            <X size={11} />
                          </div>
                        )}
                        <span className={feat.ok ? "text-zinc-200" : "text-zinc-600 line-through"}>
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {service.note && (
                  <p className="mt-4 text-[11px] text-zinc-500 italic">
                    {service.note}
                  </p>
                )}
              </div>

              {/* Action Indicator */}
              <div className="pt-5 mt-5 border-t border-white/[0.08]">
                <div
                  className={cn(
                    "w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2",
                    isSelected
                      ? "bg-amber-400 text-black font-extrabold shadow-md shadow-amber-500/30"
                      : "bg-white/[0.06] text-zinc-300 group-hover:bg-white/[0.1] group-hover:text-white"
                  )}
                >
                  {isSelected ? (
                    <>
                      <Check size={14} strokeWidth={3} /> Selected Package
                    </>
                  ) : (
                    "Choose Tier"
                  )}
                </div>
              </div>
            </SelectableCard>
          );
        })}
      </div>
    </div>
  );
}
