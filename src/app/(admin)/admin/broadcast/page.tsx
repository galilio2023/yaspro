import React from "react";
import { BroadcastManager } from "@/features/enterprise/components/admin/BroadcastManager";

export const metadata = {
  title: "Broadcast & OB Van Dispatcher | Yas Productions CMS",
  description: "Mission control for live OB Van satellite telemetry and edge broadcasting.",
};

export default function AdminBroadcastPage() {
  return <BroadcastManager />;
}
