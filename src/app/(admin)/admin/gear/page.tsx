import React from "react";
import { getCmsEquipment, getCmsGearOrders } from "@/lib/actions/equipment-gear";
import { GearManager } from "@/features/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gear Catalog & Rental Orders CMS | Yas Productions",
  description: "Manage fleet equipment catalog, daily rates, and customer gear rental orders.",
};

export default async function AdminGearPage() {
  const [initialEquipment, initialOrders] = await Promise.all([
    getCmsEquipment(),
    getCmsGearOrders(),
  ]);

  return <GearManager initialEquipment={initialEquipment} initialOrders={initialOrders} />;
}
