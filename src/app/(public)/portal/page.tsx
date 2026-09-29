import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ClientPortalDashboard } from "@/features/portal/components/ClientPortalDashboard";

export const metadata = {
  title: "Client Portal | Yas Pro",
  description: "Secure production client dashboard for Yas Pro video dailies, stages, and billing.",
};

export default async function PortalPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?callbackUrl=/portal");
  }

  return <ClientPortalDashboard user={session.user} />;
}
