import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sovereign Operations & C2C Media Vault | Yas Pro Enterprise",
  description:
    "Secure ministerial client portal for camera-to-cloud dailies, active RFP tracking, and air-gapped broadcast assets.",
};

export default function EnterprisePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
