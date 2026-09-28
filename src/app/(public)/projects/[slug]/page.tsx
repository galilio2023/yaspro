import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROJECTS_DATA } from "@/features/projects/data";
import { getCachedProjectBySlug } from "@/lib/cached-queries";
import { BackButton } from "@/components/ui/back-button";
import { ProductionCtaCard } from "@/components/ui/production-cta-card";
import { ProjectHeroStage } from "@/features/projects/components/ProjectHeroStage";
import { ProjectOverview } from "@/features/projects/components/ProjectOverview";
import { ProjectDeliverables } from "@/features/projects/components/ProjectDeliverables";
import { ProjectTechStack } from "@/features/projects/components/ProjectTechStack";
import { JsonLd, YAS_PRO_ORGANIZATION_SCHEMA } from "@/components/seo/JsonLd";

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  return PROJECTS_DATA.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getCachedProjectBySlug(slug);

  if (!project) {
    return { title: "Project Not Found" };
  }

  return {
    title: `${project.title} | Yas Pro Projects`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getCachedProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const PROJECT_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: project.title,
    headline: project.title,
    description: project.description,
    image: project.image ? (project.image.startsWith("http") ? project.image : `https://yaspro.ae${project.image}`) : "https://yaspro.ae/images/projects/flag-day.jpg",
    datePublished: project.year,
    productionCompany: {
      ...YAS_PRO_ORGANIZATION_SCHEMA,
    },
    genre: project.categoryLabel,
  };

  return (
    <section className="w-full py-12 md:py-20 bg-background relative overflow-hidden flex flex-col items-center">
      <JsonLd data={PROJECT_SCHEMA} />
      {/* Background ambient lighting */}
      <div className="absolute top-20 right-1/4 size-[600px] bg-brand-purple/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <BackButton href="/projects" label="Back to Projects" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Stage (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <ProjectHeroStage project={project} />
            <ProjectOverview project={project} />
          </div>

          {/* Sticky Sidebar (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-28">
            <ProjectDeliverables deliverables={project.deliverables} />
            <ProjectTechStack techStack={project.techStack} />
            <ProductionCtaCard
              title="Want a production of similar caliber?"
              description="Book our 4K soundstages or schedule a production consultation with our creative directors."
              primaryText="Book Studio"
              primaryHref="/studio-booking"
              secondaryText="Contact Team"
              secondaryHref="/contact"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
