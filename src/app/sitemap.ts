import type { MetadataRoute } from "next";
import { PROJECTS_DATA } from "@/features/projects/data";
import { INFLUENCERS_DATA } from "@/features/influencers/data";
import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;
  const now = new Date();

  const staticRoutes = [
    "",
    "/services",
    "/offers",
    "/studios",
    "/studio-booking",
    "/podcast-booking",
    "/social-media-packages",
    "/projects",
    "/influencers",
    "/shop",
    "/about",
    "/contact",
    "/terms",
    "/privacy-policy",
  ];

  const staticEntries = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const),
    priority: route === "" ? 1.0 : route.startsWith("/studio") || route.startsWith("/podcast") || route.startsWith("/social") ? 0.9 : 0.8,
  }));

  const projectEntries = PROJECTS_DATA.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const creatorEntries = INFLUENCERS_DATA.map((creator) => ({
    url: `${baseUrl}/influencers/${creator.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...projectEntries, ...creatorEntries];
}

