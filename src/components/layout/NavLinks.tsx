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
        "hidden lg:flex items-center gap-1",
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
              "relative px-3.5 py-1.5 text-[12px] font-medium tracking-tight rounded-full transition-all duration-200",
              isActive
                ? "text-white bg-white/10 font-semibold"
                : "text-slate-300/80 hover:text-white hover:bg-white/[0.06]"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
