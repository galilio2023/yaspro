import React from "react";
import { getCmsBookings } from "@/lib/cms-actions";
import { BookingsManager } from "@/features/admin";

export const metadata = {
  title: "Bookings Desk CMS | Yas Productions",
};

export default async function AdminBookingsPage() {
  const initialBookings = await getCmsBookings();
  return <BookingsManager initialBookings={initialBookings} />;
}
