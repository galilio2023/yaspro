import React from "react";
import { getCmsStudios } from "@/lib/cms-actions";
import { getStudioWizardCatalog } from "@/lib/actions/studio-wizard-catalog-operations";
import { StudiosManager } from "@/features/admin";

export const metadata = {
  title: "Soundstages & Rates CMS | Yas Productions",
  description: "Configure studio soundstage pricing, capacity, wizard steps, crew rates, props, and post-production add-ons.",
};

export default async function AdminStudiosPage() {
  const [initialStudios, initialWizardCatalog] = await Promise.all([
    getCmsStudios(),
    getStudioWizardCatalog(),
  ]);
  return (
    <StudiosManager
      initialStudios={initialStudios}
      initialWizardCatalog={initialWizardCatalog}
    />
  );
}
