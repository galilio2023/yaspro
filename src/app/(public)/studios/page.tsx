import { Metadata } from "next";
import { StudiosPageClient } from "./StudiosPageClient";
import { getCachedStudios } from "@/lib/cached-queries";
import { getDynamicSoundstages } from "@/features/studios/data";

import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Soundstages & Production Studios in Dubai",
  description:
    "Explore Yas Pro's certified production soundstages in Business Bay, Dubai. Featuring 270° Micro-LED virtual production, Neve & SSL consoles, and infinite cycloramas.",
  openGraph: {
    title: "Soundstages & Production Studios in Dubai • Yas Pro",
    description:
      "Acoustically certified soundstages, live tracking rooms, and podcast suites equipped with Neve, SSL, Shure, and 270° Micro-LED volumes at Business Bay Dubai.",
    url: `${SITE_URL}/studios`,
    images: [
      {
        url: `${SITE_URL}/images/studios/nature-grid.jpg`,
        width: 1200,
        height: 630,
        alt: "Yas Pro Soundstages Dubai",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Soundstages & Production Studios in Dubai • Yas Pro",
    description:
      "Certified 3D virtual production soundstages, Micro-LED volume, and broadcast tracking rooms in Dubai.",
    images: [`${SITE_URL}/images/studios/nature-grid.jpg`],
  },
  alternates: {
    canonical: `${SITE_URL}/studios`,
  },
};

export default async function StudiosPage() {
  const cmsStudios = await getCachedStudios();
  const initialStudios = getDynamicSoundstages(cmsStudios);
  return <StudiosPageClient initialStudios={initialStudios} />;
}
