"use client";

import React from "react";

export function PortalTenders() {
  return (
    <div className="space-y-4 mb-8">
      <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-slate-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-brand-cyan">EXP-9182-DXB</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
      <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-slate-900/60">
        <div className="text-xs font-mono text-brand-purple-light uppercase mb-1">DUBAI MAIN STAGE A</div>
        <div className="text-base sm:text-lg font-bold text-white mb-2">850 m² Acoustic Volume</div>
        <div className="text-xs text-text-secondary mb-4 leading-relaxed">
          Infinite 180° Cyclorama • Motorized DMX Grid • ARRI SkyPanel RGBWW
        </div>
        <div className="text-xs font-mono text-emerald-400 font-bold">● Reserved: 4 Days Remaining This Month</div>
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
  );
}
