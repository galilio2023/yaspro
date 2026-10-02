import { CheckCircle } from "lucide-react";

interface ContactSuccessProps {
  onReset: () => void;
}

export function ContactSuccess({ onReset }: ContactSuccessProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-10 text-center shadow-2xl">
      <CheckCircle className="mx-auto text-emerald-400 mb-4" size={54} />
      <h3 className="text-xl font-bold text-white mb-2 font-display">
        Message Received!
      </h3>
      <p className="text-text-secondary text-sm mb-6 max-w-sm mx-auto">
        Thank you for reaching out. Our production team will contact you within 24 hours.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="text-xs text-amber-400 hover:text-white hover:underline cursor-pointer"
      >
        Send another inquiry
      </button>
    </div>
  );
}
