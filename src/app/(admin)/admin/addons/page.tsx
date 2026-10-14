import React from "react";
import { getCmsAddons } from "@/lib/actions/booking-addons";
import { AddonsManager } from "@/features/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Booking Assets & Add-ons CMS | Yas Productions",
  description: "Manage dynamic crew members, production equipment, set decor props, and post-production options.",
};

export default async function AdminAddonsPage() {
  const initialAddons = await getCmsAddons();

  return <AddonsManager initialAddons={initialAddons} />;
}
