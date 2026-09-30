import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PortalSettingsForm } from "@/features/portal/components/PortalSettingsForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account Settings | Client Portal" };

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?callbackUrl=/portal/settings");

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Account Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your contact details and company information.</p>
      </div>
      <PortalSettingsForm
        user={{
          name: session.user.name,
          email: session.user.email,
          phone: (session.user as Record<string, unknown>).phone as string | null,
          company: (session.user as Record<string, unknown>).company as string | null,
          role: (session.user as Record<string, unknown>).role as string ?? "client",
        }}
      />
    </div>
  );
}
