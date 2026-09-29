import { INQUIRY_TYPES } from "../data";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface ContactInquirySelectorProps {
  selected: string;
  onChange: (value: string) => void;
}

export function ContactInquirySelector({
  selected,
  onChange,
}: ContactInquirySelectorProps) {
  const { t, isArabic } = useLanguage();

  return (
    <div>
      <label className="block text-xs uppercase tracking-wider font-semibold text-text-secondary mb-3">
        {t("contact.inquiryType")}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {INQUIRY_TYPES.map((typeItem) => (
          <label
            key={typeItem.id}
            className="flex items-center gap-2.5 p-3 min-h-[44px] rounded-2xl border border-white/10 hover:border-brand-purple/40 cursor-pointer text-sm text-text-secondary hover:text-white transition-all bg-white/5 select-none"
          >
            <input
              type="radio"
              name="inquiryType"
              value={typeItem.id}
              checked={selected === typeItem.id}
              onChange={(e) => onChange(e.target.value)}
              className="accent-brand-purple shrink-0 size-4"
            />
            <span className="shrink-0">{typeItem.icon}</span>
            <span className="text-xs font-medium">
              {isArabic && typeItem.arLabel ? typeItem.arLabel : typeItem.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
