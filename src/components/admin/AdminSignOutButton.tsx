"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

interface AdminSignOutButtonProps {
  className?: string;
}

export function AdminSignOutButton({ className = "" }: AdminSignOutButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await signOut();
        } catch {
          // ignore network signout failure
        }
        router.push("/login");
        router.refresh();
      }}
      className={`flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer ${className}`}
      title="Terminate admin session"
      aria-label="Sign out of Admin CMS"
    >
      <LogOut size={13} className="shrink-0" />
      <span>Sign Out</span>
    </button>
  );
}
