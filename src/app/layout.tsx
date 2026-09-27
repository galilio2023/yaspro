import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { WhatsAppConcierge } from "@/components/common/WhatsAppConcierge";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const getSiteUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://yaspro-tablawy.vercel.app";
};

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Yas Pro | AI Media Hub",
    template: "%s | Yas Pro",
  },
  description:
    "The fastest-growing production company in the Gulf region. AI-powered media production, studio booking, equipment rental, and influencer content creation.",
  keywords: [
    "media production",
    "AI media",
    "studio booking",
    "UAE production",
    "influencer production",
    "OB Van",
    "live broadcast",
    "Dubai media",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Yas Pro | AI Media Hub",
    title: "Yas Pro | AI Media Hub & Virtual Production Dubai",
    description:
      "Premier Dubai media production house: 4K virtual production soundstages, turnkey cinema camera & lighting rental, MENA creator roster, and live stadium broadcasting.",
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        secureUrl: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Yas Pro | AI Media Hub & Virtual Production Dubai",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yas Pro | AI Media Hub & Virtual Production Dubai",
    description:
      "Premier Dubai media production house: 4K virtual production soundstages, turnkey cinema camera & lighting rental, MENA creator roster, and live stadium broadcasting.",
    images: [`${siteUrl}/opengraph-image`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var w=console.warn;console.warn=function(){var m=arguments[0];if(typeof m==='string'&&(m.indexOf('Multiple instances of Three.js')!==-1||m.indexOf('THREE.Clock: This module has been deprecated')!==-1)){return;}w.apply(console,arguments);};})();`,
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen w-full bg-background text-foreground antialiased overflow-x-hidden">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-purple focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1 w-full flex flex-col items-center">
          {children}
        </main>
        <Footer />
        <WhatsAppConcierge />
      </body>
    </html>
  );
}

