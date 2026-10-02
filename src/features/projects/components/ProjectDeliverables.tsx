import { Award, CheckCircle } from "lucide-react";

export interface ProjectDeliverablesProps {
  deliverables?: readonly string[];
}

export function ProjectDeliverables({ deliverables }: ProjectDeliverablesProps) {
  const items = deliverables || [
    "Official 4K Broadcast Film",
    "Social Multi-Platform Cutdowns",
    "Color Master Package",
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-8">
      <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2.5 font-display uppercase tracking-wider">
        <div className="size-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <Award size={16} />
        </div>
        <span>Project Deliverables</span>
      </h2>
      <div className="overflow-x-auto">
        <ul className="space-y-3 min-w-full">
          {items.map((item) => (
            <li key={item} className="text-sm text-text-secondary flex items-start gap-3">
              <CheckCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
