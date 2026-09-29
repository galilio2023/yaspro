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
  Sparkles,
  AlertTriangle,
  FileCheck,
  Send,
} from "lucide-react";
import { ENTERPRISE_CREATORS } from "../data";
import type { MawthooqAuditReport } from "@/lib/ai/mawthooq-auditor";

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
  const [activeTab, setActiveTab] = useState<"certificate" | "audit" | "safety" | "escrow">("certificate");

  const [certificateId] = useState("GAMR-MWQ-882910-KSA");
  const [auditTimestamp] = useState("2026-09-27");

  // Script Auditor state
  const [scriptInput, setScriptInput] = useState(
    "#إعلان تجاري - تجربة تصوير سينمائي استثنائية في استوديوهات ياس برو بالرياض مع طاقم تصوير وطني معتمد. احجز باقتك الآن بخصم رسمي."
  );
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState<MawthooqAuditReport | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAudit = async (customText?: string) => {
    const textToScan = customText || scriptInput;
    if (!textToScan.trim()) return;
    setIsAuditing(true);
    setAuditError(null);
    try {
      const res = await fetch("/api/ai/mawthooq-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scriptOrCopy: textToScan,
          targetMarket: "KSA",
          creatorMawthooqNumber: certificateId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.report) {
        setAuditReport(data.report);
      } else {
        setAuditError(data.error || "Failed to complete audit.");
      }
    } catch {
      setAuditError("Network error contacting Mawthooq compliance server.");
    } finally {
      setIsAuditing(false);
    }
  };

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
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:w-[90vw] sm:max-w-3xl rounded-none sm:rounded-3xl border border-emerald-500/30 bg-slate-950 p-6 sm:p-8 shadow-2xl shadow-emerald-500/10 my-0 sm:my-8 overflow-y-auto">
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
          <div className="size-12 rounded-2xl bg-brand-purple/20 border border-brand-purple/40 text-brand-purple-light flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-teal-light font-bold bg-brand-teal/15 px-2 py-0.5 rounded border border-brand-teal/30">
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
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/10 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("certificate")}
            className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "certificate"
                ? "bg-gradient-to-r from-brand-purple to-brand-teal text-white shadow-md shadow-brand-purple/30 font-bold"
                : "text-text-secondary hover:text-white"
            }`}
          >
            Digital Certificate
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "audit"
                ? "bg-gradient-to-r from-brand-purple to-brand-teal text-white shadow-md shadow-brand-purple/30 font-bold"
                : "text-text-secondary hover:text-white"
            }`}
          >
            <Sparkles size={13} className={activeTab === "audit" ? "text-white" : "text-brand-purple-light"} />
            <span>AI Script Auditor</span>
          </button>
          <button
            onClick={() => setActiveTab("safety")}
            className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "safety"
                ? "bg-gradient-to-r from-brand-purple to-brand-teal text-white shadow-md shadow-brand-purple/30 font-bold"
                : "text-text-secondary hover:text-white"
            }`}
          >
            Brand Safety
          </button>
          <button
            onClick={() => setActiveTab("escrow")}
            className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "escrow"
                ? "bg-gradient-to-r from-brand-purple to-brand-teal text-white shadow-md shadow-brand-purple/30 font-bold"
                : "text-text-secondary hover:text-white"
            }`}
          >
            Smart Escrow
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
                className="py-2.5 px-5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Done</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB: AI Script & Copy Auditor */}
        {activeTab === "audit" && (
          <div className="space-y-4 animate-fade-in">
            {/* Input Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
              <label className="text-xs font-mono font-bold text-text-muted uppercase flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-brand-teal">
                  <FileCheck size={14} />
                  <span>Script / Ad Copy Regulatory Scanner</span>
                </span>
                <span className="text-[10px] text-text-muted">Target: KSA GAMR / Mawthooq</span>
              </label>

              <textarea
                rows={3}
                value={scriptInput}
                onChange={(e) => setScriptInput(e.target.value)}
                placeholder="Paste promotional caption, script dialogue, or campaign brief..."
                className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-base sm:text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-brand-purple resize-none font-mono"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {/* Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const sample = "#إعلان تجاري - تجربة تصوير سينمائي استثنائية في استوديوهات ياس برو بالرياض مع طاقم تصوير وطني معتمد. احجز باقتك الآن بخصم رسمي.";
                      setScriptInput(sample);
                      handleRunAudit(sample);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-brand-teal/15 hover:bg-brand-teal/25 text-brand-teal-light border border-brand-teal/40 cursor-pointer transition-colors"
                  >
                    ✓ Compliant Sample (#إعلان)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const sample = "فرصة العمر! تداول عملات رقمية وفوركس مع سحب فوري بدون شروط واربح سيارة مجاناً. أفضل منصة في العالم!";
                      setScriptInput(sample);
                      handleRunAudit(sample);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 cursor-pointer"
                  >
                    ⚠️ High-Risk Sample
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleRunAudit()}
                  disabled={isAuditing || !scriptInput.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-teal hover:opacity-95 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-purple/25 transition-all disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {isAuditing ? (
                    <span className="animate-pulse">Scanning GAMR Rules...</span>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Scan Copy</span>
                    </>
                  )}
                </button>
              </div>

              {auditError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-400 shrink-0" />
                  <span>{auditError}</span>
                </div>
              )}
            </div>

            {/* Audit Results */}
            {auditReport && (
              <div className="space-y-3.5 p-4 rounded-2xl bg-black/50 border border-brand-purple/30">
                {/* Score Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-12 rounded-xl flex items-center justify-center font-mono font-black text-lg ${
                        auditReport.status === "compliant"
                          ? "bg-brand-teal/20 text-brand-teal-light border border-brand-teal/40"
                          : auditReport.status === "warning"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          : "bg-red-500/20 text-red-400 border border-red-500/40"
                      }`}
                    >
                      {auditReport.complianceScore}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold uppercase font-mono px-2 py-0.5 rounded ${
                            auditReport.status === "compliant"
                              ? "bg-brand-teal/15 text-brand-teal-light"
                              : auditReport.status === "warning"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {auditReport.status === "compliant"
                            ? "GCAM Cleared & Certified"
                            : auditReport.status === "warning"
                            ? "Action Required: Revisions Recommended"
                            : "Violation Detected: Do Not Publish"}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {auditReport.disclosureStatus.hasMandatoryDisclosure
                          ? `Mandatory tag verified (${auditReport.disclosureStatus.detectedDisclosureTags.join(", ")})`
                          : "Missing mandatory disclosure hashtag (#إعلان)"}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-brand-purple-light bg-brand-purple/10 px-2.5 py-1 rounded-md border border-brand-purple/20">
                    {auditReport.isAiGenerated ? "Gemini Multimodal AI" : "Deterministic GAMR Engine"}
                  </span>
                </div>

                {/* Flagged Phrases */}
                {auditReport.flaggedTerms.length > 0 && (
                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2">
                    <span className="text-xs font-mono font-bold text-red-400 flex items-center gap-1.5">
                      <AlertTriangle size={13} />
                      <span>Flagged Phrases ({auditReport.flaggedTerms.length})</span>
                    </span>
                    <div className="space-y-1.5">
                      {auditReport.flaggedTerms.map((f, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-black/60 border border-red-500/20 text-xs flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-red-300">&quot;{f.term}&quot;</span>
                            {f.suggestedReplacement && (
                              <span className="text-[11px] text-emerald-400">
                                Suggestion: <strong className="font-mono">{f.suggestedReplacement}</strong>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-text-muted">{f.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Checklist */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono font-bold text-text-secondary uppercase">
                    Regulatory Checklist
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {auditReport.regulatoryChecks.map((c, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-start gap-2"
                      >
                        {c.passed ? (
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-bold text-white text-[11px]">{c.checkName}</div>
                          <p className="text-[10px] text-text-muted leading-tight mt-0.5">{c.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
                <CheckCircle2 size={15} className="text-brand-teal shrink-0 mt-0.5" />
                <span>Pre-cleared against Saudi Consumer Protection Law (Executive Regulations 2024–2026).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-brand-teal shrink-0 mt-0.5" />
                <span>UAE National Media Council commercial influencer permit certified.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-brand-teal shrink-0 mt-0.5" />
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
                  <span className="text-brand-teal-light font-bold">40% Final Settlement</span>
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
