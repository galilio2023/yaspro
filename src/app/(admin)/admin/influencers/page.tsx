import React from "react";
import { getCmsInfluencers } from "@/lib/cms-actions";
import { InfluencersManager } from "@/features/enterprise/components/admin/InfluencersManager";

export const metadata = {
  title: "Creators CMS | Yas Productions",
};

export default async function AdminInfluencersPage() {
  const initialInfluencers = await getCmsInfluencers();
  return <InfluencersManager initialInfluencers={initialInfluencers} />;
}
