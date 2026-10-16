import { connection } from "next/server";
import { getCmsPodcastSets, getCmsPodcastAddons, getCmsPodcastServices } from "@/lib/actions/podcast-operations";
import type { Metadata } from "next";
import { PodcastBookingWizard } from "@/features/podcast-booking/components/PodcastBookingWizard";
import { HelpCircle } from "lucide-react";
import { JsonLd, YAS_PRO_ORGANIZATION_SCHEMA } from "@/components/seo/JsonLd";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { BookingHero } from "@/features/booking/components/ui/BookingKit";

import { SITE_URL } from "@/lib/constants";
import { SHARED_OPEN_GRAPH } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Podcast Studio Booking in Dubai",
  description:
    "Book a luxury podcast studio session at Yas Pro in Business Bay, Dubai. 4K multi-cam Sony capture, Shure SM7B mics, live switcher, and turnkey viral reels editing.",
  keywords: [
    "podcast studio dubai",
    "podcast booking dubai",
    "record podcast dubai",
    "business bay podcast studio",
    "video podcast recording",
    "vodcast studio uae",
  ],
  openGraph: {
    ...SHARED_OPEN_GRAPH,
    title: "Podcast Studio Booking in Dubai • Yas Pro",
    description:
      "Book your luxury 4K multi-cam podcast session with Sony capture and Shure SM7B mics in Business Bay, Dubai.",
    url: `${SITE_URL}/podcast-booking`,
    images: [
      {
        url: `${SITE_URL}/images/studios/nature-grid.jpg`,
        width: 1200,
        height: 630,
        alt: "Yas Pro Podcast Studio Dubai",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Podcast Studio Booking in Dubai • Yas Pro",
    description:
      "Book your luxury 4K multi-cam podcast session with Sony capture and Shure SM7B mics in Business Bay, Dubai.",
    images: [`${SITE_URL}/images/studios/nature-grid.jpg`],
  },
  alternates: {
    canonical: `${SITE_URL}/podcast-booking`,
  },
};

const PODCAST_BOOKING_SCHEMA = {
  ...YAS_PRO_ORGANIZATION_SCHEMA,
  "@type": "EntertainmentBusiness",
  name: "Yas Pro Luxury Podcast Studios Dubai",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Iris Bay Tower, Business Bay",
    addressLocality: "Dubai",
    addressCountry: "AE",
  },
  priceRange: "AED 390 - AED 1,999",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Podcast Recording Packages",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Podcast Recording Only",
          description: "Raw footage from 3x Cinema cameras and Shure SM7B mics with studio operator.",
        },
        priceCurrency: "AED",
        price: "390",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Podcast Recording + Live Mix",
          description: "Live-switched multi-camera program feed with synced audio ready for export.",
        },
        priceCurrency: "AED",
        price: "490",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Podcast Recording + Professional Edit",
          description: "Full master episode edit, color grading, sound mastering, and logo/music integration.",
        },
        priceCurrency: "AED",
        price: "890",
      },
    ],
  },
};

const PODCAST_SPECS = [
  { label: "Capture", value: "3x 4K Sony Cinema Cameras" },
  { label: "Audio", value: "Shure SM7B Vocal Suite + RØDECaster" },
  { label: "Acoustics", value: "Class A Isolated Soundstage" },
  { label: "Location", value: "Iris Bay Tower, Level 18 · Dubai" },
];

export default async function PodcastBookingPage() {
  await connection();
  const [studios, addons, services] = await Promise.all([
    getCmsPodcastSets(),
    getCmsPodcastAddons(),
    typeof getCmsPodcastServices === "function" ? getCmsPodcastServices() : Promise.resolve(undefined),
  ]);
  return (
    <Section id="podcast-booking-page" aria-labelledby="podcast-booking-title" className="py-6 sm:py-12 md:py-20 bg-background">
      <JsonLd data={PODCAST_BOOKING_SCHEMA} />
      <Container>
        {/* Cinematic Booking Hero */}
        <BookingHero
          headingId="podcast-booking-title"
          eyebrow="Acoustic Pods · 4K Multi-Cam · Level 18"
          title="Podcast Studio"
          accent="Booking"
          description="Record your show in acoustically engineered suites with 4K cinema cameras, broadcast Shure mics, an on-site engineer, and rapid post-production."
          specs={PODCAST_SPECS}
          crossLink={{
            href: "/studio-booking",
            label: "Need a film soundstage or virtual XR volume instead?",
            cta: "View Full Soundstages",
          }}
        />

        {/* Wizard */}
        <PodcastBookingWizard studios={studios} addons={addons} services={services} />

        {/* Studio FAQ Section */}
        <div className="max-w-4xl mx-auto mt-20 pt-16 border-t border-white/10 space-y-8">
          <div className="text-center space-y-2">
            <div className="size-10 rounded-2xl bg-brand-mauve/10 border border-brand-mauve/20 text-brand-mauve flex items-center justify-center mx-auto shadow-sm shadow-brand-violet/20">
              <HelpCircle size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs text-zinc-400">Everything you need to know about recording at Yas Pro</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <h3 className="font-bold text-white text-sm">How early should I arrive?</h3>
              <p className="text-zinc-400 leading-relaxed">
                We recommend arriving 15 minutes before your scheduled start time so our engineer can mic you up, test audio levels, and frame your camera shots.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <h3 className="font-bold text-white text-sm">How do I get my recorded files?</h3>
              <p className="text-zinc-400 leading-relaxed">
                If you choose Recording Only or Live Mix, bring a high-speed SSD USB-C drive for instant transfer. For Professional Edit packages, masters are delivered via private cloud download within 3-5 business days.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <h3 className="font-bold text-white text-sm">Can I bring remote guests via Zoom or Riverside?</h3>
              <p className="text-zinc-400 leading-relaxed">
                Yes! Our switcher and mixer are fully patched to feed remote callers directly into our studio monitors and recording tracks with zero latency.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <h3 className="font-bold text-white text-sm">What payment methods are accepted?</h3>
              <p className="text-zinc-400 leading-relaxed">
                We accept Apple Pay, Google Pay, Visa, Mastercard through secure Ziina checkout, or direct payment at our reception desk.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
