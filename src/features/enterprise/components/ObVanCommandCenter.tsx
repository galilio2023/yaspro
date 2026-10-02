"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Radio,
  Wifi,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { OB_VAN_SPECS } from "../data";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface ObVanProps {
  onReserveObVan?: () => void;
}

export function ObVanCommandCenter({ onReserveObVan }: ObVanProps) {
  const { t } = useLanguage();
  const [isProcessingClip, setIsProcessingClip] = useState<boolean>(false);
  const [clipSeconds, setClipSeconds] = useState<number>(0);
  const [clipDone, setClipDone] = useState<boolean>(false);

  const triggerAiSyndicationDemo = () => {
    setIsProcessingClip(true);
    setClipDone(false);
    setClipSeconds(0);
  };

  useEffect(() => {
    if (!isProcessingClip) return;
    const interval = setInterval(() => {
      setClipSeconds((prev) => {
        if (prev >= 8.2) {
          setIsProcessingClip(false);
          setClipDone(true);
          return 8.4;
        }
        return Math.round((prev + 0.3) * 10) / 10;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isProcessingClip]);

  return (
    <section id="ob-van-command" className="py-12 sm:py-16 lg:py-28 bg-slate-950 border-b border-white/10 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <Container className="relative z-10 max-w-6xl">
        <SectionHeader
          badge={t("enterprise.obVan.badge")}
          badgeVariant="gold"
          badgeIcon={<Radio size={13} className="text-amber-400" />}
          title={t("enterprise.obVan.title")}
          gradientText={t("enterprise.obVan.gradient")}
          description={t("enterprise.obVan.description")}
          className="mb-10 text-center"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
          {/* Left Column: Command Unit Photo & Live Status */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl border border-white/20 overflow-hidden shadow-2xl group bg-slate-900">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src="/images/projects/stadiums-dubai.jpg"
                  alt="Yas Pro Mobile OB-VAN Unit"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 700px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Overlaid Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                  <div className="bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-500/40 text-xs font-mono text-amber-400 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="font-bold">UNIT 01: STANDBY / DUBAI IRIS BAY</span>
                  </div>
                </div>

                <div className="absolute top-4 right-4 pointer-events-none">
                  <div className="bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/40 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    <Wifi size={13} className="text-emerald-400" />
                    <span>ENCRYPTED SATELLITE UPLINK</span>
                  </div>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10">
                  <div className="text-sm font-bold text-white mb-1">{OB_VAN_SPECS.model}</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary font-mono">
                    <span>• {OB_VAN_SPECS.camerasCount}</span>
                    <span>• {OB_VAN_SPECS.replayEngine}</span>
                    <span>• {OB_VAN_SPECS.audioInfrastructure}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 8-Second AI Viral Clip Engine Simulation */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="p-6 rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 mb-2">
                <Sparkles size={14} />
                <span>AUTONOMOUS EDGE COMPUTE</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                8-Second AI Viral Clip Engine
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary mb-6 leading-relaxed">
                During live broadcasts, our edge node isolates goals, key speaker highlights, and crowd reactions, formatting them into vertical 9:16 HDR clips with bilingual subtitles in under 9 seconds.
              </p>

              {/* Progress Box */}
              <div className="p-4 rounded-2xl border border-white/10 bg-black/60 mb-6">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-text-secondary">AI Ingestion Pipeline:</span>
                  <span className="font-bold text-amber-400">
                    {isProcessingClip
                      ? `Processing... ${clipSeconds}s`
                      : clipDone
                      ? "Completed in 8.4s!"
                      : "Ready to Trigger"}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-100"
                    style={{
                      width: isProcessingClip
                        ? `${(clipSeconds / 8.4) * 100}%`
                        : clipDone
                        ? "100%"
                        : "0%",
                    }}
                  />
                </div>

                {clipDone && (
                  <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-400 font-mono">
                    <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                    <span>Master Vertical 9:16 Clip Syndicated to TikTok & X</span>
                  </div>
                )}
              </div>

              {/* Trigger Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={triggerAiSyndicationDemo}
                  disabled={isProcessingClip}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-bold btn-brand text-zinc-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isProcessingClip ? (
                    <>
                      <RotateCcw size={14} className="animate-spin" />
                      <span>{t("enterprise.obVan.processing")}</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} fill="currentColor" />
                      <span>{t("enterprise.obVan.simulate")}</span>
                    </>
                  )}
                </button>

                {onReserveObVan && (
                  <button
                    onClick={onReserveObVan}
                    className="py-3 px-4 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/15 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>{t("enterprise.obVan.requestVan")}</span>
                    <ArrowRight size={13} className="rtl:rotate-180" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specs Fleet Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl border border-white/5 bg-slate-900/40">
            <div className="text-xs text-text-muted font-mono mb-1">OPTICAL FIBER RUNS</div>
            <div className="text-sm font-bold text-white">{OB_VAN_SPECS.opticalFiberRuns}</div>
          </div>
          <div className="p-4 rounded-2xl border border-white/5 bg-slate-900/40">
            <div className="text-xs text-text-muted font-mono mb-1">BROADCAST STANDARD</div>
            <div className="text-sm font-bold text-white">{OB_VAN_SPECS.broadcastStandard}</div>
          </div>
          <div className="p-4 rounded-2xl border border-white/5 bg-slate-900/40">
            <div className="text-xs text-text-muted font-mono mb-1">AUDIO CONSOLE</div>
            <div className="text-sm font-bold text-white">{OB_VAN_SPECS.audioInfrastructure}</div>
          </div>
          <div className="p-4 rounded-2xl border border-white/5 bg-slate-900/40">
            <div className="text-xs text-text-muted font-mono mb-1">POWER REDUNDANCY</div>
            <div className="text-sm font-bold text-white">{OB_VAN_SPECS.powerRedundancy}</div>
          </div>
        </div>
      </Container>
    </section>
  );
}
