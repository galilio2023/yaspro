"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { LogOut, ArrowUpRight, User } from "lucide-react";

interface PortalSidebarClientProps {
  userName: string;
  userEmail: string;
  accentColor: "purple" | "emerald" | "amber";
}

export function PortalSidebarClient({ userName, userEmail, accentColor }: PortalSidebarClientProps) {
  const router = useRouter();

  const accentClass = accentColor === "emerald"
    ? "text-emerald-400"
    : "text-amber-400";

  const linkAccent = accentColor === "emerald"
    ? "text-emerald-400 hover:text-emerald-300"
    : "text-amber-400 hover:text-amber-300";

  return (
    <div className="pt-6 border-t border-white/10 mt-6">
      <div className="flex items-center gap-2 mb-3 min-w-0">
        <div className={`p-1.5 rounded-lg bg-white/5 shrink-0 ${accentClass}`}>
          <User size={14} />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-200 truncate" title={userName}>
            {userName}
          </div>
          <div className="text-[10px] text-slate-500 truncate" title={userEmail}>
            {userEmail}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={async () => {
            await signOut();
            router.push("/login");
            router.refresh();
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
        >
          <LogOut size={13} className="shrink-0" />
          Sign Out
        </button>

        <Link
          href="/"
          target="_blank"
          className={`flex items-center gap-1 text-xs shrink-0 transition-colors ${linkAccent}`}
        >
          Public Site <ArrowUpRight size={12} className="rtl:scale-x-[-1]" />
        </Link>
      </div>
    </div>
  );
}
