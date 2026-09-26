"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
            {/* Language Switcher */}
            <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-1 text-[11px] font-medium backdrop-blur-md">
              <span className="px-2.5 py-1 rounded-full bg-brand-purple text-white font-bold shadow-sm cursor-default">
                EN
              </span>
              <span 
                className="px-2.5 py-1 rounded-full text-text-muted hover:text-white transition-colors cursor-pointer"
                title="العربية (قريباً لشركاء الخليج)"
              >
                العربية
              </span>
            </div>

            <Button
              asChild
              variant="brand"
              size="default"
              className="hidden sm:inline-flex rounded-full shadow-lg shadow-brand-purple/20 gap-2 text-xs uppercase tracking-wider font-semibold"
            >
              <Link href="/studio-booking">
                <Sparkles size={14} />
                <span>Book Studio</span>
              </Link>
            </Button>

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
