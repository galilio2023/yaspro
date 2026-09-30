"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { IyasProIcon } from "@/components/ui/IyasProIcon";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("auth.login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await signIn.email({
        email,
        password,
      });

      if (res.error) {
        setErrorMsg(res.error.message || "Failed to sign in. Please check credentials.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setErrorMsg((err as Error).message || "An unexpected authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 py-12 sm:py-16">
      {/* Glow Backdrops */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-brand-purple/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-auto p-6 sm:p-10 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mx-auto mb-4">
            <IyasProIcon size={44} idPrefix="login-candle" className="filter drop-shadow-[0_2px_12px_rgba(245,158,11,0.45)]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t("subtitle")}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-medium text-xs sm:text-sm">{t("passwordLabel")}</label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder={t("passwordPlaceholder")}
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
          <span>{t("noAccount")}{" "}</span>
          <Link href="/register" className="text-purple-400 hover:text-purple-300 font-semibold inline-block py-1">
            {t("registerLink")}
          </Link>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-purple-950/20 border border-purple-800/20 text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck size={14} className="text-purple-400 shrink-0" />
          <span>{t("securityBadge")}</span>
        </div>
      </div>
    </div>
  );
}
