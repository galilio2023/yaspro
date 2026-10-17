import { useState } from "react";
import { Check, Zap, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
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

const TIER_MATRIX_KEYS = [
  { key: "rawISOs", raw: true, live: true, edit: true },
  { key: "shureSuite", raw: true, live: true, edit: true },
  { key: "soundEngineer", raw: true, live: true, edit: true },
  { key: "cameraISOs", raw: true, live: true, edit: true },
  { key: "liveFeed", raw: false, live: true, edit: true },
  { key: "masterEditing", raw: false, live: false, edit: true },
  { key: "colorGrading", raw: false, live: false, edit: true },
  { key: "motionLogo", raw: false, live: false, edit: true },
  { key: "revisionRounds", raw: "valNone", live: "valNone", edit: "valRevisions" },
  { key: "deliveryMethod", raw: "valUsb", live: "valUsb", edit: "valCloudAndSsd" },
  { key: "cloudArchive", raw: "valNone", live: "valNone", edit: "valCloudDays" },
];

const TIER_MATRIX_COLUMN: Record<string, "raw" | "live" | "edit"> = {
  recording: "raw",
  "recording-live-mix": "live",
  "recording-pro-edit": "edit",
  "recording-editing": "edit",
};

export function Step3Service({ session, onChange, services = PODCAST_SERVICES }: Step3ServiceProps) {
  const { t, isArabic } = useLanguage();
  const [showMatrix, setShowMatrix] = useState(false);
  const activeServices = services.filter((s) => s.isActive !== false);
  const matrixServices = activeServices.filter((service) => Object.hasOwn(TIER_MATRIX_COLUMN, service.key));
  const canShowMatrix = matrixServices.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <StepIntro
        index={3}
        total={5}
        title={t("podcastBooking.step3.introTitle")}
        description={t("podcastBooking.step3.introDesc")}
        aside={<MetaTag tone="mauve">{t("podcastBooking.step3.tiersCount", { count: activeServices.length })}</MetaTag>}
      />

      {/* Spacious, Non-Clamping Horizontal Tier Cards (Full-width rows to prevent any text wrapping) */}
      <div className="space-y-3.5">
        {activeServices.map((service) => {
          const isSelected = session.serviceKey === service.key;
          const isBest = service.best;
          const title = (isArabic && service.titleAr) ? service.titleAr : service.title;
          const sub = (isArabic && service.subAr) ? service.subAr : service.sub;
          const badge = (isArabic && service.badgeAr) ? service.badgeAr : (service.badge || (isBest ? "Most Popular" : "Studio Tier"));
          const highlights = (isArabic && service.highlightsAr && service.highlightsAr.length > 0)
            ? service.highlightsAr
            : (service.highlights || []);

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
                          {badge}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-zinc-400 text-[10px] font-mono tracking-wider uppercase font-semibold whitespace-nowrap shrink-0">
                          {badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {sub}
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
                      {t("podcastBooking.step3.perHour")}
                    </span>
                  </div>

                  <TogglePill
                    selected={isSelected}
                    addLabel={t("podcastBooking.step3.selectTier")}
                    addedLabel={t("podcastBooking.step3.tierSelected")}
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
              <span>{t("podcastBooking.step3.matrixToggle")}</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400 group-hover:text-white font-mono text-[11px]">
              <span>{showMatrix ? t("podcastBooking.step3.matrixHide") : t("podcastBooking.step3.matrixView")}</span>
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
                  <table className="w-full text-start text-xs min-w-[540px]">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                        <th className="py-2.5 pe-4 font-bold text-start">{t("podcastBooking.step3.matrixCapability")}</th>
                        {matrixServices.map((service) => (
                          <th
                            key={service.key}
                            className={cn(
                              "py-2.5 px-3 text-center",
                              service.best && "text-brand-mauve font-bold"
                            )}
                          >
                            {(isArabic && service.titleAr) ? service.titleAr : service.title} ({formatAED(service.price)})
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {TIER_MATRIX_KEYS.map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 pe-4 text-zinc-300 font-medium text-start">
                            {t(`podcastBooking.step3.matrixRows.${row.key}` as any)}
                          </td>
                          {matrixServices.map((service) => {
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
                                    {t(`podcastBooking.step3.matrixRows.${cellValue}` as any)}
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
