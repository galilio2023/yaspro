import React from "react";
import { getCmsEquipment } from "@/lib/cms-actions";
import { GearManager } from "@/features/admin";

export const metadata = {
  title: "Gear Catalog CMS | Yas Productions",
};

export default async function AdminGearPage() {
  const initialEquipment = await getCmsEquipment();
  return <GearManager initialEquipment={initialEquipment} />;
}
