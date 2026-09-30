import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { PortalMobileNav } from "@/components/portal/PortalMobileNav";
import type { PortalNavItem } from "@/components/portal/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Client Portal | Yas Pro",
  description: "Secure production client dashboard for Yas Pro studio bookings and billing.",
};

const CLIENT_NAV: PortalNavItem[] = [
  { href: "/portal", label: "Dashboard", icon: "dashboard" },
  { href: "/portal/bookings", label: "My Bookings", icon: "bookings" },
  { href: "/portal/invoices", label: "Billing & Invoices", icon: "invoices" },
  { href: "/portal/settings", label: "Account Settings", icon: "settings" },
  { href: "/portal/support", label: "Concierge Support", icon: "support" },
];

export default async function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?callbackUrl=/portal");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-emerald-600 selection:text-white">
      <PortalMobileNav
        navItems={CLIENT_NAV}
        userName={session.user.name}
        userEmail={session.user.email}
        userRole="client"
        accentColor="emerald"
      />
      <PortalSidebar
        navItems={CLIENT_NAV}
        userName={session.user.name}
        userEmail={session.user.email}
        userRole="client"
        accentColor="emerald"
      />
      <main className="flex-1 overflow-x-hidden p-4 sm:p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}
