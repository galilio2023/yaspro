"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { ArrowRight, Terminal, Sparkles } from "lucide-react";
import { AiBentoGrid } from "./AiBentoGrid";
import { AiProductionCopilot } from "@/components/ai/AiProductionCopilot";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function AiEcosystemSection() {
  const { t, isArabic } = useLanguage();
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  return (
    <>
      <Section
        id="ai-ecosystem"
        aria-labelledby="ai-ecosystem-title"
        className="bg-background border-t border-white/5 relative overflow-hidden py-16 lg:py-28"
        background={
          <>
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] rounded-full pointer-events-none opacity-20"
              style={{
                background: "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 60%)",
              }}
            />
            {/* Subtle Cyber Grid */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                backgroundSize: "64px 64px",
              }}
            />
          </>
        }
      >
        <Container className="relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider font-semibold border border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan mb-5 backdrop-blur-md">
                <span className="size-2 rounded-full bg-brand-cyan animate-pulse" />
                <span>{t("ai.badge")}</span>
              </div>

              <h2
                id="ai-ecosystem-title"
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 font-display tracking-tight leading-[1.1] text-balance"
              >
                {isArabic ? t("ai.title") : "The Yas Pro"} <br />
                <span className="bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-cyan bg-clip-text text-transparent">
                  {isArabic ? t("ai.titleGradient") : "AI Ecosystem"}
                </span>
              </h2>

              <p className="text-lg text-text-secondary mb-8 text-balance leading-relaxed">
                {t("ai.description")}
              </p>

              {/* Primary Copilot Trigger */}
              <div className="flex justify-center">
                <button
                  onClick={() => setIsCopilotOpen(true)}
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 shadow-xl hover:shadow-brand-purple/20 transition-all duration-300 group"
                >
                  <Sparkles size={18} className="text-white group-hover:rotate-12 transition-transform duration-300" />
                  <span>{t("ai.launchCopilot")}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform duration-300" />
                </button>
              </div>
            </FadeUp>
          </div>

          {/* AI Bento Grid */}
          <div className="w-full mb-16">
            <AiBentoGrid />
          </div>

          {/* Bottom Terminal Action Bar */}
          <FadeUp delay={0.2} className="w-full max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md w-full">
              <div className="flex items-center gap-4 text-start">
                <div className="size-12 rounded-xl bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-brand-purple-light">
                  <Terminal size={20} />
                </div>
                <div>
                  <div className="text-white font-semibold font-display text-base mb-0.5">
                    {t("ai.enterpriseHeading")}
                  </div>
                  <div className="text-text-muted font-mono text-xs">
                    {t("ai.enterpriseSub")}
                  </div>
                </div>
              </div>

              <Link
                href="/enterprise"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-white/10 hover:bg-brand-purple border border-white/15 hover:border-brand-purple transition-all duration-300 shadow-md group shrink-0"
              >
                <span>{t("ai.enterpriseButton")}</span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180"
                />
              </Link>
            </div>
          </FadeUp>
        </Container>
      </Section>

      {/* Interactive AI Production Copilot Modal */}
      <AiProductionCopilot
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </>
  );
}
