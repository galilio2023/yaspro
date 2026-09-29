import { MapPin, Phone, Mail } from "lucide-react";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations/MotionWrappers";
import { LOCATIONS_DATA } from "../data";

export function LocationsList() {
  return (
    <div className="w-full">
      <FadeUp delay={0.1}>
        <h2 className="text-white font-bold text-2xl mb-6 font-display">
          Our Regional Studios &amp; Offices
        </h2>
      </FadeUp>

      <StaggerContainer className="space-y-4">
        {LOCATIONS_DATA.map((loc) => (
          <StaggerItem key={loc.country}>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 flex items-start gap-4 hover:border-brand-purple/40 hover:bg-white/[0.06] transition-all duration-300">
              <div className="text-3xl shrink-0 p-2 rounded-2xl bg-white/5 border border-white/10">
                {loc.flag}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold font-display text-lg mb-1">{loc.country}</h3>
                <p className="text-text-secondary text-sm flex items-start gap-2 leading-relaxed">
                  <MapPin size={15} className="text-brand-purple mt-0.5 shrink-0" />
                  <span>{loc.address}</span>
                </p>
                <p className="text-text-secondary text-sm flex items-center gap-2 mt-1.5 font-mono">
                  <Phone size={14} className="text-brand-cyan shrink-0" />
                  <span>{loc.phone}</span>
                </p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <FadeUp delay={0.4}>
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-9 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple-light">
              <Mail size={18} />
            </div>
            <div>
              <span className="text-white font-bold text-sm block">Direct Production Email</span>
              <a
                href="mailto:info@yasproductions.com"
                className="text-brand-purple-light hover:text-white transition-colors text-sm font-medium"
              >
                info@yasproductions.com
              </a>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href="https://web.whatsapp.com/send?phone=971554010465"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 rounded-2xl text-center text-sm font-semibold text-white border border-brand-teal/40 bg-brand-teal/10 hover:bg-brand-teal/20 transition-all flex items-center justify-center gap-2 text-brand-teal-light hover:text-white shadow-md shadow-brand-teal/10"
            >
              <span>WhatsApp Direct</span>
            </a>
            <a
              href="https://instagram.com/yaspromedia"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 rounded-2xl text-center text-sm font-semibold text-white border border-brand-purple/30 bg-brand-purple/10 hover:bg-brand-purple/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Instagram Channel</span>
            </a>
          </div>
        </div>
      </FadeUp>
    </div>
  );
}
