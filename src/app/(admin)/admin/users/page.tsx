import React from "react";
import { getCmsUsers } from "@/lib/cms-actions";
import { UsersManager } from "@/features/enterprise/components/admin/UsersManager";

export const metadata = {
  title: "Registered Users & Clients CMS | Yas Productions",
  description: "View and manage all registered clients, enterprise partners, and administrators.",
};

export default async function AdminUsersPage() {
  const initialUsers = await getCmsUsers();
  return <UsersManager initialUsers={initialUsers} />;
}
