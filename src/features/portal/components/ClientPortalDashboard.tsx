"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import {
  Calendar,
  Camera,
  FileSpreadsheet,
  LogOut,
  Building,
  Mail,
  Phone,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/ui/container";

interface ClientPortalDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string | null;
    company?: string | null;
    phone?: string | null;
  };
}

export function ClientPortalDashboard({ user }: ClientPortalDashboardProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen py-12 md:py-20 w-full">
      <Container className="max-w-6xl space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-slate-900 border border-purple-500/20 backdrop-blur-xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
              <ShieldCheck size={14} /> Production Client Account
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              Welcome, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Track your studio booking sessions, equipment rentals, watermarked 4K dailies, and billing history.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/studio-booking"
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-colors"
            >
              <Sparkles size={14} /> Book New Session
            </Link>
            <button
              onClick={async () => {
                await signOut();
                router.push("/login");
                router.refresh();
              }}
              className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-rose-500/40 hover:bg-rose-500/10 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        {/* Client Metadata Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Building size={18} />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-medium">Company Account</div>
              <div className="text-xs font-bold text-white">{user.company || "Independent Creator / Agency"}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Mail size={18} />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-medium">Verified Email</div>
              <div className="text-xs font-bold text-white">{user.email}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Phone size={18} />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-medium">Production Hotline</div>
              <div className="text-xs font-bold text-white">{user.phone || "+971 (0) 4 123 4567"}</div>
            </div>
          </div>
        </div>

        {/* Portal Shortcuts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Dailies & Deliverables */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 flex flex-col justify-between hover:border-purple-500/40 transition-colors">
            <div>
              <div className="size-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <Camera size={20} />
              </div>
              <h2 className="text-base font-bold text-white font-display">4K Dailies & Video Review</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Stream rough cuts, color-graded sequences, and timecoded reviews directly from our Dubai cloud ingest storage.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-500">0 Active Screening Rooms</span>
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                Enter Screening Room <ArrowRight size={14} className="rtl:rotate-180" />
              </span>
            </div>
          </div>

          {/* Card 2: Soundstage Schedule */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 flex flex-col justify-between hover:border-purple-500/40 transition-colors">
            <div>
              <div className="size-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                <Calendar size={20} />
              </div>
              <h2 className="text-base font-bold text-white font-display">Studio Calendar & Call Sheets</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                View booked studio dates, crew call sheets, lighting setup diagrams, and OB-VAN dispatch timelines.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-500">Dubai Hub Stage A</span>
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                Check Stage Availability <ArrowRight size={14} className="rtl:rotate-180" />
              </span>
            </div>
          </div>

          {/* Card 3: Rental Invoices & Billing */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 flex flex-col justify-between hover:border-purple-500/40 transition-colors">
            <div>
              <div className="size-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <FileSpreadsheet size={20} />
              </div>
              <h2 className="text-base font-bold text-white font-display">Equipment Leases & Invoices</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Download verified VAT tax invoices (UAE FTA compliant), camera rental bonds, and contract master agreements.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-500">0 Invoices Pending</span>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                Browse Inventory <ArrowRight size={14} className="rtl:rotate-180" />
              </span>
            </div>
          </div>
        </div>

        {/* Live Status Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/20 via-slate-900 to-slate-900 border border-purple-500/20">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock size={16} className="text-purple-400" /> Active Production Sessions
            </h3>
            <span className="text-[11px] text-slate-400">Auto-synced with Neon DB</span>
          </div>

          <div className="py-8 text-center text-xs text-slate-400">
            No active shoot in progress right now. Ready for your next commercial, podcast, or film?
            <div className="mt-3">
              <Link
                href="/studio-booking"
                className="text-purple-400 hover:text-purple-300 font-semibold underline"
              >
                Schedule your next shoot now &rarr;
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
