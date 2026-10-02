import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 w-full py-20 flex items-center justify-center px-4 relative overflow-hidden bg-background">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="rounded-3xl border border-white/10 bg-[#0f0e15] backdrop-blur-xl p-10 max-w-md w-full text-center relative z-10 shadow-2xl">
        <div className="text-6xl font-black gradient-text-gold mb-4 font-display">
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
          className="btn-brand inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-bold text-sm"
        >
          <ArrowLeft size={16} className="rtl:rotate-180" /> Return to Homepage
        </Link>
      </div>
    </div>
  );
}
