import React from "react";
import { getCmsInquiries } from "@/lib/cms-actions";
import { InquiriesManager } from "@/features/admin";

export const metadata = {
  title: "Inquiries & Leads Desk | Yas Productions CMS",
  description: "Manage client inquiries, OB Van broadcast quotes, and creator briefs.",
};

export default async function AdminInquiriesPage() {
  const initialInquiries = await getCmsInquiries();
  return <InquiriesManager initialInquiries={initialInquiries} />;
}
