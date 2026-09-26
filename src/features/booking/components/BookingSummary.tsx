import { Calendar, Clock, Users, Camera, ShieldCheck, Box, Sparkles, CreditCard, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BookingState, SessionTypeItem, StudioItem } from "../types";
import { STUDIO_GEAR_PACKAGES } from "../constants";

interface BookingSummaryProps {
  state: BookingState;
  studio: StudioItem;
  sessionTypeObj?: SessionTypeItem;
  total: number;
}

export function BookingSummary({
  state,
  studio,
  sessionTypeObj,
  total,
}: BookingSummaryProps) {
  const selectedGear = STUDIO_GEAR_PACKAGES.find(
    (g) => g.id === state.selectedGearPackage
  );

  return (
    <aside
      aria-label="Session summary quote"
      className="lg:col-span-4 flex flex-col gap-5 lg:sticky lg:top-28"
    >
      <div className="rounded-3xl border border-brand-purple/20 bg-card/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-brand-purple/10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-brand-purple/15">
          <h4 className="text-text-primary font-bold text-sm uppercase tracking-wider font-display">
            Session Breakdown
          </h4>
          <Badge variant="live" className="text-[10px]">
            <Zap size={10} /> Live Quote
          </Badge>
        </div>

        {/* Studio */}
        <div className="mb-5 pb-5 border-b border-brand-purple/10 rounded-xl bg-brand-purple/5 p-3.5 -mx-1">
          <span className="text-[10px] text-text-ghost uppercase tracking-widest font-mono block mb-1">
            Reserved Stage
          </span>
          <p className="text-base font-bold text-text-primary font-display">
            {studio.name}
          </p>
          <div className="flex items-center justify-between text-xs text-brand-purple-mid font-semibold mt-1.5">
            <span>{formatCurrency(studio.rate)} / hour</span>
            <span className="font-mono text-text-primary">
              {formatCurrency(studio.rate * state.durationHours)}
            </span>
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-3 mb-5 pb-5 border-b border-brand-purple/10 text-xs">
          {[
            { icon: Calendar, label: "Date",     value: state.date || "Not selected yet",      color: "text-brand-purple-mid" },
            { icon: Clock,    label: "Duration",  value: `${state.durationHours} Hours`,        color: "text-brand-purple-mid" },
            { icon: Users,    label: "Cast & Crew",value: `${state.headcount} People`,           color: "text-brand-teal" },
            { icon: Camera,   label: "Type",      value: sessionTypeObj?.label || "—",           color: "text-brand-teal" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <Icon size={13} className={color} /> {label}:
              </span>
              <span className="text-text-primary font-semibold capitalize">{value}</span>
            </div>
          ))}

          {selectedGear && selectedGear.id !== "none" && (
            <div className="flex justify-between items-center pt-1 border-t border-white/5">
              <span className="flex items-center gap-1.5 text-text-secondary truncate pr-2">
                <Box size={13} className="text-brand-teal shrink-0" />
                <span className="truncate text-text-primary font-medium">{selectedGear.name}</span>
              </span>
              <span className="text-brand-teal font-bold shrink-0">+{formatCurrency(selectedGear.rate)}</span>
            </div>
          )}

          {state.needsCrew && (
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Dedicated Studio Crew:</span>
              <span className="text-green-400 font-bold">+500 AED</span>
            </div>
          )}

          {state.needsAiAutoCut && (
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <Sparkles size={12} className="text-brand-purple-mid" />
                <span>AI Auto-Cut &amp; Subtitles:</span>
              </span>
              <span className="text-brand-purple-mid font-bold">+450 AED</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="text-xs text-text-muted block">Estimated Total</span>
            <span className="text-[10px] text-text-ghost">Inclusive of 5% UAE VAT</span>
          </div>
          <div className="text-right">
            <span
              className="text-3xl font-extrabold font-display"
              style={{
                background: "linear-gradient(135deg,#7c3aed,#c4b5fd,#06b6d4)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* WhatsApp Fast Dispatch CTA */}
        <a
          href={`https://wa.me/971554010465?text=${encodeURIComponent(
            `Hello Yas Pro Dubai Studio Team,\n\nI am requesting a studio booking hold:\n• Studio: ${studio.name}\n• Date: ${state.date || "To be confirmed"}\n• Duration: ${state.durationHours} Hours\n• Type: ${sessionTypeObj?.label || "Production"}\n• Estimated Total: ${formatCurrency(total)}\n\nPlease confirm availability and lock the calendar hold for us.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full mb-4 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          Instant WhatsApp Booking Hold
        </a>

        {/* Payment Methods */}
        <div className="rounded-2xl border border-brand-purple/15 bg-brand-purple/5 p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-text-primary font-semibold text-[11px] pb-2 border-b border-brand-purple/10">
            <span className="flex items-center gap-1.5">
              <CreditCard size={13} className="text-brand-purple-mid" />
              <span>Accepted Payment Methods</span>
            </span>
            <span className="text-green-400 text-[10px] flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-green-400 inline-block" /> Instant Hold
            </span>
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            <strong className="text-text-primary">Apple Pay</strong>,{" "}
            <strong className="text-text-primary">Ziina</strong>, Visa / Mastercard,
            or Corporate PO for UAE government and broadcast entities.
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-text-ghost pt-0.5">
            <ShieldCheck size={12} className="text-green-400 shrink-0" />
            <span>Free cancellation up to 48 hours prior to session.</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
