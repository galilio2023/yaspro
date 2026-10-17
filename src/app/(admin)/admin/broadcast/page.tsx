import React from "react";
import { getCmsInquiries } from "@/lib/cms-actions";
import {
  getTelemetryFeed,
  getBroadcastFleetStatus,
} from "@/lib/actions/broadcast-telemetry-dispatcher";
import { BroadcastManager } from "@/features/admin";

export const metadata = {
  title: "Broadcast & OB Van Dispatcher | Yas Productions CMS",
  description: "Mission control for live OB Van satellite telemetry and edge broadcasting.",
};

export default async function AdminBroadcastPage() {
  const [allInquiries, initialTelemetryFeed, initialFleetStatus] = await Promise.all([
    getCmsInquiries(),
    typeof getTelemetryFeed === "function" ? getTelemetryFeed().catch(() => []) : Promise.resolve([]),
    typeof getBroadcastFleetStatus === "function"
      ? getBroadcastFleetStatus().catch(() => undefined)
      : Promise.resolve(undefined),
  ]);
  const broadcastInquiries = allInquiries.filter(
    (i) =>
      i.inquiryType === "ob_van" ||
      i.inquiryType === "live_broadcast" ||
      i.inquiryType === "outdoor_filming" ||
      i.message?.includes("[OB-VAN") ||
      i.message?.includes("[Outdoor Filming")
  );

  return (
    <BroadcastManager
      initialBroadcastInquiries={broadcastInquiries}
      initialTelemetryFeed={initialTelemetryFeed}
      initialFleetStatus={initialFleetStatus}
    />
  );
}
