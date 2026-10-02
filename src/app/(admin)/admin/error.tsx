"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, LayoutDashboard } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin CMS Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-2xl bg-zinc-900 border border-amber-500/30 text-center shadow-2xl backdrop-blur-xl">
        <div className="size-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">CMS Operation Error</h2>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          An error occurred while loading this CMS panel. You can try reloading the data or returning to the overview.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw size={14} /> Retry Query
          </button>
          <Link
            href="/admin"
            className="flex-1 py-2.5 px-3 rounded-xl btn-brand text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LayoutDashboard size={14} /> Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
