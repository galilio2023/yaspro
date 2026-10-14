import React from "react";
import { getCmsPackages } from "@/lib/actions/service-packages";
import { ServicePackagesManager } from "@/features/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Service Packages & Bundles CMS | Yas Productions",
  description: "Configure dynamic studio recording packages, bundles, and retainers across all 7 Yas Pro services.",
};

export default async function AdminPackagesPage() {
  const initialPackages = await getCmsPackages();

  return <ServicePackagesManager initialPackages={initialPackages} />;
}
