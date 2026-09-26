import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { ShieldCheck, Lock, FileText, Globe } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Yas Pro Media LLC collects, protects, and manages customer and production data across UAE, Egypt, and Jordan.",
};

export default function PrivacyPolicyPage() {
  return (
    <Section id="privacy-policy" aria-labelledby="privacy-title" className="py-12 md:py-20 bg-background">
      <Container className="max-w-4xl">
        <BackButton href="/" label="Back to Home" />

        <SectionHeader
          headingId="privacy-title"
          as="h1"
          align="left"
          badge="Data Protection & Privacy"
          badgeVariant="default"
          badgeIcon={<ShieldCheck size={13} />}
          title="Privacy"
          gradientText="Policy"
          description="Last updated: September 2026. This policy details how Yas Pro Media LLC collects, processes, and safeguards client production assets, booking telemetry, and personal information."
        />

        <div className="space-y-8 text-sm text-text-secondary leading-relaxed mt-10">
          <section className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
            <div className="flex items-center gap-3 text-white font-bold text-base mb-3 font-display">
              <Lock size={18} className="text-brand-purple-light" />
              <h2>1. Information We Collect</h2>
            </div>
            <p className="mb-3">
              When booking studio soundstages, leasing equipment, or contracting creators through Yas Pro Media, we collect:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-text-muted">
              <li>Contact details (Full name, corporate entity, email, phone number / WhatsApp).</li>
              <li>Booking parameters (Scheduled studio hours, equipment manifests, technical riders, crew specifications).</li>
              <li>Payment verification telemetry processed through certified regional gateways (Ziina, Stripe). We do not store raw card numbers.</li>
            </ul>
          </section>

          <section className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
            <div className="flex items-center gap-3 text-white font-bold text-base mb-3 font-display">
              <FileText size={18} className="text-brand-teal" />
              <h2>2. How We Use Your Data</h2>
            </div>
            <p className="mb-3">
              Your information is exclusively utilized to deliver high-tier media production services, including:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-text-muted">
              <li>Securing soundstage calendar allocations and dispatching outside broadcast (OB-Van) units.</li>
              <li>Coordinating security access and equipment transit across Dubai, Cairo, and Amman hubs.</li>
              <li>Direct production communications with creative directors, sound engineers, and talent desks.</li>
            </ul>
          </section>

          <section className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
            <div className="flex items-center gap-3 text-white font-bold text-base mb-3 font-display">
              <Globe size={18} className="text-brand-gold" />
              <h2>3. Regional Compliance &amp; Contact</h2>
            </div>
            <p className="text-text-secondary mb-3">
              Yas Pro Media adheres to UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection (PDPL) and international data governance protocols.
            </p>
            <p className="text-xs text-text-muted">
              For privacy inquiries or asset deletion requests, email our data team at:{" "}
              <a href="mailto:privacy@yaspromedia.com" className="text-brand-purple-light underline hover:text-white transition-colors">
                privacy@yaspromedia.com
              </a>{" "}
              or reach our Dubai Head Office at Iris Bay Tower, Business Bay, Dubai, UAE.
            </p>
          </section>
        </div>
      </Container>
    </Section>
  );
}
