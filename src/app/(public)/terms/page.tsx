import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { FileCheck, Shield, AlertTriangle, Scale } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions governing soundstage booking, equipment rental, outside broadcast dispatch, and creator partnerships with Yas Pro Media LLC.",
};

export default function TermsOfServicePage() {
  return (
    <Section id="terms-of-service" aria-labelledby="terms-title" className="py-12 md:py-20 bg-background">
      <Container className="max-w-4xl">
        <BackButton href="/" label="Back to Home" />

        <SectionHeader
          headingId="terms-title"
          as="h1"
          align="left"
          badge="Commercial Governance"
          badgeVariant="default"
          badgeIcon={<FileCheck size={13} />}
          title="Terms of"
          gradientText="Service"
          description="Last updated: September 2026. Standard commercial conditions governing studio soundstage hire, cinema equipment rental, OB-Van deployment, and influencer production agreements."
        />

        <div className="space-y-8 text-sm text-text-secondary leading-relaxed mt-10">
          <section className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
            <div className="flex items-center gap-3 text-white font-bold text-base mb-3 font-display">
              <Shield size={18} className="text-amber-400" />
              <h2>1. Studio &amp; Equipment Rental Terms</h2>
            </div>
            <p className="mb-3">
              All cinema camera packages (ARRI, RED, Sony Cinema Line), optical primes, and motorized DMX lighting grids require a pre-authorized refundable security deposit and valid commercial credentials prior to dispatch or soundstage check-in.
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-text-muted">
              <li>Rental periods are calculated on a 24-hour calendar shoot basis.</li>
              <li>Equipment must be inspected upon check-in and returned in identical condition.</li>
              <li>Yas Pro technicians and OB-Van engineers retain operational authority over high-voltage power grids and satellite uplink gear.</li>
            </ul>
          </section>

          <section className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
            <div className="flex items-center gap-3 text-white font-bold text-base mb-3 font-display">
              <AlertTriangle size={18} className="text-amber-400" />
              <h2>2. Cancellation &amp; Rescheduling Policy</h2>
            </div>
            <p className="mb-3">
              Soundstage allocations require extensive technical preparation. Cancellations or rescheduling requests must be submitted in writing:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-text-muted">
              <li>More than 72 hours prior to scheduled call time: 100% full credit or refund.</li>
              <li>Between 24 to 72 hours: 50% reservation retention fee.</li>
              <li>Less than 24 hours: Full session fee is retained due to reserved crew and technical lockouts.</li>
            </ul>
          </section>

          <section className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
            <div className="flex items-center gap-3 text-white font-bold text-base mb-3 font-display">
              <Scale size={18} className="text-emerald-400" />
              <h2>3. Governing Jurisdiction</h2>
            </div>
            <p className="text-text-secondary">
              These terms are governed by and construed in accordance with the laws of the Emirate of Dubai and applicable federal laws of the United Arab Emirates. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts of Dubai.
            </p>
          </section>
        </div>
      </Container>
    </Section>
  );
}
