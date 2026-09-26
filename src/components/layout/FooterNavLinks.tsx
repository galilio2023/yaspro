import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface FooterLinkItem {
  readonly label: string;
  readonly href: string;
}

export interface FooterNavLinksProps {
  links: readonly FooterLinkItem[];
}

export function FooterNavLinks({ links }: FooterNavLinksProps) {
  return (
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={`${link.label}-${link.href}`}>
          <Link
            href={link.href}
            className="text-text-secondary hover:text-white text-sm transition-colors flex items-center gap-1.5 group"
          >
            <span>{link.label}</span>
            <ArrowUpRight
              size={13}
              className="text-text-muted group-hover:text-brand-purple-light transition-colors"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
