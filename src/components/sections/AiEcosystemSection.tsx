"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { ArrowRight, Terminal, Sparkles, Wand2 } from "lucide-react";
import { ECOSYSTEM_METRICS } from "./ecosystem.data";
import { EcosystemMetricCard } from "./EcosystemMetricCard";
import { OrbitingMediaNodes } from "./OrbitingMediaNodes";
import { AiProductionCopilot } from "@/components/ai/AiProductionCopilot";

export function AiEcosystemSection() {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  return (
    <>
      <Section
        id="ai-ecosystem"
        aria-labelledby="ai-ecosystem-title"
        className="bg-background border-t border-white/5 relative overflow-hidden py-20 lg:py-28"
        background={
          <>
            <div
              className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 size-[650px] rounded-full pointer-events-none opacity-20"
              style={{
                background: "radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute top-1/2 right-1/4 -translate-y-1/2 size-[450px] rounded-full pointer-events-none opacity-20"
              style={{
                background: "radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)",
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Descriptive info & Metrics */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              <FadeUp>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider font-semibold border border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan mb-5 backdrop-blur-md">
                  <span className="size-2 rounded-full bg-brand-cyan animate-pulse" />
                  <span>Next-Gen Neural Broadcast Infrastructure</span>
                </div>

                <h2
                  id="ai-ecosystem-title"
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 font-display tracking-tight leading-[1.1] text-balance"
                >
                  The Yas Pro <br />
                  <span className="bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-cyan bg-clip-text text-transparent">
                    AI Ecosystem
                  </span>
                </h2>

                <p className="text-base sm:text-lg text-text-secondary mb-6 max-w-xl text-balance leading-relaxed">
                  We combine heavy-duty broadcast infrastructure with autonomous generative AI pipelines. Every production node communicates seamlessly across soundstages, mobile OB-vans, and multi-platform Gulf distribution networks.
                </p>

                {/* Primary Copilot Trigger */}
                <div className="mb-8">
                  <button
                    onClick={() => setIsCopilotOpen(true)}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 shadow-xl hover:shadow-brand-purple/20 transition-all duration-300 group"
                  >
                    <Sparkles size={16} className="text-white group-hover:rotate-12 transition-transform duration-300" />
                    <span>Launch AI Production Copilot</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </FadeUp>

              {/* Metrics Grid */}
              <FadeUp delay={0.2} className="w-full mb-8">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
                  {ECOSYSTEM_METRICS.map((metric) => (
                    <EcosystemMetricCard key={metric.label} metric={metric} />
                  ))}
                </dl>
              </FadeUp>

              {/* Bottom Terminal Action Bar */}
              <FadeUp delay={0.3} className="w-full">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md w-full">
                  <div className="flex items-center gap-3 text-left">
                    <div className="size-9 rounded-xl bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-brand-purple-light">
                      <Terminal size={16} />
                    </div>
                    <div className="text-xs">
                      <div className="text-white font-semibold font-display">
                        Need Custom AI Production Workflows?
                      </div>
                      <div className="text-text-muted font-mono text-[11px]">
                        Dedicated solutions for GCC media networks
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/enterprise"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-brand-purple border border-white/15 hover:border-brand-purple transition-all duration-300 shadow-md group shrink-0"
                  >
                    <span>Enterprise Sovereign Suite</span>
                    <ArrowRight
                      size={13}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </FadeUp>
            </div>

            {/* Right Column: High-Tech Orbiting Media Nodes Engine */}
            <div className="lg:col-span-6 w-full">
              <OrbitingMediaNodes />
            </div>
          </div>
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
