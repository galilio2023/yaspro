import React from "react";
import { getCmsBlockedSchedules } from "@/lib/actions/schedule-blackouts";
import { getCmsStudios } from "@/lib/cms-actions";
import { ScheduleBlackoutManager } from "@/features/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Schedule & Blackouts CMS | Yas Productions",
  description: "Block dates and maintenance windows across soundstages, podcast studios, and gear rentals.",
};

export default async function AdminSchedulePage() {
  const [initialSchedules, initialStudios] = await Promise.all([
    getCmsBlockedSchedules(),
    getCmsStudios(),
  ]);

  const studioOptions = initialStudios.map((st) => ({
    id: st.id,
    name: st.name,
  }));

  return (
    <ScheduleBlackoutManager
      initialSchedules={initialSchedules}
      studios={studioOptions}
    />
  );
}
