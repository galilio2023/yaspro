import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { EnterprisePortalClient } from "@/features/enterprise/components/portal/EnterprisePortalClient";

export default async function EnterprisePortalPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?callbackUrl=/enterprise/portal");
  }

  return <EnterprisePortalClient userName={session.user.name} />;
}
