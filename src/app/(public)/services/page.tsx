import { Metadata } from "next";
import { ServicesPageClient } from "./ServicesPageClient";
import { SITE_URL } from "@/lib/constants";
import { SHARED_OPEN_GRAPH } from "@/lib/metadata";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Production Services & Creative Infrastructure in Dubai",
  description:
    "Explore Yas Pro's 7 production pillars in Business Bay, Dubai: Certified Soundstages, Mobile OB-VAN Broadcast, Outdoor Filming Units, Podcast Suites, Cinema Gear Rental, Social Media Packages, and Production Bundles.",
  openGraph: {
    ...SHARED_OPEN_GRAPH,
    title: "Production Services & Media Infrastructure • Yas Pro Dubai",
    description:
      "Full-spectrum media production capabilities: Soundstages, live OB-VAN broadcast vehicles, field filming units, 4K podcast lounges, cinema equipment rentals, and turnkey commercial packages.",
    url: `${SITE_URL}/services`,
    images: [
      {
        url: `${SITE_URL}/images/services/studio-booking.webp`,
        width: 1200,
        height: 630,
        alt: "Yas Pro Production Services Dubai",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Production Services & Media Infrastructure • Yas Pro Dubai",
    description:
      "Soundstages, OB-VAN mobile broadcasting, cinema gear rental, podcast suites, and field production units in Dubai.",
    images: [`${SITE_URL}/images/services/studio-booking.webp`],
  },
  alternates: {
    canonical: `${SITE_URL}/services`,
  },
};

export default function ServicesPage() {
  return <ServicesPageClient />;
}
