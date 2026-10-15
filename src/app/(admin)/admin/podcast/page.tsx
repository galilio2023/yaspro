import { Metadata } from "next";
import { PodcastManager } from "@/features/admin";
import { getCmsPodcastSets, getCmsPodcastAddons } from "@/lib/actions/podcast-operations";

export const metadata: Metadata = {
  title: "Podcast Sets & Add-ons | Admin Control",
  robots: "noindex, nofollow",
};

export default async function AdminPodcastPage() {
  const [sets, addons] = await Promise.all([
    getCmsPodcastSets(),
    getCmsPodcastAddons(),
  ]);

  return <PodcastManager initialSets={sets} initialAddons={addons} />;
}
