import { INQUIRY_TYPES } from "../data";

interface ContactInquirySelectorProps {
  selected: string;
  onChange: (value: string) => void;
}

export function ContactInquirySelector({
  selected,
  onChange,
}: ContactInquirySelectorProps) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider font-semibold text-text-secondary mb-3">
        Inquiry Type
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {INQUIRY_TYPES.map((t) => (
          <label
            key={t.id}
            className="flex items-center gap-2.5 p-3 min-h-[44px] rounded-2xl border border-white/10 hover:border-brand-purple/40 cursor-pointer text-sm text-text-secondary hover:text-white transition-all bg-white/5 select-none"
          >
            <input
              type="radio"
              name="inquiryType"
              value={t.id}
              checked={selected === t.id}
              onChange={(e) => onChange(e.target.value)}
              className="accent-brand-purple shrink-0 size-4"
            />
            <span className="shrink-0">{t.icon}</span>
            <span className="text-xs font-medium">{t.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
