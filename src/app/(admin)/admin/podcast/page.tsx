import { Metadata } from "next";
import { PodcastManager } from "@/features/admin";
import { getCmsPodcastSets, getCmsPodcastAddons, getCmsPodcastServices } from "@/lib/actions/podcast-operations";

export const metadata: Metadata = {
  title: "Podcast Sets, Tiers & Add-ons | Admin Control",
  robots: "noindex, nofollow",
};

export default async function AdminPodcastPage() {
  const [sets, addons, services] = await Promise.all([
    getCmsPodcastSets(),
    getCmsPodcastAddons(),
    getCmsPodcastServices(),
  ]);

  return <PodcastManager initialSets={sets} initialAddons={addons} initialServices={services} />;
}
