import type { Metadata } from "next";

// Page-level Open Graph objects replace the root layout's object in Next.js.
export const SHARED_OPEN_GRAPH = {
  siteName: "Yas Pro | AI Media Hub",
  locale: "en_US",
} satisfies Pick<NonNullable<Metadata["openGraph"]>, "siteName" | "locale">;
