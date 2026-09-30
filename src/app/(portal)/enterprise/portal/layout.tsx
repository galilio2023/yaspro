import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { PortalMobileNav } from "@/components/portal/PortalMobileNav";
import type { PortalNavItem } from "@/components/portal/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Enterprise Vault | Yas Pro",
  description: "Sovereign enterprise production dashboard — C2C dailies, active tenders, soundstage reservations, and live telemetry.",
};

const ENTERPRISE_NAV: PortalNavItem[] = [
  { href: "/enterprise/portal", label: "Executive Overview", icon: "dashboard" },
  { href: "/enterprise/portal/dailies", label: "C2C Dailies Vault", icon: "dailies" },
  { href: "/enterprise/portal/rfps", label: "Active Tenders", icon: "rfps" },
  { href: "/enterprise/portal/stages", label: "Soundstage Reservations", icon: "stages" },
  { href: "/enterprise/portal/telemetry", label: "Live Telemetry Bus", icon: "telemetry" },
];

export default async function EnterprisePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?callbackUrl=/enterprise/portal");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-purple-600 selection:text-white">
      <PortalMobileNav
        navItems={ENTERPRISE_NAV}
        userName={session.user.name}
        userEmail={session.user.email}
        userRole="enterprise"
        accentColor="purple"
      />
      <PortalSidebar
        navItems={ENTERPRISE_NAV}
        userName={session.user.name}
        userEmail={session.user.email}
        userRole="enterprise"
        accentColor="purple"
      />
      <main className="flex-1 overflow-x-hidden p-4 sm:p-8 lg:p-10">{children}</main>
    </div>
  );
}
