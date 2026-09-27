import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enterprise Media Solutions & Sovereign Cloud Production | Yas Pro",
  description:
    "End-to-end Unreal Engine 5.4 virtual production, mobile OB-VAN 4K broadcast fleet, and GAMR Mawthooq-audited creator campaigns for GCC giga-projects, government ministries, and multinational brands.",
  openGraph: {
    title: "Enterprise Media Solutions & Sovereign Cloud Production | Yas Pro",
    description:
      "The Gulf's premier media infrastructure. High-security production protocols across UAE, Saudi Arabia, Egypt & Jordan.",
    url: "https://yasproductions.com/enterprise",
  },
};

export default function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
