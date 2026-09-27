"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";
import { NavLinks } from "./NavLinks";
import { MobileNavDrawer, NavLinkItem } from "./MobileNavDrawer";

const NAV_LINKS: readonly NavLinkItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Equipment", href: "/shop" },
  { label: "Influencers", href: "/influencers" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/40"
          : "bg-background/60 backdrop-blur-md border-b border-white/5"
      )}
    >
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 lg:h-20">
          {/* Brand Logo */}
          <BrandLogo />

          {/* Desktop Navigation Links */}
          <NavLinks links={NAV_LINKS} />

          {/* Right Action CTA */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/studio-booking"
              className="relative group hidden sm:inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
            >
              {/* Luminous Ambient Halo Glow */}
              <span className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-teal opacity-50 blur-sm group-hover:opacity-100 group-hover:blur-md transition-all duration-300 pointer-events-none" />

              {/* Shimmer Border Gradient Line */}
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-purple via-brand-purple-light/80 to-brand-teal p-[1px] pointer-events-none">
                <span className="block size-full rounded-xl bg-[#090616]" />
              </span>

              {/* Surface Reflection Gloss */}
              <span className="absolute inset-[1px] rounded-xl bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* Active Studio Live Beacon */}
              <span className="relative flex size-2 shrink-0">
                <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              </span>

              {/* Label & Icon */}
              <span className="relative z-10 flex items-center gap-1.5 font-display text-[12px] uppercase tracking-wider text-white group-hover:text-brand-purple-lighter transition-colors">
                <Sparkles size={13} className="text-brand-purple-light group-hover:text-brand-cyan transition-colors" />
                <span>Book Studio</span>
              </span>

              {/* Forward Chevron Affordance */}
              <svg
                viewBox="0 0 16 16"
                className="relative z-10 size-3 text-text-muted group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 12l4-4-4-4" />
              </svg>
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2.5 rounded-xl border border-white/10 text-white bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <MobileNavDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pathname={pathname}
        navLinks={NAV_LINKS}
      />
    </header>
  );
}
