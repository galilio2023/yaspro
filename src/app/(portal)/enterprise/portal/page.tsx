import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import {
  ShieldCheck, Video, FileText, Calendar, Radio,
  ArrowRight, Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Executive Overview | Enterprise Vault" };

export default async function EnterprisePortalPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?callbackUrl=/enterprise/portal");

  const firstName = session.user.name.split(" ")[0];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0b10] border border-amber-500/20 backdrop-blur-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
          <ShieldCheck size={14} /> Sovereign Enterprise Access
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Welcome back, {firstName} 👁️
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-xl">
          Your unified production command layer — C2C dailies, active tenders, soundstage allocations, and sovereign telemetry bus.
        </p>
      </div>

      {/* Status indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Relay Bus", value: "LIVE", color: "text-emerald-400", dot: "bg-emerald-400 animate-pulse" },
          { label: "SMPTE 2110", value: "SYNCED", color: "text-amber-400", dot: "bg-amber-400 animate-pulse" },
          { label: "Vault Status", value: "SECURED", color: "text-amber-400", dot: "bg-amber-400" },
          { label: "SLA Tier", value: "PLATINUM", color: "text-amber-400", dot: "bg-amber-400" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full ${s.dot} shrink-0`} />
              <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">{s.label}</span>
            </div>
            <div className={`text-sm font-extrabold font-mono ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Module grid */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Zap size={12} className="text-amber-400" /> Production Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              href: "/enterprise/portal/dailies",
              icon: Video,
              iconBg: "bg-amber-500/20",
              iconColor: "text-amber-400",
              hoverBorder: "hover:border-amber-500/40",
              actionColor: "text-amber-400",
              title: "C2C Dailies Vault",
              desc: "Review frame-accurate camera-to-cloud footage with timecoded annotations from colorists and executive producers.",
              tag: "Live Ingest",
              tagColor: "text-amber-300 bg-amber-500/10 border-amber-500/20",
            },
            {
              href: "/enterprise/portal/rfps",
              icon: FileText,
              iconBg: "bg-amber-500/10",
              iconColor: "text-amber-300",
              hoverBorder: "hover:border-amber-500/30",
              actionColor: "text-amber-300",
              title: "Active Tenders & RFPs",
              desc: "Track proposal statuses, Mawthooq compliance flags, and SLA reference codes for government and enterprise RFPs.",
              tag: "Tender Ledger",
              tagColor: "text-amber-200 bg-amber-500/10 border-amber-500/20",
            },
            {
              href: "/enterprise/portal/stages",
              icon: Calendar,
              iconBg: "bg-amber-500/20",
              iconColor: "text-amber-400",
              hoverBorder: "hover:border-amber-500/40",
              actionColor: "text-amber-400",
              title: "Soundstage Reservations",
              desc: "Real-time soundstage allocation grid with LED volume, Unreal LiveLink, and Dolby Atmos configuration status.",
              tag: "Studio Ops",
              tagColor: "text-amber-300 bg-amber-500/10 border-amber-500/20",
            },
            {
              href: "/enterprise/portal/telemetry",
              icon: Radio,
              iconBg: "bg-emerald-500/20",
              iconColor: "text-emerald-400",
              hoverBorder: "hover:border-emerald-500/40",
              actionColor: "text-emerald-400",
              title: "Live Telemetry Bus",
              desc: "Sovereign relay bus events — SMPTE 2110 IP ingest, sync pulses, and broadcast infrastructure health checks.",
              tag: "10s Refresh",
              tagColor: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
            },
          ].map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={`p-6 rounded-3xl bg-slate-900/60 border border-white/10 ${m.hoverBorder} transition-all group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`size-10 rounded-2xl ${m.iconBg} ${m.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <m.icon size={20} />
                  </div>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${m.tagColor}`}>
                    {m.tag}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{m.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
              </div>
              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-end">
                <span className={`text-xs font-bold ${m.actionColor} flex items-center gap-1 group-hover:gap-2 transition-all`}>
                  Open Module <ArrowRight size={13} className="rtl:rotate-180" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
