import { Metadata } from "next";
import { BlackoutManager } from "@/features/admin";
import { getStudioBlackouts } from "@/lib/actions/blackout-operations";
import { getCmsPodcastSets } from "@/lib/actions/podcast-operations";

export const metadata: Metadata = {
  title: "Studio Blackouts & Maintenance | Admin Control",
  robots: "noindex, nofollow",
};

export default async function AdminBlackoutsPage() {
  const [blackouts, podcastSets] = await Promise.all([
    getStudioBlackouts(),
    getCmsPodcastSets(),
  ]);

  return <BlackoutManager initialBlackouts={blackouts} podcastSets={podcastSets} />;
}
