"use client";

import { useState } from "react";
import { Plus, Minus, Play, X, Check, Film } from "lucide-react";
import { PODCAST_ADDONS } from "../data";
import { PodcastSessionItem, PodcastAddon } from "../types";
import { MetaTag, StepIntro } from "@/features/booking/components/ui/BookingKit";

interface Step4AddonsProps {
  session: PodcastSessionItem;
  onSetQuantity: (addonKey: string, qty: number) => void;
  onToggle: (addonKey: string) => void;
}

export function Step4Addons({ session, onSetQuantity, onToggle }: Step4AddonsProps) {
  const [activeVideoModal, setActiveVideoModal] = useState<PodcastAddon | null>(null);

  const totalAddonsCount = Object.values(session.addons || {}).reduce((acc, qty) => acc + (qty > 0 ? 1 : 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <StepIntro
        index={4}
        total={4}
        title="Add-ons & Viral Edits"
        description="Accelerate your social reach with viral reels, clickable YouTube thumbnails, 4K multi-cam switches, and express delivery."
        aside={<MetaTag tone={totalAddonsCount > 0 ? "amber" : "neutral"}>{totalAddonsCount} added</MetaTag>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {PODCAST_ADDONS.map((addon) => {
          const qty = session.addons?.[addon.key] || 0;
          const isAdded = qty > 0;

          return (
            <div
              key={addon.key}
              className={`rounded-2xl p-5 border flex flex-col justify-between transition-all duration-200 ${
                isAdded
                  ? "bg-amber-500/[0.045] border-amber-400/70 shadow-[0_0_0_1px_rgba(245,158,11,0.35),0_18px_36px_-18px_rgba(245,158,11,0.3)]"
                  : "bg-white/[0.02] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              <div className="space-y-2.5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-white leading-snug">
                    {addon.title}
                  </h3>
                  {addon.vimeoEmbed && (
                    <button
                      type="button"
                      onClick={() => setActiveVideoModal(addon)}
                      className="size-7 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-black text-white/80 flex items-center justify-center transition shrink-0 cursor-pointer"
                      title="Watch Sample Video"
                    >
                      <Play size={13} className="ml-0.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                  {addon.desc}
                </p>
              </div>

              {/* Price & Action row */}
              <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-base font-black text-white tabular-nums">
                    {addon.priceDisplay}
                  </span>
                  <span className="text-[11px] text-zinc-500 block font-mono">
                    {addon.unit}
                  </span>
                </div>

                {addon.unit.includes("reel") || addon.unit.includes("cover") || addon.unit.includes("hour") || addon.unit.includes("minute") ? (
                  /* Quantity Counter */
                  <div className="flex items-center gap-2">
                    {isAdded ? (
                      <div className="inline-flex items-center rounded-xl bg-black/40 border border-white/10 p-1">
                        <button
                          type="button"
                          onClick={() => onSetQuantity(addon.key, qty - 1)}
                          className="size-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                          aria-label={`Decrease quantity for ${addon.title}`}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-bold text-white tabular-nums">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onSetQuantity(addon.key, qty + 1)}
                          className="size-7 rounded-lg bg-amber-400 text-black font-bold flex items-center justify-center transition cursor-pointer"
                          aria-label={`Increase quantity for ${addon.title}`}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSetQuantity(addon.key, 1)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-amber-400 hover:text-black text-white transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} /> Add
                      </button>
                    )}
                  </div>
                ) : (
                  /* Toggle Button */
                  <button
                    type="button"
                    onClick={() => onToggle(addon.key)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      isAdded
                        ? "bg-amber-400 text-black shadow-md shadow-amber-500/30"
                        : "bg-white/10 text-white hover:bg-amber-400 hover:text-black"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check size={12} strokeWidth={2.5} /> Added
                      </>
                    ) : (
                      <>
                        <Plus size={12} /> Add
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Sample Modal */}
      {activeVideoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setActiveVideoModal(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-[#0e0e13] border border-white/15 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Film size={16} className="text-amber-400" />
                <h4 className="text-sm font-bold text-white">
                  Sample: {activeVideoModal.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black">
              {activeVideoModal.vimeoEmbed ? (
                <iframe
                  src={activeVideoModal.vimeoEmbed}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={activeVideoModal.title}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
                  No preview available
                </div>
              )}
            </div>

            <p className="mt-3 text-xs text-zinc-400">
              {activeVideoModal.desc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
