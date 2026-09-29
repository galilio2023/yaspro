import { Video } from "lucide-react";

export interface ProjectTechStackProps {
  techStack?: readonly string[];
}

export function ProjectTechStack({ techStack }: ProjectTechStackProps) {
  const items = techStack || [
    "Cinema Camera Chain",
    "Dedicated Acoustic Foley Mixing",
    "Custom Color Pipeline",
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-8">
      <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2.5 font-display uppercase tracking-wider">
        <div className="size-8 rounded-xl bg-brand-cyan/20 flex items-center justify-center text-brand-cyan shrink-0">
          <Video size={16} />
        </div>
        <span>Production &amp; Tech Stack</span>
      </h2>
      <div className="flex flex-wrap gap-2">
        {items.map((tech) => (
          <span
            key={tech}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm text-text-secondary"
          >
            <span className="size-2 rounded-full bg-brand-cyan shrink-0" />
            <span>{tech}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
