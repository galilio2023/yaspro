"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical root-level error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 font-sans antialiased">
        <div className="max-w-md w-full p-8 rounded-2xl bg-card border border-red-500/30 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} />
          </div>
          <h1 className="text-xl font-bold mb-2">Critical Application Error</h1>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            A fatal error occurred that disrupted the root application shell. Please refresh or try again.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 transition-all text-xs cursor-pointer"
            >
              <RotateCcw size={14} /> Try Again
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") window.location.reload();
              }}
              className="flex-1 inline-flex items-center justify-center py-3 px-4 rounded-xl font-semibold text-white text-xs cursor-pointer"
              style={{
                background: "linear-gradient(90deg, var(--brand-purple) 0%, var(--brand-purple-light) 100%)",
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
