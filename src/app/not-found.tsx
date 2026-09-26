import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 w-full py-20 flex items-center justify-center px-4 relative overflow-hidden bg-background">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-purple/15 rounded-full blur-3xl pointer-events-none" />

      <div className="rounded-3xl border border-brand-purple/30 bg-white/[0.03] backdrop-blur-xl p-10 max-w-md w-full text-center relative z-10 shadow-2xl">
        <div className="text-6xl font-black bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-cyan bg-clip-text text-transparent mb-4 font-display">
          404
        </div>
        <h1 className="text-2xl font-bold text-white mb-2 font-display">
          Page Not Found
        </h1>
        <p className="text-text-secondary text-sm mb-8 leading-relaxed">
          The production or studio page you are looking for does not exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-semibold text-white transition-all text-sm bg-gradient-to-r from-brand-purple to-brand-purple-light hover:opacity-90 shadow-lg shadow-brand-purple/20"
        >
          <ArrowLeft size={16} /> Return to Homepage
        </Link>
      </div>
    </div>
  );
}
