"use client";

import React, { useState } from "react";
import { Languages, Cpu, AlertTriangle } from "lucide-react";
import type { DialectTransmutationResult } from "@/lib/ai/dialect-engine";

export function CopilotDialectTab() {
  const [scriptText, setScriptText] = useState("نحن متحمسون جداً لإطلاق هذا المنتج الجديد هنا بمواصفات عالية.");
  const [selectedDialect, setSelectedDialect] = useState("najdi");
  const [scriptTone, setScriptTone] = useState("Prestige");
  const [isTransmuting, setIsTransmuting] = useState(false);
  const [dialectResult, setDialectResult] = useState<DialectTransmutationResult | null>(null);
  const [dialectError, setDialectError] = useState<string | null>(null);

  const handleTransmuteDialect = async () => {
    if (!scriptText.trim()) return;
    setDialectError(null);
    setIsTransmuting(true);

    try {
      const res = await fetch("/api/ai/dialect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: scriptText,
          dialectId: selectedDialect,
          tone: scriptTone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to transmute script");
      setDialectResult(data.result);
    } catch (err: unknown) {
      setDialectError(err instanceof Error ? err.message : "Error transmuting dialect");
    } finally {
      setIsTransmuting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Script / Ad Copy (Arabic or English)
          </label>
          <textarea
            rows={4}
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            placeholder="Enter script text to localize into authentic Gulf dialect..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-base sm:text-sm text-white placeholder-text-muted focus:outline-none focus:border-brand-purple transition-colors resize-none"
            dir="auto"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Target Dialect
            </label>
            <select
              value={selectedDialect}
              onChange={(e) => setSelectedDialect(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-brand-purple min-h-[44px] sm:min-h-0"
            >
              <option value="najdi" className="bg-neutral-900">🇸🇦 Najdi (Riyadh)</option>
              <option value="emirati" className="bg-neutral-900">🇦🇪 Emirati (Dubai / Abu Dhabi)</option>
              <option value="hijazi" className="bg-neutral-900">🇸🇦 Hijazi (Jeddah)</option>
              <option value="kuwaiti" className="bg-neutral-900">🇰🇼 Kuwaiti</option>
              <option value="egyptian" className="bg-neutral-900">🇪🇬 Egyptian (Cairo)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Tone
            </label>
            <select
              value={scriptTone}
              onChange={(e) => setScriptTone(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-brand-purple min-h-[44px] sm:min-h-0"
            >
              <option value="Prestige" className="bg-neutral-900">Prestige & Luxury</option>
              <option value="Warm Hospitality" className="bg-neutral-900">Warm Hospitality</option>
              <option value="Youth Commercial" className="bg-neutral-900">Youth Commercial</option>
              <option value="Authoritative" className="bg-neutral-900">Authoritative</option>
            </select>
          </div>
        </div>

        {dialectError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle size={14} />
            <span>{dialectError}</span>
          </div>
        )}

        <button
          onClick={handleTransmuteDialect}
          disabled={isTransmuting}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 transition-all shadow-lg disabled:opacity-50 min-h-[44px] cursor-pointer"
        >
          {isTransmuting ? (
            <>
              <Cpu size={16} className="animate-spin" />
              <span>Calibrating Regional Nuance...</span>
            </>
          ) : (
            <>
              <Languages size={16} />
              <span>Localize Script with Gemini</span>
            </>
          )}
        </button>
      </div>

      {/* Output */}
      <div className="lg:col-span-7 bg-white/[0.02] border border-white/10 rounded-2xl p-5 min-h-[380px] flex flex-col justify-between">
        {dialectResult ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{dialectResult.flag}</span>
                <div>
                  <div className="text-xs font-bold text-white">{dialectResult.dialectName}</div>
                  <div className="text-[10px] text-text-muted">{dialectResult.recommendedTone} Tone</div>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                {dialectResult.resonanceScore}% Resonance
              </div>
            </div>

            <div className="p-4 rounded-xl bg-brand-purple/10 border border-brand-purple/20">
              <div className="text-[10px] uppercase tracking-wider font-mono text-brand-purple-light mb-1.5">
                Transmuted Regional Script (V/O Ready)
              </div>
              <p className="text-base text-white font-medium leading-relaxed font-arabic" dir="rtl">
                {dialectResult.transmutedArabic}
              </p>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-text-secondary uppercase mb-1">
                Cultural & Linguistic Commentary
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                {dialectResult.englishExplanation}
              </p>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-text-secondary uppercase mb-1.5">
                Injected Prestige Honorifics
              </div>
              <div className="flex flex-wrap gap-2">
                {dialectResult.honorificsUsed.map((h) => (
                  <span
                    key={h}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-brand-gold text-xs font-arabic"
                    dir="rtl"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-purple">
              <Languages size={26} />
            </div>
            <h4 className="text-sm font-semibold text-white">Dialect Engine Idle</h4>
            <p className="text-xs text-text-muted max-w-sm">
              Select your target Gulf dialect and brand tone to adapt script copy with regional honorifics and regulatory compliance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
