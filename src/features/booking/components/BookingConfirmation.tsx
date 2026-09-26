import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface BookingConfirmationProps {
  referenceCode: string;
  email: string;
}

export function BookingConfirmation({
  referenceCode,
  email,
}: BookingConfirmationProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-10 sm:p-14 text-center max-w-xl mx-auto shadow-2xl">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <CheckCircle className="mx-auto text-green-400 mb-6" size={68} />
      </motion.div>
      <h2 className="text-3xl font-extrabold text-white mb-2 font-display">
        Booking Confirmed!
      </h2>
      <p className="text-text-secondary text-sm mb-6">
        Your studio session has been secured in our calendar.
      </p>
      <div className="rounded-2xl border border-brand-purple/40 bg-brand-purple/10 px-6 py-4 mb-6 inline-block">
        <p className="text-brand-purple-light font-mono font-extrabold text-xl tracking-wider">
          {referenceCode}
        </p>
        <p className="text-text-muted text-xs mt-1">
          Booking Confirmation Reference
        </p>
      </div>

      <div className="mb-6">
        <a
          href={`https://wa.me/971554010465?text=${encodeURIComponent(
            `Hello Yas Pro Coordinator, my booking reference code is ${referenceCode}. Email: ${email || "provided"}. I would like to confirm production crew arrival and equipment specifications.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-xl shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Chat with Studio Coordinator on WhatsApp</span>
        </a>
      </div>

      <p className="text-text-muted text-xs leading-relaxed">
        A confirmation with access details and calendar invite has been sent to{" "}
        <span className="text-white font-medium">{email || "your email"}</span>.
      </p>
    </div>
  );
}
