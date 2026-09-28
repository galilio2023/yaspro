import React from "react";

interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Injects a structured JSON-LD Schema.org script into the page head.
 */
export function JsonLd({ data }: JsonLdProps) {
  const jsonString = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}

/**
 * Standard Yas Pro Media Organization & LocalBusiness schema for Dubai Studio HQ
 */
export const YAS_PRO_ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Yas Productions",
  legalName: "Yas Pro Media Productions LLC",
  url: "https://yaspro.ae",
  logo: "https://yaspro.ae/images/logo.png",
  image: "https://yaspro.ae/opengraph-image",
  description:
    "Next-Gen AI Media Production, 4K Soundstages, Outside Broadcast (OB Van), and Talent Hub in Dubai & the Middle East.",
  telephone: "+971-55-401-0465",
  email: "production@yaspro.ae",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Dubai Production City, Media Hub Phase 2",
    addressLocality: "Dubai",
    addressRegion: "Dubai",
    postalCode: "00000",
    addressCountry: "AE",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 25.0345,
    longitude: 55.1912,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
  ],
  sameAs: [
    "https://instagram.com/yasproductions",
    "https://linkedin.com/company/yas-productions",
    "https://vimeo.com/yaspro",
  ],
  priceRange: "$$$$",
};
