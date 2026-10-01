"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp, signIn } from "@/lib/auth-client";
import { syncUserProfile } from "@/lib/actions";
import { registerUserSchema } from "@/lib/validations";
import { User, Mail, Lock, Building, Phone, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations("auth.register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<"creator" | "enterprise">("creator");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [claimNotice, setClaimNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setClaimNotice(false);

    // 1. Validate complete registration payload with registerUserSchema
    const parseResult = registerUserSchema.safeParse({
      name,
      email,
      password,
      phone,
      accountType,
      company: company || undefined,
    });

    if (!parseResult.success) {
      setErrorMsg(parseResult.error.issues[0]?.message || "Please verify your registration information.");
      return;
    }

    const validData = parseResult.data;
    const targetRole = validData.accountType === "enterprise" ? "enterprise" : "client";
    setIsLoading(true);

    try {
      const res = await signUp.email({
        email: validData.email,
        password: validData.password,
        name: validData.name,
      });

      if (res.error) {
        // Existing guest profiles can only be claimed with verified email ownership.
        const isExistingUser =
          res.error.message?.toLowerCase().includes("exist") ||
          res.error.code === "USER_ALREADY_EXISTS";

        if (isExistingUser) {
          setClaimNotice(true);
        } else {
          setErrorMsg(res.error.message || "Failed to create account.");
        }
      } else {
        // Establish the authenticated session before synchronizing profile fields.
        const signInRes = await signIn.email({
          email: validData.email,
          password: validData.password,
        });
        if (signInRes.error) {
          setErrorMsg(signInRes.error.message || "Account created, but sign-in failed. Please try signing in.");
          return;
        }
        const syncRes = await syncUserProfile({
          email: validData.email,
          name: validData.name,
          phone: validData.phone,
          company: validData.company || "",
          role: targetRole,
        });

        if (!syncRes.success) {
          setErrorMsg(syncRes.message || "Account created, but profile setup could not be completed. Please try signing in.");
          return;
        }

        if (targetRole === "enterprise") {
          router.push("/enterprise/portal");
        } else {
          router.push("/portal");
        }
        router.refresh();
      }
    } catch (err) {
      setErrorMsg((err as Error).message || "An unexpected registration error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-12 sm:py-16">
      {/* Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[450px] bg-brand-purple/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg mx-auto p-6 sm:p-10 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mx-auto mb-5">
            <BrandLogo size="large" href="/" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t("subtitle")}
          </p>
        </div>

        {claimNotice && (
          <div role="status" className="mb-6 p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs">
            {t("claimBookingsNotice")}
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Account Type Selector Tabs */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5 text-xs sm:text-sm">
              {t("accountTypeLabel")}
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/[0.03] border border-white/10">
              <button
                type="button"
                onClick={() => setAccountType("creator")}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  accountType === "creator"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <User size={14} />
                <span>{t("accountTypeCreator")}</span>
              </button>

              <button
                type="button"
                onClick={() => setAccountType("enterprise")}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  accountType === "enterprise"
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Building size={14} />
                <span>{t("accountTypeEnterprise")}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5 text-xs sm:text-sm">{t("fullNameLabel")}</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={t("fullNamePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full ps-10 pe-4 py-3 min-h-[44px] rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors text-base sm:text-sm"
                />
                <User size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5 text-xs sm:text-sm">
                {t("companyLabel")}{" "}
                {accountType === "enterprise" ? (
                  <span className="text-amber-400">*</span>
                ) : (
                  <span className="text-slate-500 text-[10px] font-normal">({t("companyLabel") ? "Optional" : ""})</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required={accountType === "enterprise"}
                  placeholder={t("companyPlaceholder")}
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className={`w-full ps-10 pe-4 py-3 min-h-[44px] rounded-xl bg-white/[0.04] border text-white placeholder:text-slate-500 focus:outline-none transition-colors text-base sm:text-sm ${
                    accountType === "enterprise"
                      ? "border-amber-500/40 focus:border-amber-400"
                      : "border-white/10 focus:border-purple-500"
                  }`}
                />
                <Building size={16} className={`absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  accountType === "enterprise" ? "text-amber-400" : "text-slate-400"
                }`} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5 text-xs sm:text-sm">{t("emailLabel")}</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full ps-10 pe-4 py-3 min-h-[44px] rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors text-base sm:text-sm"
                />
                <Mail size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5 text-xs sm:text-sm">{t("phoneLabel")}</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder={t("phonePlaceholder")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full ps-10 pe-4 py-3 min-h-[44px] rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors text-base sm:text-sm"
                />
                <Phone size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5 text-xs sm:text-sm">{t("passwordLabel")}</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder={t("passwordPlaceholder")}
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full ps-10 pe-4 py-3 min-h-[44px] rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors text-base sm:text-sm"
              />
              <Lock size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[44px] py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:opacity-95 text-white font-semibold text-sm tracking-wide shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-6"
          >
            {isLoading ? t("submittingBtn") : t("submitBtn")}
            <ArrowRight size={14} className="rtl:rotate-180" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-slate-400">
          <span>{t("hasAccount")}{" "}</span>
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold inline-block py-1">
            {t("loginLink")}
          </Link>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-purple-950/20 border border-purple-800/20 text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
          <span>{t("securityBadge")}</span>
        </div>
      </div>
    </div>
  );
}
