"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export function BackButton({ href, label = "Back", className }: BackButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-text-secondary hover:text-white mb-8 transition-colors p-2 -ml-2 rounded-xl hover:bg-white/5",
        className
      )}
    >
      <ArrowLeft size={15} />
      <span>{label}</span>
    </Link>
  );
}
