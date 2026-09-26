import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface FooterLinkItem {
  readonly label: string;
  readonly href: string;
  readonly icon?: LucideIcon;
  readonly isExternal?: boolean;
}

export interface FooterNavLinksProps {
  links: readonly FooterLinkItem[];
}

export function FooterNavLinks({ links }: FooterNavLinksProps) {
  return (
    <ul className="space-y-2.5">
      {links.map((link) => {
        const Icon = link.icon;

        return (
          <li key={`${link.label}-${link.href}`}>
            <Link
              href={link.href}
              className="group/item flex items-center justify-between py-1 text-sm text-text-secondary hover:text-white transition-all duration-200"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {Icon && (
                  <span className="flex items-center justify-center size-5 rounded-md bg-white/[0.04] group-hover/item:bg-brand-purple/20 text-brand-purple-mid group-hover/item:text-brand-purple-light border border-white/[0.06] group-hover/item:border-brand-purple/30 transition-all shrink-0">
                    <Icon size={11} />
                  </span>
                )}
                <span className="truncate group-hover/item:translate-x-0.5 transition-transform duration-200">
                  {link.label}
                </span>
              </div>

              {link.isExternal ? (
                <ArrowUpRight
                  size={13}
                  className="text-text-muted group-hover/item:text-brand-cyan group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-all shrink-0 ml-1.5 opacity-60 group-hover/item:opacity-100"
                />
              ) : (
                <ChevronRight
                  size={13}
                  className="text-text-muted group-hover/item:text-brand-purple-light group-hover/item:translate-x-1 transition-all shrink-0 ml-1.5 opacity-40 group-hover/item:opacity-100"
                />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
