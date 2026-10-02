import type { Metadata } from "next";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { ProjectsExplorer } from "@/features/projects/components/ProjectsExplorer";
import { PROJECTS_DATA } from "@/features/projects/data";
import { getCachedProjects } from "@/lib/cached-queries";
import { SectionHeader } from "@/components/ui/section-header";
import { Award, Film } from "lucide-react";
import Link from "next/link";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import type { ProjectItem, ProjectCategory } from "@/features/projects/types";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Projects & Portfolio",
  description: "Explore Yas Pro productions: Government initiatives, high-profile commercial campaigns, and original digital shows.",
};

export default async function ProjectsPage() {
  const cmsProjects = await getCachedProjects();

  const projectsToDisplay: ProjectItem[] = cmsProjects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    arabicTitle: p.arabicTitle || undefined,
    category: (p.category === "government" || p.category === "commercial" || p.category === "shows"
      ? p.category
      : "commercial") as ProjectCategory,
    categoryLabel:
      p.category === "government"
        ? "Government"
        : p.category === "shows"
        ? "Live Shows & Events"
        : "Commercial",
    client: p.client || "",
    description: p.description || "",
    tag: p.tag || "Production",
    views: p.views || "10M+ Views",
    year: p.year || "2024",
    image: p.coverImageUrl || "/images/projects/flag-day.jpg",
    vimeoId: p.videoUrl ? p.videoUrl.split("/").pop() : undefined,
    videoUrl: p.videoUrl || undefined,
    deliverables: p.deliverables || [],
    techStack: p.techStack || [],
  }));

  const initialProjects = projectsToDisplay.length > 0 ? projectsToDisplay : PROJECTS_DATA;

  return (
    <Section id="projects-page" aria-labelledby="projects-title" className="py-12 md:py-20 bg-background">
      <Container>
        <SectionHeader
          headingId="projects-title"
          as="h1"
          badge="Portfolio & Masterpieces"
          badgeVariant="default"
          badgeIcon={<Film size={13} />}
          title="Projects That"
          gradientText="Dominate Screens"
          description="From official national campaigns to viral series watched by millions across the Middle East. Explore our creative and technical productions."
        />

        <ProjectsExplorer initialProjects={initialProjects} />

        <FadeUp delay={0.2}>
          <div className="mt-16 rounded-3xl border border-white/10 bg-[#0c0b10] backdrop-blur-xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-amber-500/5 pointer-events-none" />
            <Award className="mx-auto text-amber-400 mb-4" size={40} />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-display">
              Have a Big Production in Mind?
            </h2>
            <p className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              From outdoor broadcast (OB Van) to fully orchestrated original shows, we bring the crew, cameras, and creative direction.
            </p>
            <Link
              href="/contact"
              className="btn-brand font-bold text-sm px-8 py-3.5 rounded-full inline-flex items-center gap-2 cursor-pointer"
            >
              Discuss Your Project
            </Link>
          </div>
        </FadeUp>
      </Container>
    </Section>
  );
}
