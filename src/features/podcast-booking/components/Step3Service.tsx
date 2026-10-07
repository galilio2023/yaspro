"use client";

import { Check, X, Zap } from "lucide-react";
import { PODCAST_SERVICES } from "../data";
import { PodcastSessionItem } from "../types";

interface Step3ServiceProps {
  session: PodcastSessionItem;
  onChange: (updates: Partial<PodcastSessionItem>) => void;
}

export function Step3Service({ session, onChange }: Step3ServiceProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Select the service
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              3 Production Tiers
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            We offer transparent rates depending on what level of post-production you need.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {PODCAST_SERVICES.map((service) => {
          const isSelected = session.serviceKey === service.key;
          const isBest = service.best;

          return (
            <div
              key={service.key}
              onClick={() => onChange({ serviceKey: service.key })}
              className={`relative rounded-3xl p-6 sm:p-7 border flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                isSelected
                  ? "bg-gradient-to-b from-amber-500/10 via-amber-500/[0.03] to-transparent border-amber-500 shadow-[0_0_35px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/80 scale-[1.01]"
                  : isBest
                  ? "bg-white/[0.03] border-amber-500/40 hover:border-amber-500/70"
                  : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              {/* Best Deal Ribbon */}
              {isBest && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[11px] font-extrabold uppercase tracking-wider shadow-lg shadow-amber-500/40 flex items-center gap-1">
                  <Zap size={13} className="fill-black" />
                  Most Popular & Recommended
                </div>
              )}

              <div>
                {/* Header */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {service.title}
                  </h3>
                  <p className="text-xs text-text-muted min-h-[32px] leading-relaxed">
                    {service.sub}
                  </p>
                </div>

                {/* Price Display */}
                <div className="my-6 pb-6 border-b border-white/10 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    AED {service.price}
                  </span>
                  <span className="text-xs text-text-muted font-medium">
                    / per hour
                  </span>
                </div>

                {/* In Studio Features */}
                <div className="space-y-3 mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90">
                    In Studio Recording:
                  </p>
                  <ul className="space-y-2.5">
                    {service.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs">
                        {feat.ok ? (
                          <div className="size-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={11} />
                          </div>
                        ) : (
                          <div className="size-4 rounded-full bg-white/5 text-white/30 flex items-center justify-center shrink-0 mt-0.5">
                            <X size={11} />
                          </div>
                        )}
                        <span className={feat.ok ? "text-white/90" : "text-white/40 line-through"}>
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What you get after */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90">
                    What You Get After Session:
                  </p>
                  <ul className="space-y-2.5">
                    {service.after.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs">
                        {feat.ok ? (
                          <div className="size-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={11} />
                          </div>
                        ) : (
                          <div className="size-4 rounded-full bg-white/5 text-white/30 flex items-center justify-center shrink-0 mt-0.5">
                            <X size={11} />
                          </div>
                        )}
                        <span className={feat.ok ? "text-white/90" : "text-white/40 line-through"}>
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {service.note && (
                  <p className="mt-4 text-[11px] text-text-muted italic">
                    {service.note}
                  </p>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-white/10">
                <button
                  type="button"
                  className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${
                    isSelected
                      ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30 font-extrabold"
                      : "bg-white/10 text-white hover:bg-white/15"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check size={14} /> Selected Service
                    </>
                  ) : (
                    "Select & Continue"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
