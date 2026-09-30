import type { Metadata, Viewport } from "next";
import { Inter, Poppins, Noto_Sans_Arabic } from "next/font/google";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { NextIntlClientProvider } from "next-intl";
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

// Arabic typeface — loaded lazily (no preload) to avoid wasting bandwidth for EN users
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
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
    default: "iYasPro | AI Media Hub",
    template: "%s | iYasPro",
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
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

import { LanguageProvider, type Language } from "@/components/providers/LanguageProvider";
import { getLocale, getMessages } from "next-intl/server";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let locale: Language = "en";
  let messages = {};
  try {
    const rawLocale = await getLocale();
    if (rawLocale === "ar" || rawLocale === "en") {
      locale = rawLocale;
    }
    messages = await getMessages();
  } catch {
    locale = "en";
  }

  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${inter.variable} ${poppins.variable} ${notoSansArabic.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Blocking inline script — runs before React hydrates, before first paint.
          Reads pathname and localStorage and sets html[lang] + html[dir] immediately
          so there is zero flash-of-wrong-direction for returning Arabic users while
          honoring explicit /en and /ar paths.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try {
    var path = window.location.pathname;
    if (path === '/en' || path.indexOf('/en/') === 0) {
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    } else if (path === '/ar' || path.indexOf('/ar/') === 0) {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    } else {
      var lang = localStorage.getItem('yaspro_lang');
      if (lang === 'ar') {
        document.documentElement.lang = 'ar';
        document.documentElement.dir = 'rtl';
      }
    }
  } catch(e) {}
  // Suppress benign Three.js / WebGPU console noise
  var w = console.warn;
  console.warn = function() {
    var s = Array.prototype.join.call(arguments, ' ');
    if (
      s.indexOf('Multiple instances of Three.js') !== -1 ||
      s.indexOf('updating from') !== -1 ||
      s.indexOf('THREE.Clock') !== -1
    ) { return; }
    w.apply(console, arguments);
  };
})();`,
          }}
        />
      </head>
      <body className="min-h-screen w-full bg-background text-foreground antialiased overflow-x-hidden">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LanguageProvider initialLocale={locale}>
            <SmoothScrollProvider>{children}</SmoothScrollProvider>
          </LanguageProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
