"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { syncUserProfile } from "@/lib/actions";
import { registerUserSchema } from "@/lib/validations";
import { User, Mail, Lock, Building, Phone, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Validate complete registration payload with registerUserSchema
    const parseResult = registerUserSchema.safeParse({
      name,
      email,
      password,
      phone,
      company: company || undefined,
    });

    if (!parseResult.success) {
      setErrorMsg(parseResult.error.issues[0]?.message || "Please verify your registration information.");
      return;
    }

    const validData = parseResult.data;
    setIsLoading(true);

    try {
      const res = await signUp.email({
        email: validData.email,
        password: validData.password,
        name: validData.name,
        company: validData.company || "",
        phone: validData.phone,
      } as unknown as { email: string; password: string; name: string });

      if (res.error) {
        setErrorMsg(res.error.message || "Failed to create account.");
      } else {
        // Guarantee synchronization of additional profile fields into Neon PostgreSQL
        const syncRes = await syncUserProfile({
          email: validData.email,
          name: validData.name,
          phone: validData.phone,
          company: validData.company || "",
        });

        if (!syncRes.success) {
          setErrorMsg(syncRes.message || "Account created, but profile setup could not be completed. Please try signing in.");
          return;
        }

        router.push("/portal");
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
          <div className="size-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-white text-lg shadow-xl shadow-purple-500/25 mx-auto mb-4">
            Y
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Create Production Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access enterprise dailies, reserve studios, and manage rental gear with Yas Pro.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5 text-xs sm:text-sm">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mansoor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 min-h-[44px] rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors text-base sm:text-sm"
                />
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5 text-xs sm:text-sm">Company / Agency</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Dubai Media Agency"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 min-h-[44px] rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors text-base sm:text-sm"
                />
                <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5 text-xs sm:text-sm">Work Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 min-h-[44px] rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors text-base sm:text-sm"
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5 text-xs sm:text-sm">Direct Phone</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+971 50 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 min-h-[44px] rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors text-base sm:text-sm"
                />
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5 text-xs sm:text-sm">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Minimum 8 characters"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 min-h-[44px] rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors text-base sm:text-sm"
              />
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[44px] py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:opacity-95 text-white font-semibold text-sm tracking-wide shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-6"
          >
            {isLoading ? "Creating account..." : "Complete Registration"}
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-slate-400">
          <span>Already registered with Yas Pro? </span>
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold inline-block py-1">
            Sign in
          </Link>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-purple-950/20 border border-purple-800/20 text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
          <span>Connected directly to Neon PostgreSQL database.</span>
        </div>
      </div>
    </div>
  );
}
