"use client";

import { MessageSquare } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function ContactHeroHeader() {
  const { t } = useLanguage();

  return (
    <SectionHeader
      headingId="contact-title"
      as="h1"
      align="left"
      title={t("contact.title")}
      gradientText={t("contact.titleGradient")}
      description={t("contact.description")}
    />
  );
}
