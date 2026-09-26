"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Runtime application error:", error);
  }, [error]);

  return (
    <div className="flex-1 w-full py-20 flex items-center justify-center px-4 relative overflow-hidden bg-background">
      <div className="rounded-3xl border border-red-500/30 bg-white/[0.03] backdrop-blur-xl p-10 max-w-md w-full text-center relative z-10 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 font-display">
          Something went wrong
        </h2>
        <p className="text-text-secondary text-sm mb-6 leading-relaxed">
          An unexpected error occurred during rendering. You can try refreshing the view.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 transition-all text-xs cursor-pointer"
          >
            <RotateCcw size={14} /> Try Again
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center py-3 rounded-xl font-semibold text-white text-xs bg-gradient-to-r from-brand-purple to-brand-purple-light hover:opacity-90 transition-opacity"
          >
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
