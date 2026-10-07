"use client";

import { useState } from "react";
import { Plus, Minus, Play, X, Check, Film } from "lucide-react";
import { PODCAST_ADDONS } from "../data";
import { PodcastSessionItem, PodcastAddon } from "../types";

interface Step4AddonsProps {
  session: PodcastSessionItem;
  onSetQuantity: (addonKey: string, qty: number) => void;
  onToggle: (addonKey: string) => void;
}

export function Step4Addons({ session, onSetQuantity, onToggle }: Step4AddonsProps) {
  const [activeVideoModal, setActiveVideoModal] = useState<PodcastAddon | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Select additional services
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              12 Production Extras
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Accelerate your social growth with viral reels, clickable YouTube thumbnails, and multi-cam upgrades.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PODCAST_ADDONS.map((addon) => {
          const qty = session.addons?.[addon.key] || 0;
          const isAdded = qty > 0;

          return (
            <div
              key={addon.key}
              className={`rounded-2xl p-5 border flex flex-col justify-between transition-all duration-200 ${
                isAdded
                  ? "bg-amber-950/20 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/70"
                  : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-white leading-snug">
                    {addon.title}
                  </h3>
                  {addon.vimeoEmbed && (
                    <button
                      type="button"
                      onClick={() => setActiveVideoModal(addon)}
                      className="size-7 rounded-lg bg-white/10 hover:bg-amber-500 hover:text-black text-white/80 flex items-center justify-center transition shrink-0"
                      title="Watch Sample Video"
                    >
                      <Play size={13} className="ml-0.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                  {addon.desc}
                </p>
              </div>

              {/* Price & Action row */}
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-base font-extrabold text-white">
                    {addon.priceDisplay}
                  </span>
                  <span className="text-[11px] text-text-muted block">
                    {addon.unit}
                  </span>
                </div>

                {addon.unit.includes("reel") || addon.unit.includes("cover") || addon.unit.includes("hour") || addon.unit.includes("minute") ? (
                  /* Quantity Counter */
                  <div className="flex items-center gap-2">
                    {isAdded ? (
                      <div className="inline-flex items-center rounded-xl bg-white/10 border border-white/10 p-1">
                        <button
                          type="button"
                          onClick={() => onSetQuantity(addon.key, qty - 1)}
                          className="size-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-white">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onSetQuantity(addon.key, qty + 1)}
                          className="size-7 rounded-lg bg-amber-500 text-black font-bold flex items-center justify-center transition"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSetQuantity(addon.key, 1)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-amber-500 hover:text-black text-white transition flex items-center gap-1"
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      isAdded
                        ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                        : "bg-white/10 text-white hover:bg-amber-500 hover:text-black"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check size={12} /> Added
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setActiveVideoModal(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-zinc-950 border border-white/15 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6"
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
                className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
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
                <div className="w-full h-full flex items-center justify-center text-xs text-text-muted">
                  No preview available
                </div>
              )}
            </div>

            <p className="mt-3 text-xs text-text-muted">
              {activeVideoModal.desc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
