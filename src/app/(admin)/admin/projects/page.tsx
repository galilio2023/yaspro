import React from "react";
import { getCmsProjects } from "@/lib/cms-actions";
import { ProjectsManager } from "@/features/admin";

export const metadata = {
  title: "Projects CMS | Yas Productions",
};

export default async function AdminProjectsPage() {
  const initialProjects = await getCmsProjects();
  return <ProjectsManager initialProjects={initialProjects} />;
}
