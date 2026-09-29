import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { UnifiedFloatingActions } from "@/components/layout/UnifiedFloatingActions";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
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
      <UnifiedFloatingActions />
    </>
  );
}
