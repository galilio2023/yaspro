"use client";

import React, { useState } from "react";
import { Search, ShieldCheck, User, Globe, AlertCircle } from "lucide-react";
import { lookupEnterpriseRfp, type EnterpriseRfpLookupResult } from "@/lib/portal-actions";
import { VirtualStageConfigurator } from "@/features/booking/components/VirtualStageConfigurator";

export function PortalTenders() {
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<EnterpriseRfpLookupResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setIsSearching(true);
    try {
      const res = await lookupEnterpriseRfp(searchInput.trim());
      setSearchResult(res);
    } catch {
      setSearchResult({
        found: false,
        message: "Failed to query the live enterprise tender ledger.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6 mb-8">
      {/* ─── Reference Code Tracker Search Bar ─── */}
      <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-md">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Track Proposal or SLA Reference (e.g. EXP-9182-DXB, EXP-7419-KSA)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder:text-text-muted text-xs sm:text-sm focus:outline-none focus:border-brand-purple"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-purple hover:bg-brand-purple-light text-white transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isSearching ? "Querying Ledger..." : "Lookup Proposal"}
          </button>
        </form>

        {/* Dynamic Search Result Card */}
        {searchResult && (
          <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
            {searchResult.found && searchResult.rfp ? (
              <div className="p-4 rounded-xl bg-brand-purple/10 border border-brand-purple/30">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-brand-cyan">
                      {searchResult.rfp.referenceCode}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-teal/15 text-brand-teal-light border border-brand-teal/30">
                      {searchResult.rfp.status.replace("_", " ")}
                    </span>
                  </div>
                  <span className="text-[11px] text-text-muted font-mono">
                    Logged: {new Date(searchResult.rfp.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-white mb-2">
                  {searchResult.rfp.organizationName}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <User size={13} className="text-brand-purple-light shrink-0" />
                    <span>{searchResult.rfp.contactName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe size={13} className="text-brand-cyan shrink-0" />
                    <span>{searchResult.rfp.country}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-brand-teal shrink-0" />
                    <span>
                      {searchResult.rfp.requiresMawthooqCompliance ? "Mawthooq Pre-Cleared" : "Standard Compliance"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{searchResult.message || "No record found."}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Active GCC Sovereign Master Tenders ─── */}
      <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-slate-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-brand-cyan">EXP-9182-DXB</span>
            <span className="text-[10px] font-mono text-brand-teal-light bg-brand-teal/15 px-2 py-0.5 rounded border border-brand-teal/30">
              SLA ACTIVE
            </span>
          </div>
          <h4 className="text-sm sm:text-base font-bold text-white mt-1">
            Dubai Municipality Professional Academy (DMX) Master Launch Film
          </h4>
          <div className="text-xs text-text-secondary mt-0.5">
            Senior Producer: Yaman Alomari • Deliverable: 4K Master + 3D CGI Tour
          </div>
        </div>

        <div className="text-left md:text-right pt-2 md:pt-0 border-t border-white/5 md:border-none w-full md:w-auto">
          <div className="text-xs font-mono text-text-muted">Target Delivery</div>
          <div className="text-xs sm:text-sm font-bold text-white">Next 14 Business Days</div>
        </div>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-slate-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-brand-gold">EXP-7419-KSA</span>
            <span className="text-[10px] font-mono text-brand-gold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              UNDER REVIEW
            </span>
          </div>
          <h4 className="text-sm sm:text-base font-bold text-white mt-1">
            Saudi Pro League Multi-Cam OB-VAN Broadcast Deployment
          </h4>
          <div className="text-xs text-text-secondary mt-0.5">
            Mobile Unit 01 Dispatch • EVS Live Replay &amp; AI Viral Syndication
          </div>
        </div>

        <div className="text-left md:text-right pt-2 md:pt-0 border-t border-white/5 md:border-none w-full md:w-auto">
          <div className="text-xs font-mono text-text-muted">Status</div>
          <div className="text-xs sm:text-sm font-bold text-brand-gold">Board Review Stage</div>
        </div>
      </div>
    </div>
  );
}

export function PortalStages() {
  return (
    <div className="space-y-6 mb-8">
      <VirtualStageConfigurator />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-slate-900/60">
        <div className="text-xs font-mono text-brand-purple-light uppercase mb-1">DUBAI MAIN STAGE A</div>
        <div className="text-base sm:text-lg font-bold text-white mb-2">850 m² Acoustic Volume</div>
        <div className="text-xs text-text-secondary mb-4 leading-relaxed">
          Infinite 180° Cyclorama • Motorized DMX Grid • ARRI SkyPanel RGBWW
        </div>
        <div className="text-xs font-mono text-brand-teal-light font-bold">● Reserved: 4 Days Remaining This Month</div>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-slate-900/60">
        <div className="text-xs font-mono text-brand-cyan uppercase mb-1">DUBAI PODCAST SUITE</div>
        <div className="text-base sm:text-lg font-bold text-white mb-2">4-Host Broadcast Lounge</div>
        <div className="text-xs text-text-secondary mb-4 leading-relaxed">
          Shure SM7B Broadcast Mics • 4K AI Auto-Switching • Neon Backdrops
        </div>
        <div className="text-xs font-mono text-brand-cyan font-bold">● Reserved: 12 Hours Allocated</div>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-slate-900/60 sm:col-span-2 lg:col-span-1">
        <div className="text-xs font-mono text-brand-gold uppercase mb-1">OB-VAN COMMAND UNIT</div>
        <div className="text-base sm:text-lg font-bold text-white mb-2">Mercedes Actros Fleet</div>
        <div className="text-xs text-text-secondary mb-4 leading-relaxed">
          12x Sony HDC-4300 • Dual EVS XT-VIA • Encrypted Ka/Ku Uplink
        </div>
        <div className="text-xs font-mono text-brand-gold font-bold">● Standby Status: UAE &amp; KSA Ready</div>
      </div>
      </div>
    </div>
  );
}
