import React from "react";
import { getCmsBookings, getCmsStudios } from "@/lib/cms-actions";
import { BookingsManager } from "@/features/admin";

export const metadata = {
  title: "Bookings Desk CMS | Yas Productions",
};

export default async function AdminBookingsPage() {
  const [initialBookings, studios] = await Promise.all([getCmsBookings(), getCmsStudios()]);
  return (
    <BookingsManager
      initialBookings={initialBookings}
      studios={studios.map((s) => ({ id: s.id, name: s.name }))}
    />
  );
}
