import { Metadata } from "next";
import { StudiosPageClient } from "./StudiosPageClient";
import { getCachedStudios } from "@/lib/cached-queries";
import { getDynamicSoundstages } from "@/features/studios/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Soundstages & Production Studios in Dubai | Yas Pro",
  description:
    "Explore Yas Pro's certified production soundstages in Iris Bay, Business Bay, Dubai. Featuring 270° Micro-LED virtual production, Neve 8078 & SSL consoles, Shure 4K podcast suites, and infinite cycloramas.",
  openGraph: {
    title: "Soundstages & Production Studios in Dubai | Yas Pro",
    description:
      "Acoustically certified soundstages, live tracking rooms, and podcast suites equipped with Neve, SSL, Shure, and 270° Micro-LED volumes at Iris Bay Dubai.",
    images: ["/images/studios/nature-grid.jpg"],
  },
};

export default async function StudiosPage() {
  const cmsStudios = await getCachedStudios();
  const initialStudios = getDynamicSoundstages(cmsStudios);
  return <StudiosPageClient initialStudios={initialStudios} />;
}
