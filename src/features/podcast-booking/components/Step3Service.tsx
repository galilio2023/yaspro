"use client";

import { useState } from "react";
import { Check, Zap, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { PODCAST_SERVICES } from "../data";
import { PodcastSessionItem, PodcastService } from "../types";
import { formatAED, MetaTag, SelectableCard, StepIntro, TogglePill, studioSprings } from "@/features/booking/components/ui/BookingKit";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Step3ServiceProps {
  session: PodcastSessionItem;
  onChange: (updates: Partial<PodcastSessionItem>) => void;
  services?: PodcastService[];
}

const COMPARISON_MATRIX = [
  { feature: "3x 4K Sony Cinema Cameras & Framing", raw: true, live: true, edit: true },
  { feature: "Shure SM7B Broadcast Vocal Suite (Up to 5 mics)", raw: true, live: true, edit: true },
  { feature: "Dedicated On-Site Audio Engineer & Live Levels", raw: true, live: true, edit: true },
  { feature: "Raw 4K Camera ISO Recordings & Multi-Track Stems", raw: true, live: true, edit: true },
  { feature: "Live-Switched Multi-Cam Program Feed", raw: false, live: true, edit: true },
  { feature: "Master Video Editing & Audio Mastering", raw: false, live: false, edit: true },
  { feature: "Color Grading & Vocal Enhancement", raw: false, live: false, edit: true },
  { feature: "Motion Logo, Lower Thirds & Intro Integration", raw: false, live: false, edit: true },
  { feature: "Included Revision Rounds", raw: "None", live: "None", edit: "2 Rounds" },
  { feature: "Delivery Method", raw: "USB-C SSD", live: "USB-C SSD", edit: "Cloud & SSD" },
  { feature: "Secure Cloud Storage Archive", raw: "None", live: "None", edit: "14 Days" },
];

const TIER_MATRIX_COLUMN: Record<string, "raw" | "live" | "edit"> = {
  recording: "raw",
  "recording-live-mix": "live",
  "recording-pro-edit": "edit",
  "recording-editing": "edit",
};

export function Step3Service({ session, onChange, services = PODCAST_SERVICES }: Step3ServiceProps) {
  const [showMatrix, setShowMatrix] = useState(false);
  const activeServices = services.filter((s) => s.isActive !== false);
  const canShowMatrix =
    activeServices.length > 0 && activeServices.every((s) => s.key in TIER_MATRIX_COLUMN);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <StepIntro
        index={3}
        total={5}
        title="Production Tier"
        description="Choose your post-production workflow: raw ISO camera capture, instant live-switched program feed, or full master episode post-production."
        aside={<MetaTag tone="mauve">{activeServices.length} tiers</MetaTag>}
      />

      {/* Spacious, Non-Clamping Horizontal Tier Cards (Full-width rows to prevent any text wrapping) */}
      <div className="space-y-3.5">
        {activeServices.map((service) => {
          const isSelected = session.serviceKey === service.key;
          const isBest = service.best;
          const highlights = service.highlights || [];

          return (
            <SelectableCard
              key={service.key}
              selected={isSelected}
              onSelect={() => onChange({ serviceKey: service.key })}
              showMark={false}
              className={cn(
                "p-4 sm:p-6 transition-all duration-200",
                isBest && !isSelected && "border-brand-mauve/30 bg-white/[0.015]"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                {/* Left & Middle: Tier Details & Key Deliverables */}
                <div className="space-y-2.5 min-w-0 flex-1">
                  {/* Eyebrow & Title */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {isBest ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-violet/40 text-brand-lavender border border-brand-mauve/30 text-[10px] font-mono tracking-wider uppercase font-bold shadow-sm shadow-brand-violet/40 whitespace-nowrap shrink-0">
                          <Zap size={11} className="fill-brand-lavender text-brand-lavender" />
                          {service.badge || "Most Popular"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-zinc-400 text-[10px] font-mono tracking-wider uppercase font-semibold whitespace-nowrap shrink-0">
                          {service.badge || "Studio Tier"}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {service.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {service.sub}
                    </p>
                  </div>

                  {/* Structured Deliverables Checklist (2-col grid prevents awkward badge stacking) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pt-1.5">
                    {highlights.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 min-w-0 text-[11px] sm:text-xs text-zinc-300"
                      >
                        <Check size={12} className="text-brand-mauve shrink-0" strokeWidth={2.5} />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Price & Selection Status Pill */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-s border-white/[0.06] sm:ps-6 shrink-0 sm:min-w-[170px]">
                  <div className="sm:text-end">
                    <span className="text-2xl sm:text-3xl font-black text-brand-mauve tracking-tight tabular-nums block leading-tight">
                      {formatAED(service.price)}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                      per hour
                    </span>
                  </div>

                  <TogglePill
                    selected={isSelected}
                    addLabel="Select Tier"
                    addedLabel="Selected"
                  />
                </div>
              </div>
            </SelectableCard>
          );
        })}
      </div>

      {/* Optional Granular Comparison Matrix Accordion */}
      {canShowMatrix && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowMatrix((prev) => !prev)}
            className="w-full p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.08] flex items-center justify-between text-xs text-zinc-300 transition cursor-pointer group"
          >
            <div className="flex items-center gap-2 font-mono uppercase tracking-wider font-semibold text-zinc-300 group-hover:text-white">
              <SlidersHorizontal size={14} className="text-brand-mauve" />
              <span>Compare Full Technical Specs Matrix (Side-by-Side)</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400 group-hover:text-white font-mono text-[11px]">
              <span>{showMatrix ? "Hide Matrix" : "View Details"}</span>
              {showMatrix ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </button>

          <AnimatePresence>
            {showMatrix && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={studioSprings.snappy}
                className="overflow-hidden"
              >
                <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-[#0c0c10] border border-white/[0.08] overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[540px]">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                        <th className="py-2.5 pr-4 font-bold">Studio Capability</th>
                        {activeServices.map((service) => (
                          <th
                            key={service.key}
                            className={cn(
                              "py-2.5 px-3 text-center",
                              service.best && "text-brand-mauve font-bold"
                            )}
                          >
                            {service.title} ({formatAED(service.price)})
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {COMPARISON_MATRIX.map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 pr-4 text-zinc-300 font-medium">
                            {row.feature}
                          </td>
                          {activeServices.map((service) => {
                            const colKey = TIER_MATRIX_COLUMN[service.key];
                            const cellValue = row[colKey];
                            return (
                              <td
                                key={service.key}
                                className={cn(
                                  "py-2.5 px-3 text-center",
                                  service.best && "bg-brand-violet/[0.06]"
                                )}
                              >
                                {typeof cellValue === "boolean" ? (
                                  cellValue ? (
                                    <Check
                                      size={14}
                                      className={cn(
                                        "mx-auto",
                                        service.best ? "text-brand-mauve font-bold" : "text-emerald-400"
                                      )}
                                    />
                                  ) : (
                                    <span className="text-zinc-600">—</span>
                                  )
                                ) : (
                                  <span
                                    className={cn(
                                      "font-mono text-[11px]",
                                      service.best ? "text-brand-mauve font-bold" : "text-zinc-400"
                                    )}
                                  >
                                    {cellValue}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
