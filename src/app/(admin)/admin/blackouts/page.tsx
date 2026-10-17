import { Metadata } from "next";
import { BlackoutManager } from "@/features/admin";
import { getStudioBlackouts } from "@/lib/actions/blackout-operations";
import { getCmsPodcastSets } from "@/lib/actions/podcast-operations";
import { getCmsStudios } from "@/lib/actions/studios-soundstages-operations";

export const metadata: Metadata = {
  title: "Studio Blackouts & Maintenance | Admin Control",
  robots: "noindex, nofollow",
};

export default async function AdminBlackoutsPage() {
  const [blackouts, podcastSets, studios] = await Promise.all([
    getStudioBlackouts(),
    getCmsPodcastSets(),
    getCmsStudios(),
  ]);

  return (
    <BlackoutManager
      initialBlackouts={blackouts}
      podcastSets={podcastSets}
      studios={studios.map((s) => ({ id: s.id, name: s.name }))}
    />
  );
}
