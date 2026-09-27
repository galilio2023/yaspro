"use client";

import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  Copy,
  Check,
  Coins,
} from "lucide-react";
import { ENTERPRISE_CREATORS } from "../data";

interface MawthooqAuditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorSlugs?: string[];
}

export function MawthooqAuditorModal({
  isOpen,
  onClose,
  creatorSlugs = ["aboflah", "noor-stars"],
}: MawthooqAuditorModalProps) {
  const [copiedCertificate, setCopiedCertificate] = useState(false);
  const [activeTab, setActiveTab] = useState<"certificate" | "escrow" | "safety">("certificate");

  const [certificateId] = useState("GAMR-MWQ-882910-KSA");
  const [auditTimestamp] = useState("2026-09-27");

  if (!isOpen) return null;

  const auditedCreators = ENTERPRISE_CREATORS.filter((c) =>
    creatorSlugs.includes(c.id) || creatorSlugs.includes(c.slug)
  );

  const creatorsToDisplay = auditedCreators.length > 0 ? auditedCreators : ENTERPRISE_CREATORS.slice(0, 2);


  const handleCopyCert = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(`Official GAMR Mawthooq Audit Certificate: ${certificateId}\nStatus: Verified\nAccredited by: Yas Pro Media Regulatory Protocol`);
      setCopiedCertificate(true);
      setTimeout(() => setCopiedCertificate(false), 2000);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mawthooq-modal-title"
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-emerald-500/30 bg-slate-950 p-6 sm:p-8 shadow-2xl shadow-emerald-500/10 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="size-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Official Regulatory Clearance
              </span>
              <span className="text-xs font-mono text-text-muted">KSA GAMR &amp; UAE NMC</span>
            </div>
            <h2 id="mawthooq-modal-title" className="text-xl sm:text-2xl font-black text-white">
              Mawthooq Compliance &amp; Escrow Auditor
            </h2>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/10 mb-6">
          <button
            onClick={() => setActiveTab("certificate")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "certificate"
                ? "bg-emerald-500 text-black shadow-md font-bold"
                : "text-text-secondary hover:text-white"
            }`}
          >
            Digital Certificate
          </button>
          <button
            onClick={() => setActiveTab("safety")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "safety"
                ? "bg-emerald-500 text-black shadow-md font-bold"
                : "text-text-secondary hover:text-white"
            }`}
          >
            Brand Safety &amp; Disclosures
          </button>
          <button
            onClick={() => setActiveTab("escrow")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "escrow"
                ? "bg-emerald-500 text-black shadow-md font-bold"
                : "text-text-secondary hover:text-white"
            }`}
          >
            Smart Escrow (SARIE/Aani)
          </button>
        </div>

        {/* TAB 1: Digital Certificate */}
        {activeTab === "certificate" && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 relative overflow-hidden">
              {/* Guilloche effect overlay */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, #10b981 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }}
              />

              <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
                <div>
                  <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                    KINGDOM OF SAUDI ARABIA • GAMR ACCREDITATION
                  </div>
                  <div className="text-lg font-black text-white mt-0.5">
                    Mawthooq Advertising Verification
                  </div>
                  <div className="text-xs font-mono text-text-secondary">
                    Certificate Serial: <span className="text-brand-cyan">{certificateId}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-black/60 border border-emerald-500/40 text-emerald-400 shrink-0 flex items-center justify-center">
                  <QrCode size={36} />
                </div>
              </div>

              {/* Creators included */}
              <div className="space-y-2 mb-4 relative z-10">
                {creatorsToDisplay.map((creator) => (
                  <div
                    key={creator.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{creator.flag}</span>
                      <span className="font-bold text-white">{creator.name}</span>
                      <span className="text-text-muted">({creator.arabicName})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CheckCircle2 size={13} />
                      <span>{creator.mawthooqLicenseId}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Legal Verification Seal */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-emerald-500/20 text-[11px] font-mono text-text-secondary relative z-10">
                <span>Verified: {auditTimestamp}</span>
                <span className="text-emerald-400 font-bold">100% Tax &amp; Regulatory Cleared</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyCert}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/15 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copiedCertificate ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span>Audit Token Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Clearance Token</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="py-2.5 px-5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Done</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Brand Safety */}
        {activeTab === "safety" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10">
                <div className="text-xs text-text-secondary font-mono mb-1">Brand Safety Index</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">99.4%</div>
                <div className="text-[10px] text-text-muted mt-0.5">Zero negative sentiment flags</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10">
                <div className="text-xs text-text-secondary font-mono mb-1">Mandatory Tags</div>
                <div className="text-2xl font-black text-brand-cyan font-mono">Auto-Injected</div>
                <div className="text-[10px] text-text-muted mt-0.5">#إعلان #ad disclosure locked</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 text-xs text-text-secondary">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Pre-cleared against Saudi Consumer Protection Law (Executive Regulations 2024–2026).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>UAE National Media Council commercial influencer permit certified.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Direct Yas Pro indemnification shield against unlicensed creator fines (up to SAR 5,000,000).</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Smart Escrow */}
        {activeTab === "escrow" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-gold mb-3">
                <Coins size={14} />
                <span>AUTOMATED SETTLEMENT MILESTONES (SARIE / AANI)</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-white">Milestone 1: Script &amp; Concept Clearance</span>
                  <span className="text-brand-cyan font-bold">25% Locked in Escrow</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-white">Milestone 2: Yas Pro Studio Production Wrap</span>
                  <span className="text-brand-cyan font-bold">35% Release on Delivery</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-white">Milestone 3: Live Post &amp; Mawthooq Verification</span>
                  <span className="text-emerald-400 font-bold">40% Final Settlement</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-text-muted leading-relaxed">
              Funds remain secured in regulated GCC bank escrow until telemetry validates broadcast time and metric delivery.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
