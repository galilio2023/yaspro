"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
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
  Sparkles,
  Headphones,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Pencil,
  Save,
  X as XIcon,
  Loader2,
} from "lucide-react";
import { syncUserProfile } from "@/lib/actions";
import { Container } from "@/components/ui/container";
import type { Booking } from "@/db/schema";

interface ClientPortalDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string | null;
    company?: string | null;
    phone?: string | null;
  };
  bookings: Booking[];
}

const STATUS_CONFIG = {
  pending: { label: "Pending Confirmation", icon: Clock, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-slate-400 bg-slate-500/10 border-slate-500/30" },
} as const;

function formatSessionType(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ClientPortalDashboard({ user, bookings }: ClientPortalDashboardProps) {
  const router = useRouter();
  const t = useTranslations("portal");

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editPhone, setEditPhone] = useState(user.phone || "");
  const [editCompany, setEditCompany] = useState(user.company || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileFeedback(null);
    const res = await syncUserProfile({
      email: user.email,
      phone: editPhone.trim() || undefined,
      company: editCompany.trim() || undefined,
    });
    if (res.success) {
      setProfileFeedback("Profile updated successfully.");
      setIsEditingProfile(false);
    } else {
      setProfileFeedback(res.message || "Failed to save profile.");
    }
    setIsSavingProfile(false);
    setTimeout(() => setProfileFeedback(null), 4000);
  };

  const upcomingBookings = bookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed"
  );
  const pastBookings = bookings.filter(
    (b) => b.status === "completed" || b.status === "cancelled"
  );

  return (
    <div className="min-h-screen py-12 md:py-20 w-full">
      <Container className="max-w-6xl space-y-8">

        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-slate-900 border border-purple-500/20 backdrop-blur-xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
              <ShieldCheck size={14} /> {t("accountBadge")}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              {t("welcome", { name: user.name })}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Link
              href="/studio-booking"
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <Sparkles size={14} /> {t("bookSession")}
            </Link>
            {isEditingProfile ? (
              <>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isSavingProfile ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setEditPhone(user.phone || "");
                    setEditCompany(user.company || "");
                    setProfileFeedback(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-rose-500/40 hover:bg-rose-500/10 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <XIcon size={14} /> Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-purple-500/40 hover:bg-purple-500/10 text-slate-300 hover:text-purple-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Pencil size={14} /> Edit Profile
              </button>
            )}
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.push("/login");
                router.refresh();
              }}
              className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-rose-500/40 hover:bg-rose-500/10 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogOut size={14} className="rtl:rotate-180" /> {t("signOut")}
            </button>
          </div>
        </div>

        {/* Client Metadata Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
              <Building size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-slate-400 uppercase font-medium">{t("companyAccount")}</div>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  placeholder={t("independent")}
                  className="w-full text-xs font-bold text-white bg-white/5 border border-purple-500/40 rounded-lg px-2 py-1 mt-0.5 outline-none focus:border-purple-400/70 placeholder:text-slate-500"
                />
              ) : (
                <div className="text-xs font-bold text-white truncate">{user.company || t("independent")}</div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
              <Mail size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-400 uppercase font-medium">{t("verifiedEmail")}</div>
              <div className="text-xs font-bold text-white truncate">{user.email}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Phone size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-slate-400 uppercase font-medium">{t("contactPhone")}</div>
              {isEditingProfile ? (
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder={t("notProvided")}
                  dir="ltr"
                  className="w-full text-xs font-bold text-white bg-white/5 border border-emerald-500/40 rounded-lg px-2 py-1 mt-0.5 outline-none focus:border-emerald-400/70 placeholder:text-slate-500"
                />
              ) : (
                <div className="text-xs font-bold text-white truncate" dir="ltr">
                  {user.phone || t("notProvided")}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <Headphones size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-400 uppercase font-medium">{t("hotline")}</div>
              <div className="text-xs font-bold text-white truncate" dir="ltr">
                +971 55 401 0465
              </div>
            </div>
          </div>
        </div>

        {/* Profile feedback banner */}
        {profileFeedback && (
          <div className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
            profileFeedback.includes("successfully")
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}>
            {profileFeedback.includes("successfully") ? (
              <CheckCircle2 size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            {profileFeedback}
          </div>
        )}

        {/* Portal Shortcuts Grid — all cards are real links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Dailies & Deliverables → Enterprise Portal */}
          <Link
            href="/enterprise/portal"
            className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 flex flex-col justify-between hover:border-purple-500/40 transition-colors group"
          >
            <div>
              <div className="size-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                <Camera size={20} />
              </div>
              <h2 className="text-base font-bold text-white font-display">{t("cards.dailies.title")}</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {t("cards.dailies.description")}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-500">{t("cards.dailies.status")}</span>
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                {t("cards.dailies.action")} <ArrowRight size={14} className="rtl:rotate-180" />
              </span>
            </div>
          </Link>

          {/* Card 2: Soundstage Schedule → Studio Booking */}
          <Link
            href="/studio-booking"
            className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 flex flex-col justify-between hover:border-cyan-500/40 transition-colors group"
          >
            <div>
              <div className="size-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:bg-cyan-500/30 transition-colors">
                <Calendar size={20} />
              </div>
              <h2 className="text-base font-bold text-white font-display">{t("cards.schedule.title")}</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {t("cards.schedule.description")}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-500">{t("cards.schedule.status")}</span>
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                {t("cards.schedule.action")} <ArrowRight size={14} className="rtl:rotate-180" />
              </span>
            </div>
          </Link>

          {/* Card 3: Billing & Invoices → Contact for invoices */}
          <Link
            href="/contact"
            className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 flex flex-col justify-between hover:border-amber-500/40 transition-colors group"
          >
            <div>
              <div className="size-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:bg-amber-500/30 transition-colors">
                <FileSpreadsheet size={20} />
              </div>
              <h2 className="text-base font-bold text-white font-display">{t("cards.billing.title")}</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {t("cards.billing.description")}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-500">{t("cards.billing.status")}</span>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                {t("cards.billing.action")} <ArrowRight size={14} className="rtl:rotate-180" />
              </span>
            </div>
          </Link>
        </div>

        {/* My Bookings — Real data from DB */}
        <div className="rounded-3xl bg-gradient-to-r from-purple-900/20 via-slate-900 to-slate-900 border border-purple-500/20 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar size={16} className="text-purple-400" />
              {t("sessions.title")}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400">{t("sessions.sync")}</span>
              {bookings.length > 0 && (
                <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  {bookings.length} total
                </span>
              )}
            </div>
          </div>

          {upcomingBookings.length === 0 && pastBookings.length === 0 ? (
            <div className="py-12 text-center px-6">
              <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={20} className="text-slate-500" />
              </div>
              <p className="text-xs text-slate-400 mb-3">{t("sessions.empty")}</p>
              <Link
                href="/studio-booking"
                className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                {t("sessions.scheduleCta")} <ArrowRight size={12} className="rtl:rotate-180" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {/* Upcoming */}
              {upcomingBookings.length > 0 && (
                <div>
                  <div className="px-6 py-3 bg-white/[0.02]">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Upcoming</span>
                  </div>
                  {upcomingBookings.map((b) => {
                    const cfg = STATUS_CONFIG[b.status];
                    const StatusIcon = cfg.icon;
                    return (
                      <div key={b.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white">{formatSessionType(b.sessionType)}</span>
                            <span className="text-[10px] font-mono text-slate-500">#{b.referenceCode}</span>
                          </div>
                          <div className="text-[11px] text-slate-400" dir="ltr">{formatDate(b.scheduledAt)}</div>
                          <div className="text-[11px] text-slate-500">{b.durationHours}h · {b.headcount} person{b.headcount !== 1 ? "s" : ""}</div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-bold text-white" dir="ltr">
                            {Number(b.totalAmount).toLocaleString()} {b.currency}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border ${cfg.color}`}>
                            <StatusIcon size={10} />
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Past */}
              {pastBookings.length > 0 && (
                <div>
                  <div className="px-6 py-3 bg-white/[0.02]">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">History</span>
                  </div>
                  {pastBookings.slice(0, 5).map((b) => {
                    const cfg = STATUS_CONFIG[b.status];
                    const StatusIcon = cfg.icon;
                    return (
                      <div key={b.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 opacity-70 hover:opacity-100 transition-opacity">
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-slate-300">{formatSessionType(b.sessionType)}</span>
                            <span className="text-[10px] font-mono text-slate-500">#{b.referenceCode}</span>
                          </div>
                          <div className="text-[11px] text-slate-500" dir="ltr">{formatDate(b.scheduledAt)}</div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-semibold text-slate-400" dir="ltr">
                            {Number(b.totalAmount).toLocaleString()} {b.currency}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border ${cfg.color}`}>
                            <StatusIcon size={10} />
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

      </Container>
    </div>
  );
}
