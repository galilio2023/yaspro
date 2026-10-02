"use client";

import React, { useState } from "react";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { ArrowRight, Cpu } from "lucide-react";
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
        className="bg-background border-t border-white/8 relative overflow-hidden py-16 lg:py-28 film-grain"
      >
        <Container className="relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider font-semibold border border-white/12 bg-zinc-900/80 text-zinc-200 mb-5 backdrop-blur-md shadow-lg shadow-black/40">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span>{t("ai.badge")}</span>
              </div>

              <h2
                id="ai-ecosystem-title"
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 font-display tracking-tight leading-[1.1] text-balance"
              >
                {isArabic ? t("ai.title") : "The Yas Pro"} <br />
                <span className="text-amber-400 font-serif italic font-normal">
                  {isArabic ? t("ai.titleGradient") : "AI Ecosystem"}
                </span>
              </h2>

              <p className="text-lg text-zinc-300 mb-8 text-balance leading-relaxed">
                {t("ai.description")}
              </p>

              {/* Primary Copilot Trigger */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsCopilotOpen(true)}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-bold text-zinc-950 bg-amber-500 hover:bg-amber-400 shadow-xl shadow-amber-500/25 transition-all duration-200 active:scale-[0.97] cursor-pointer group"
                >
                  <Cpu size={16} className="text-zinc-950 group-hover:rotate-12 transition-transform duration-300" />
                  <span>{t("ai.launchCopilot")}</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform duration-200" />
                </button>
              </div>
            </FadeUp>
          </div>

          {/* AI Bento Grid */}
          <div className="w-full mb-16">
            <AiBentoGrid />
          </div>
        </Container>
      </Section>

      {/* Production Copilot Modal */}
      <AiProductionCopilot
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </>
  );
}
