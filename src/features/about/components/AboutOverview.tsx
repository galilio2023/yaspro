import { FadeUp } from "@/components/animations/MotionWrappers";
import { Badge } from "@/components/ui/badge";

const SCALE_STATS = [
  { value: "400M+", label: "Total Creator Reach" },
  { value: "500+", label: "Delivered Projects" },
  { value: "3", label: "Regional Hubs (UAE, Egypt, Jordan)" },
  { value: "100%", label: "Client Satisfaction Goal" },
] as const;

export function AboutOverview() {
  return (
    <div className="grid md:grid-cols-2 gap-8 mb-16 items-stretch">
      {/* Philosophy Card */}
      <FadeUp className="h-full">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 sm:p-10 h-full flex flex-col justify-between shadow-xl shadow-black/20">
          <div>
            <Badge variant="default" className="mb-4">
              Our Philosophy
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-display">
              Where Technology Serves Human Emotion
            </h2>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed mb-4">
              Licensed in 2015 in Dubai, United Arab Emirates, with official
              accreditation from the UAE National Media Council (NMC), Yas Pro Media
              operates world-class production facilities across Dubai, Cairo, and Amman.
            </p>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              We redefine content creation by blending human creativity with
              generative AI workflows, chosen by federal government entities and
              top digital creators for our technical precision, confidentiality, and distinction.
            </p>
          </div>
        </div>
      </FadeUp>

      {/* Scale Card */}
      <FadeUp delay={0.1} className="h-full">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 sm:p-10 h-full flex flex-col justify-between shadow-xl shadow-black/20">
          <div>
            <Badge variant="cyan" className="mb-4">
              Our Scale
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-display">
              Numbers That Speak For Themselves
            </h2>
            <div className="grid grid-cols-2 gap-6 my-6">
              {SCALE_STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-cyan bg-clip-text text-transparent font-display">
                    {stat.value}
                  </div>
                  <div className="text-xs text-text-muted mt-1 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeUp>
    </div>
  );
}
