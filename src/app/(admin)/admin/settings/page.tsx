import React from "react";
import { getPlatformSettings } from "@/lib/actions/platform-settings-operations";
import { SettingsManager } from "@/features/admin";

export const metadata = {
  title: "Platform & Payment Settings | Yas Productions",
  description: "Configure corporate bank transfer details, booking deposit percentage, VAT, and concierge contact.",
};

export default async function AdminSettingsPage() {
  const settings = await getPlatformSettings();
  return <SettingsManager initialSettings={settings} />;
}
