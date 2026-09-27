"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
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

export default function ClientPortalDashboard() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?callbackUrl=/portal");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;

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
              }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Client Profile Details Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Mail size={14} className="text-purple-400" /> Account Email
            </span>
            <span className="font-semibold text-white text-sm">{user.email}</span>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Building size={14} className="text-blue-400" /> Company / Production
            </span>
            <span className="font-semibold text-white text-sm">
              {(user as { company?: string }).company || "Independent Producer"}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Phone size={14} className="text-emerald-400" /> Direct Phone
            </span>
            <span className="font-semibold text-white text-sm">
              {(user as { phone?: string }).phone || "+971 Verified"}
            </span>
          </div>
        </div>

        {/* Fast Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/enterprise/portal"
            className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border border-purple-500/20 hover:scale-[1.02] transition-all block group"
          >
            <div className="size-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-4">
              <Camera size={20} />
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
              Review 4K Dailies & Footage
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Watch watermarked rushes, approve raw takes, and inspect camera telemetry in the client screening room.
            </p>
            <span className="text-xs font-semibold text-purple-400 flex items-center gap-1">
              Enter Screening Room <ArrowRight size={14} />
            </span>
          </Link>

          <Link
            href="/studio-booking"
            className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 hover:scale-[1.02] transition-all block group"
          >
            <div className="size-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-4">
              <Calendar size={20} />
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
              Reserve Studio Stages
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Instant booking with pre-filled company info for Studio A (Main Stage), Studio B (Podcast), or Cyc stage.
            </p>
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
              Check Stage Availability <ArrowRight size={14} />
            </span>
          </Link>

          <Link
            href="/shop"
            className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 hover:scale-[1.02] transition-all block group"
          >
            <div className="size-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-4">
              <FileSpreadsheet size={20} />
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
              Cinema Gear Rental
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Rent ARRI Mini LF, RED V-Raptor XL, wireless video systems, and custom production packages across Dubai.
            </p>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              Browse Inventory <ArrowRight size={14} />
            </span>
          </Link>
        </div>

        {/* Live Reservation Pipeline */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
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
