import React, { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getClientBookings } from "@/lib/cms-actions";
import { AccountDashboard } from "@/features/account/components/AccountDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Account | Yas Pro Productions",
  description: "View and manage your studio bookings, podcast sessions, cinema gear rentals, and profile.",
};

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  const bookings = await getClientBookings(session.user.id);

  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
          Loading account...
        </div>
      }
    >
      <AccountDashboard
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: (session.user as { role?: string }).role,
          company: (session.user as { company?: string }).company,
          phone: (session.user as { phone?: string }).phone,
        }}
        bookings={bookings}
      />
    </Suspense>
  );
}
