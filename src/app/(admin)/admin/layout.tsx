import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminMobileNav, AdminSidebar } from "@/components/admin";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin CMS",
  description: "Enterprise content & operations management backed by Neon PostgreSQL and Drizzle ORM.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let adminName = "System Administrator";

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session || (session.user as { role?: string }).role !== "admin") {
      redirect("/login?error=admin_required");
    }
    adminName = session.user.name || "Administrator";
  } catch (err) {
    console.error("Admin layout auth check error:", err);
    redirect("/login?error=admin_required");
  }

  return (
    <div className="min-h-screen bg-[#070709] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-brand-mauve selection:text-white">
      <AdminMobileNav adminName={adminName} />
      <AdminSidebar adminName={adminName} />
      <main className="flex-1 overflow-x-hidden p-4 sm:p-8 lg:p-10">{children}</main>
    </div>
  );
}
