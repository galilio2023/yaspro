import React from "react";
import { getCmsBookings } from "@/lib/cms-actions";
import { OffersManager } from "@/features/admin";

export const metadata = {
  title: "Turnkey Offers & Bundles CMS | Yas Productions",
  description: "Manage packaged production bundles, live mixing suites, and promotional discount campaigns.",
};

export default async function AdminOffersPage() {
  const initialBookings = await getCmsBookings();
  return <OffersManager initialBookings={initialBookings} />;
}
