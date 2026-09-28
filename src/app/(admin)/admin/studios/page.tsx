import React from "react";
import { getCmsStudios } from "@/lib/cms-actions";
import { StudiosManager } from "@/features/enterprise/components/admin/StudiosManager";

export const metadata = {
  title: "Soundstages & Rates CMS | Yas Productions",
  description: "Configure studio soundstage pricing, capacity, and maintenance availability.",
};

export default async function AdminStudiosPage() {
  const initialStudios = await getCmsStudios();
  return <StudiosManager initialStudios={initialStudios} />;
}
