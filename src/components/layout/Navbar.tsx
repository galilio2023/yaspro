"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";
import { MobileNavDrawer, NavLinkItem } from "./MobileNavDrawer";
import { NavbarUserMenu } from "./NavbarUserMenu";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useCart } from "@/components/providers/CartProvider";

import { useSession } from "@/lib/auth-client";

export interface NavItemConfig extends NavLinkItem {
  key: string;
}

const NAV_LINKS: readonly NavItemConfig[] = [
  { key: "nav.projects", label: "Projects", href: "/projects" },
  { key: "nav.soundstages", label: "Soundstages", href: "/studios" },
  { key: "nav.gear", label: "Gear Rental", href: "/shop" },
  { key: "nav.creators", label: "Creators", href: "/influencers" },
  { key: "nav.about", label: "About", href: "/about" },
  { key: "nav.contact", label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const { language, toggleLanguage, t, isArabic } = useLanguage();
  const { data: session } = useSession();
  const { totalCount, openCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      dir={isArabic ? "rtl" : "ltr"}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-black/85 backdrop-blur-md sm:backdrop-blur-2xl border-b border-white/[0.08] shadow-lg shadow-black/30"
          : "bg-black/40 backdrop-blur-sm sm:backdrop-blur-md border-b border-white/[0.04]"
      )}
    >
      <nav
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">

          {/* ── Brand Logo ── */}
          <BrandLogo />

          {/* ── Center: Desktop Nav Links ── */}
          <ul className="hidden lg:flex items-center gap-0.5 xl:gap-1" role="list">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "px-2.5 py-1.5 xl:px-3 rounded-lg text-[12px] xl:text-[13px] font-medium transition-all duration-200 whitespace-nowrap",
                      isActive
                        ? "text-white bg-white/10"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                    )}
                  >
                    {t(link.key) || link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* ── Action Strip ── */}
          <div className="flex items-center gap-2">

            {/* Persistent Gear Cart Trigger (Desktop only; on mobile it is in the drawer) */}
            <button
              onClick={openCart}
              type="button"
              className="hidden lg:flex relative p-2 rounded-full border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer items-center justify-center"
              title={language === "ar" ? "سلة استئجار المعدات" : "Cinema Gear Cart"}
              aria-label="View Cinema Gear Cart"
            >
              <ShoppingBag size={14} className="text-zinc-300" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 size-4 bg-brand-mauve text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-md animate-scale-in">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Language Toggle (Desktop only) */}
            <button
              onClick={toggleLanguage}
              type="button"
              className="hidden lg:inline-flex text-[11px] font-semibold text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-full border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all cursor-pointer font-latin"
              aria-label="Switch language"
            >
              {language === "en" ? "العربية" : "EN"}
            </button>

            {/* Portal Link / User Status Dropdown (Desktop only) */}
            <div className="hidden lg:flex items-center">
              {session?.user ? (
                <NavbarUserMenu user={session.user} />
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-300 hover:text-white px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all"
                >
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  <span className="max-w-[110px] truncate">{t("nav.portal")}</span>
                </Link>
              )}
            </div>


            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2.5 rounded-full border border-white/10 text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <MobileNavDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pathname={pathname}
        navLinks={NAV_LINKS}
      />
    </header>
  );
}
