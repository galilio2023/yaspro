"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import {
  CalendarCheck,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Save,
  X as XIcon,
  Loader2,
  Video,
  Camera,
} from "lucide-react";
import { syncUserProfile } from "@/lib/actions";
import { Container } from "@/components/ui/container";
import { ClientBookingCard } from "./ClientBookingCard";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { Booking } from "@/db/schema";
import { cn } from "@/lib/utils";

interface AccountDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string | null;
    company?: string | null;
    phone?: string | null;
  };
  bookings: Booking[];
  initialTab?: "bookings" | "profile";
}

/**
 * Renders the user's bookings and editable profile.
 * Manual tab selection takes precedence until the URL's tab query changes;
 * then the query selects a valid tab, falling back to initialTab otherwise.
 */
export function AccountDashboard({
  user,
  bookings,
  initialTab = "bookings",
}: AccountDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, isArabic, dir } = useLanguage();

  const tabQuery = searchParams.get("tab");
  const [userSelectedTab, setUserSelectedTab] = useState<"bookings" | "profile" | null>(null);
  const [prevTabQuery, setPrevTabQuery] = useState(tabQuery);

  if (tabQuery !== prevTabQuery) {
    setPrevTabQuery(tabQuery);
    setUserSelectedTab(null);
  }

  const activeTab: "bookings" | "profile" =
    userSelectedTab ??
    (tabQuery === "profile" ? "profile" : tabQuery === "bookings" ? "bookings" : initialTab);

  // Profile Form State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [company, setCompany] = useState(user.company ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const role = user.role || "client";
  const firstName = user.name?.split(" ")[0] || "User";

  const handleSignOut = async () => {
    setSignOutError(null);
    setIsSigningOut(true);
    try {
      const res = await signOut();
      if (res?.error) {
        setSignOutError(t("portal.dashboard.signOutFailed"));
        setIsSigningOut(false);
        return;
      }
      router.push("/login");
      router.refresh();
    } catch {
      setSignOutError(t("portal.dashboard.signOutError"));
      setIsSigningOut(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    const res = await syncUserProfile({
      name,
      email: user.email,
      phone,
      company,
    });

    setIsSaving(false);
    if (res.success) {
      setFeedback({
        type: "success",
        msg: t("portal.dashboard.profileUpdated"),
      });
      setIsEditing(false);
      router.refresh();
    } else {
      setFeedback({
        type: "error",
        msg: res.message || t("portal.dashboard.profileUpdateFailed"),
      });
    }
  };

  return (
    <div dir={dir} className="w-full min-h-screen py-10 sm:py-16 text-start">
      <Container>
        {/* Header Banner */}
        <div className="relative rounded-3xl bg-slate-900/60 border border-white/10 p-6 sm:p-8 backdrop-blur-xl mb-8 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-mauve/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="size-16 sm:size-20 rounded-2xl bg-gradient-to-br from-brand-violet to-brand-purple flex items-center justify-center text-white text-2xl font-bold font-display shadow-lg shadow-purple-950/50">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-white font-display">
                    {user.name}
                  </h1>
                  <span
                    className={cn(
                      "text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border",
                      role === "admin"
                        ? "bg-brand-violet/25 text-brand-lavender border-brand-mauve/40"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    )}
                  >
                    {role}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-text-muted mt-0.5 flex items-center gap-1.5">
                  <Mail size={13} className="text-slate-400" />
                  <span>{user.email}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {role === "admin" && (
                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <LayoutDashboard size={14} />
                  <span>{t("portal.dashboard.adminPanel")}</span>
                </Link>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningOut ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <LogOut size={14} />
                )}
                <span>{t("portal.dashboard.signOut")}</span>
              </button>
            </div>
          </div>

          {signOutError && (
            <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 relative z-10">
              <AlertCircle size={15} className="shrink-0" />
              <span>{signOutError}</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-8">
          <button
            type="button"
            onClick={() => setUserSelectedTab("bookings")}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
              activeTab === "bookings"
                ? "bg-white/10 text-white border border-white/20 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <CalendarCheck size={15} />
            <span>{t("portal.dashboard.myBookingsTab")}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white">
              {bookings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setUserSelectedTab("profile")}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
              activeTab === "profile"
                ? "bg-white/10 text-white border border-white/20 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <UserIcon size={15} />
            <span>{t("portal.dashboard.accountDetailsTab")}</span>
          </button>
        </div>

        {/* Tab 1: My Bookings */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            {bookings.length === 0 ? (
              <div className="rounded-3xl bg-slate-900/40 border border-white/10 p-10 sm:p-16 text-center backdrop-blur-xl">
                <CalendarCheck size={48} className="mx-auto text-slate-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2 font-display">
                  {t("portal.dashboard.noBookingsTitle")}
                </h3>
                <p className="text-xs text-text-muted max-w-md mx-auto mb-6">
                  {t("portal.dashboard.noBookingsDesc")}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/studio-booking"
                    className="px-5 py-2.5 rounded-xl btn-brand text-xs font-bold transition-all inline-flex items-center gap-2"
                  >
                    <Video size={14} />
                    <span>{t("portal.dashboard.bookStudio")}</span>
                  </Link>
                  <Link
                    href="/shop"
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-all inline-flex items-center gap-2"
                  >
                    <Camera size={14} />
                    <span>{t("portal.dashboard.rentGear")}</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {bookings.map((booking) => (
                  <ClientBookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Profile & Details */}
        {activeTab === "profile" && (
          <div className="max-w-2xl">
            <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                <div>
                  <h2 className="text-base font-bold text-white font-display">
                    {t("portal.dashboard.accountContactTitle")}
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    {t("portal.dashboard.accountContactDesc")}
                  </p>
                </div>

                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Pencil size={13} />
                    <span>{t("portal.dashboard.edit")}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setName(user.name ?? "");
                      setPhone(user.phone ?? "");
                      setCompany(user.company ?? "");
                      setFeedback(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XIcon size={13} />
                    <span>{t("portal.dashboard.cancel")}</span>
                  </button>
                )}
              </div>

              {feedback && (
                <div
                  className={cn(
                    "p-3 rounded-2xl mb-6 text-xs flex items-center gap-2",
                    feedback.type === "success"
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                  )}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 size={15} className="shrink-0" />
                  ) : (
                    <AlertCircle size={15} className="shrink-0" />
                  )}
                  <span>{feedback.msg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t("portal.dashboard.fullName")}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing || isSaving}
                    required
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-purple-500 disabled:opacity-60 transition-all"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t("portal.dashboard.primaryEmail")}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-400 cursor-not-allowed opacity-75"
                    />
                    <Mail size={14} className="absolute end-3.5 top-3 text-slate-500 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-text-muted mt-1">
                    {t("portal.dashboard.emailChangeNotice")}
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t("portal.dashboard.phoneWhatsApp")}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!isEditing || isSaving}
                      placeholder="+971 50 123 4567"
                      className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-purple-500 disabled:opacity-60 transition-all"
                    />
                    <Phone size={14} className="absolute end-3.5 top-3 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                {/* Company / Agency */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t("portal.dashboard.companyAgency")}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      disabled={!isEditing || isSaving}
                      placeholder="e.g. Media Agency LLC"
                      className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-purple-500 disabled:opacity-60 transition-all"
                    />
                    <Building size={14} className="absolute end-3.5 top-3 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-xl btn-brand text-xs font-bold flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer shadow-lg"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>{t("portal.dashboard.saving")}</span>
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          <span>{t("portal.dashboard.saveChanges")}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
