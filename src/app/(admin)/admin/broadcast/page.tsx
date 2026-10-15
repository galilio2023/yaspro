import React from "react";
import { getCmsInquiries } from "@/lib/cms-actions";
import { BroadcastManager } from "@/features/admin";

export const metadata = {
  title: "Broadcast & OB Van Dispatcher | Yas Productions CMS",
  description: "Mission control for live OB Van satellite telemetry and edge broadcasting.",
};

export default async function AdminBroadcastPage() {
  const allInquiries = await getCmsInquiries();
  const broadcastInquiries = allInquiries.filter(
    (i) =>
      i.inquiryType === "ob_van" ||
      i.inquiryType === "live_broadcast" ||
      i.inquiryType === "outdoor_filming" ||
      i.message?.includes("[OB-VAN") ||
      i.message?.includes("[Outdoor Filming")
  );

  return <BroadcastManager initialBroadcastInquiries={broadcastInquiries} />;
}
