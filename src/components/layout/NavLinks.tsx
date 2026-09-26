"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavLinkItem } from "./MobileNavDrawer";

export interface NavLinksProps {
  links: readonly NavLinkItem[];
  className?: string;
}

export function NavLinks({ links, className }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "hidden lg:flex items-center gap-0.5 p-1 rounded-2xl border border-brand-purple/15 bg-background/60 backdrop-blur-xl shadow-inner shadow-brand-purple/5",
        className
      )}
    >
      {links.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative px-4 py-2 text-[11px] uppercase tracking-widest font-bold rounded-xl transition-all duration-200",
              isActive
                ? "text-white bg-gradient-brand shadow-md shadow-brand-purple/40"
                : "text-text-secondary hover:text-white hover:bg-white/5"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
