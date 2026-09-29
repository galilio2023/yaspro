"use client";

import { Sparkles } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function AboutHeroHeader() {
  const { t } = useLanguage();

  return (
    <SectionHeader
      headingId="about-title"
      as="h1"
      badge={t("about.badge")}
      badgeVariant="default"
      badgeIcon={<Sparkles size={13} />}
      title={t("about.title")}
      gradientText={t("about.titleGradient")}
      description={t("about.description")}
    />
  );
}
