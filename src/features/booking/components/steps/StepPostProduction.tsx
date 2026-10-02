import { Sparkles } from "lucide-react";
import type { WizardStepProps } from "../../types";
import { Badge } from "@/components/ui/badge";

interface PostServiceItem {
  field: "needsAiAutoCut" | "needsEditing" | "needsColorGrading" | "needsSoundMastering";
  label: string;
  desc: string;
  isAi?: boolean;
}

const POST_SERVICES: PostServiceItem[] = [
  {
    field: "needsAiAutoCut",
    label: "AI Multi-Cam Auto-Cut & Arabic/English Subtitles (+450 AED)",
    desc: "AI speaker tracking rough cut ready in 2 hours, automated Khaleeji & Egyptian captions, plus 5 vertical viral clips.",
    isAi: true,
  },
  {
    field: "needsEditing",
    label: "Senior Video Editor Post-Production (+400 AED)",
    desc: "Full narrative edit, multi-cam pacing, sound design, b-roll sync, and custom graphic title cards.",
  },
  {
    field: "needsColorGrading",
    label: "DaVinci Resolve Cinema HDR Color Grading (+300 AED)",
    desc: "Custom color pass calibrated for 4K broadcast, skin tone balancing, and dynamic contrast curves.",
  },
  {
    field: "needsSoundMastering",
    label: "Acoustic Denoising & Broadcast Sound Mastering (+250 AED)",
    desc: "Dialogue isolation, background noise reduction, and loudness compliance standard (-14 LUFS).",
  },
];

export function StepPostProduction({ state, update }: WizardStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-text-secondary text-sm leading-relaxed mb-4">
        Accelerate your turnaround with Yas Pro’s AI post-production pipeline and senior editorial suite:
      </p>
      {POST_SERVICES.map(({ field, label, desc, isAi }) => (
        <label
          key={field}
          className={`flex items-start gap-3.5 cursor-pointer p-4 rounded-2xl border transition-all ${
            state[field]
              ? "bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10"
              : "border-white/10 hover:border-amber-500/40 bg-white/5"
          }`}
        >
          <input
            type="checkbox"
            checked={state[field]}
            onChange={(e) => update({ [field]: e.target.checked })}
            className="accent-amber-500 size-5 rounded mt-0.5 cursor-pointer"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-white font-semibold text-sm block">{label}</span>
              {isAi && (
                <Badge variant="gold" className="text-[10px] px-2 py-0 gap-1">
                  <Sparkles size={10} /> Yas AI
                </Badge>
              )}
            </div>
            <span className="text-text-muted text-xs leading-relaxed">{desc}</span>
          </div>
        </label>
      ))}
    </div>
  );
}
