import React from "react";
import Link from "next/link";
import {
  Headphones, MessageSquare, Mail, Phone,
  ArrowRight, ExternalLink,
} from "lucide-react";

export const metadata = { title: "Concierge Support | Client Portal" };

export default function SupportPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Concierge Support</h1>
        <p className="text-sm text-slate-400 mt-1">Priority production support for Yas Pro clients.</p>
      </div>

      {/* WhatsApp CTA */}
      <a
        href="https://wa.me/971554010465"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 p-6 rounded-3xl bg-emerald-900/20 border border-emerald-500/30 hover:border-emerald-400/50 hover:bg-emerald-900/30 transition-all group"
      >
        <div className="size-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/30 transition-colors">
          <Phone size={22} />
        </div>
        <div>
          <div className="text-sm font-bold text-white mb-0.5">WhatsApp Production Hotline</div>
          <div className="text-xs text-slate-400">+971 55 401 0465 — Fastest response, 7 days a week</div>
        </div>
        <ExternalLink size={16} className="ml-auto text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
      </a>

      {/* Email */}
      <a
        href="mailto:production@yaspromotions.com"
        className="flex items-center gap-4 p-6 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-purple-500/30 hover:bg-purple-900/10 transition-all group"
      >
        <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 transition-colors">
          <Mail size={22} />
        </div>
        <div>
          <div className="text-sm font-bold text-white mb-0.5">Email Production Team</div>
          <div className="text-xs text-slate-400">production@yaspromotions.com — Response within 4 hours</div>
        </div>
        <ExternalLink size={16} className="ml-auto text-slate-500 group-hover:text-purple-400 transition-colors shrink-0" />
      </a>

      {/* Hotline card */}
      <div className="flex items-center gap-4 p-6 rounded-3xl bg-slate-900/60 border border-white/10">
        <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
          <Headphones size={22} />
        </div>
        <div>
          <div className="text-sm font-bold text-white mb-0.5">Studio Concierge Hotline</div>
          <div className="text-xs text-slate-400" dir="ltr">+971 55 401 0465 — Available during studio hours</div>
        </div>
      </div>

      {/* Formal inquiry link */}
      <div className="flex items-center gap-3 p-5 rounded-2xl bg-white/[0.02] border border-white/10">
        <MessageSquare size={16} className="text-slate-400 shrink-0" />
        <p className="text-xs text-slate-400">
          For formal project inquiries, detailed proposals, or enterprise partnership discussions, use the{" "}
          <Link href="/contact" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
            official contact form
          </Link>.
        </p>
        <Link href="/contact" className="ml-auto flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors shrink-0">
          Open <ArrowRight size={12} className="rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}
