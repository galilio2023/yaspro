import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ProductionCtaCardProps {
  title?: string;
  description?: string;
  primaryText?: string;
  primaryHref?: string;
  secondaryText?: string;
  secondaryHref?: string;
}

export function ProductionCtaCard({
  title = "Want a production of similar caliber?",
  description = "Book our 4K soundstages or schedule a production consultation with our creative directors.",
  primaryText = "Book Studio Session",
  primaryHref = "/studio-booking",
  secondaryText = "Contact Team",
  secondaryHref = "/contact",
}: ProductionCtaCardProps) {
  return (
    <div className="rounded-3xl border border-amber-500/20 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 relative overflow-hidden shadow-xl shadow-black/20">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-600/10 pointer-events-none" />
      <h3 className="text-lg font-bold mb-2 text-white font-display">
        {title}
      </h3>
      <p className="text-text-secondary text-xs sm:text-sm mb-6 leading-relaxed">
        {description}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild variant="brand-gold" size="default" className="flex-1 rounded-xl text-xs font-semibold">
          <Link href={primaryHref}>{primaryText}</Link>
        </Button>
        <Button asChild variant="outline" size="default" className="flex-1 rounded-xl text-xs font-semibold">
          <Link href={secondaryHref}>{secondaryText}</Link>
        </Button>
      </div>
    </div>
  );
}
