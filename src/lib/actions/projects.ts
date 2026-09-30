"use server";

import { db } from "@/db";
import {
  projects,
  type Project,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { PROJECTS_DATA } from "@/features/projects/data";
import { isUuid, isDbAvailable, requireAdmin, type CmsResponse } from "./shared";


/**
 * Retrieves portfolio projects from the Neon database with automatic fallback to the static catalog.
 *
 * @returns Array of projects ordered by creation date.
 */
export async function getCmsProjects(): Promise<Project[]> {
  if (isDbAvailable()) {
    const records = await db.select().from(projects).orderBy(desc(projects.createdAt));
    if (records && records.length > 0) return records;
  }

  // Fallback to static catalog converted to Project type
  return PROJECTS_DATA.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    arabicTitle: p.arabicTitle || null,
    description: p.description || null,
    category:
      p.category === "government" || p.category === "commercial" || p.category === "shows"
        ? p.category
        : "commercial",
    client: p.client || null,
    coverImageUrl: p.image || null,
    videoUrl: p.vimeoId ? `https://vimeo.com/${p.vimeoId}` : null,
    tag: p.tag || null,
    views: p.views || null,
    year: p.year || "2024",
    deliverables: p.deliverables || [],
    techStack: p.techStack || [],
    tags: [p.tag, p.categoryLabel],
    isFeatured: true,
    publishedAt: new Date(),
    createdAt: new Date(),
  }));
}

/**
 * Creates or updates a portfolio film record in Neon PostgreSQL.
 *
 * @param data - Partial project input with required title and slug.
 * @returns A CMS response indicating operation success or failure.
 */
export async function upsertCmsProject(data: Partial<Project> & { title: string; slug: string }): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: true, message: "Project saved in local preview mode." };
    }

    const payload = {
      title: data.title,
      slug: data.slug,
      arabicTitle: data.arabicTitle || null,
      description: data.description || null,
      category: data.category || "commercial",
      client: data.client || null,
      coverImageUrl: data.coverImageUrl || null,
      videoUrl: data.videoUrl || null,
      tag: data.tag || null,
      views: data.views || null,
      year: data.year || "2024",
      deliverables: data.deliverables || [],
      techStack: data.techStack || [],
      tags: data.tags || [],
      isFeatured: data.isFeatured ?? true,
    };

    if (isUuid(data.id)) {
      await db.update(projects).set(payload).where(eq(projects.id, data.id!));
    } else {
      await db.insert(projects).values(payload).onConflictDoUpdate({
        target: projects.slug,
        set: payload,
      });
    }

    revalidatePath("/projects");
    revalidatePath("/admin/projects");
    updateTag("projects");
    updateTag(`project:${data.slug}`);
    return { success: true, message: "Project updated successfully in Neon DB." };
  } catch (error) {
    console.error("upsertCmsProject error:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Deletes a portfolio film record from Neon PostgreSQL.
 *
 * @param id - UUID of the project to remove.
 * @returns CMS response confirming deletion.
 */
export async function deleteCmsProject(id: string): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (isDbAvailable()) {
      await db.delete(projects).where(eq(projects.id, id));
    }
    revalidatePath("/projects");
    revalidatePath("/admin/projects");
    updateTag("projects");
    return { success: true, message: "Project deleted." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
