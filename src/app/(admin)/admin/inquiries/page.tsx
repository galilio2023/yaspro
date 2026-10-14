import React from "react";
import { getCmsInquiries, getCmsCampaignInquiries } from "@/lib/cms-actions";
import { InquiriesManager } from "@/features/admin";

export const metadata = {
  title: "Inquiries & RFPs Desk | Yas Productions CMS",
  description: "Manage client inquiries, campaign RFPs, creator briefs, and OB Van broadcast quotes.",
};

export default async function AdminInquiriesPage() {
  const [initialInquiries, initialCampaignInquiries] = await Promise.all([
    getCmsInquiries(),
    getCmsCampaignInquiries(),
  ]);

  return (
    <InquiriesManager
      initialInquiries={initialInquiries}
      initialCampaignInquiries={initialCampaignInquiries}
    />
  );
}

