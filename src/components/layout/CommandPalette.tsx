"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Command,
  Film,
  Camera,
  Users,
  Building,
  CalendarCheck,
  ShieldCheck,
  Radio,
  FileSpreadsheet,
  Globe,
  X,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Layers,
  LayoutDashboard,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface PaletteCommand {
  id: string;
  title: string;
  category: "Navigation" | "Client Portal" | "Enterprise Vault" | "Admin CMS" | "Quick Actions";
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href?: string;
  action?: () => void;
  keywords?: string;
  badge?: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { toggleLanguage, isArabic } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => {
          if (!prev) {
            setQuery("");
            setSelectedIndex(0);
          }
          return !prev;
        });
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomTrigger = () => {
      setQuery("");
      setSelectedIndex(0);
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleCustomTrigger);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleCustomTrigger);
    };
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const COMMANDS: PaletteCommand[] = useMemo(
    () => [
      // Navigation
      {
        id: "nav-book",
        title: "Book Studio Soundstage",
        category: "Navigation",
        icon: Sparkles,
        href: "/studio-booking",
        keywords: "soundstage rental stage a b c cyc podcast",
        badge: "Instant Book",
      },
      {
        id: "nav-gear",
        title: "Cinema Gear & Equipment Rental",
        category: "Navigation",
        icon: Camera,
        href: "/shop",
        keywords: "camera lenses arri red lighting audio tripod",
      },
      {
        id: "nav-creators",
        title: "Creators & Influencers Hub",
        category: "Navigation",
        icon: Users,
        href: "/influencers",
        keywords: "influencer creators talent mawthooq aboflah",
      },
      {
        id: "nav-enterprise",
        title: "Enterprise Solutions & Sovereign Media",
        category: "Navigation",
        icon: Building,
        href: "/enterprise",
        keywords: "government rfp tender ministry ob van virtual production",
      },
      {
        id: "nav-projects",
        title: "Productions Portfolio",
        category: "Navigation",
        icon: Film,
        href: "/projects",
        keywords: "films commercial shows tvc series showcase",
      },
      {
        id: "nav-contact",
        title: "Contact Concierge Desk",
        category: "Navigation",
        icon: PhoneCall,
        href: "/contact",
        keywords: "support help whatsapp location address dubai",
      },

      // Client Portal
      {
        id: "portal-dashboard",
        title: "Client Portal: Overview",
        category: "Client Portal",
        icon: LayoutDashboard,
        href: "/portal",
        keywords: "client user dashboard account",
      },
      {
        id: "portal-bookings",
        title: "Client Portal: My Bookings & Call Sheets",
        category: "Client Portal",
        icon: CalendarCheck,
        href: "/portal/bookings",
        keywords: "my reservations sessions call sheet history",
      },
      {
        id: "portal-invoices",
        title: "Client Portal: Billing & Invoices",
        category: "Client Portal",
        icon: FileSpreadsheet,
        href: "/portal/invoices",
        keywords: "billing payments receipts deposit tax vat",
      },

      // Enterprise Vault
      {
        id: "ent-vault",
        title: "Enterprise Vault: Executive Overview",
        category: "Enterprise Vault",
        icon: ShieldCheck,
        href: "/enterprise/portal",
        keywords: "sovereign enterprise dashboard vault",
        badge: "Accredited",
      },
      {
        id: "ent-dailies",
        title: "Enterprise Vault: C2C Dailies Vault",
        category: "Enterprise Vault",
        icon: Film,
        href: "/enterprise/portal/dailies",
        keywords: "camera to cloud footage prores raw dailies player",
      },
      {
        id: "ent-rfps",
        title: "Enterprise Vault: Active Tenders Ledger",
        category: "Enterprise Vault",
        icon: FileSpreadsheet,
        href: "/enterprise/portal/rfps",
        keywords: "tender rfp mawthooq lookup reference",
      },
      {
        id: "ent-telemetry",
        title: "Enterprise Vault: Live Telemetry Bus",
        category: "Enterprise Vault",
        icon: Radio,
        href: "/enterprise/portal/telemetry",
        keywords: "smpte 2110 relay ob van gps live stream edge",
      },

      // Admin CMS
      {
        id: "admin-overview",
        title: "Admin CMS: Operations Overview",
        category: "Admin CMS",
        icon: LayoutDashboard,
        href: "/admin",
        keywords: "system metrics neon stats drizzle",
        badge: "Admin",
      },
      {
        id: "admin-bookings",
        title: "Admin CMS: Studio Bookings Desk",
        category: "Admin CMS",
        icon: CalendarCheck,
        href: "/admin/bookings",
        keywords: "call sheets reconcile payments approve",
      },
      {
        id: "admin-users",
        title: "Admin CMS: Registered Users & Permissions",
        category: "Admin CMS",
        icon: Users,
        href: "/admin/users",
        keywords: "roles clients accounts enterprise promote",
      },
      {
        id: "admin-rfps",
        title: "Admin CMS: Enterprise RFPs & Tenders",
        category: "Admin CMS",
        icon: FileSpreadsheet,
        href: "/admin/rfps",
        keywords: "inspect proposal approve sla",
      },
      {
        id: "admin-gear",
        title: "Admin CMS: Gear & Inventory Catalog",
        category: "Admin CMS",
        icon: Camera,
        href: "/admin/gear",
        keywords: "equipment rates cameras lighting kits",
      },
      {
        id: "admin-studios",
        title: "Admin CMS: Soundstages & Rates",
        category: "Admin CMS",
        icon: Layers,
        href: "/admin/studios",
        keywords: "stages rates cyc acoustic virtual production",
      },

      // Quick Actions
      {
        id: "action-lang",
        title: isArabic ? "Switch to English Interface" : "التبديل إلى الواجهة العربية",
        category: "Quick Actions",
        icon: Globe,
        action: () => toggleLanguage(),
        keywords: "language arabic english ترجمة لغة",
        badge: isArabic ? "EN" : "العربية",
      },
    ],
    [isArabic, toggleLanguage]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return COMMANDS;
    return COMMANDS.filter((cmd) => {
      const matchTitle = cmd.title.toLowerCase().includes(q);
      const matchCat = cmd.category.toLowerCase().includes(q);
      const matchKey = cmd.keywords?.toLowerCase().includes(q);
      return matchTitle || matchCat || matchKey;
    });
  }, [query, COMMANDS]);

  const executeCommand = (cmd: PaletteCommand) => {
    setIsOpen(false);
    if (cmd.action) {
      cmd.action();
    } else if (cmd.href) {
      router.push(cmd.href);
    }
  };

  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = filtered[selectedIndex];
      if (current) executeCommand(current);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-[12vh] animate-fade-in select-none"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Universal Command Palette"
    >
      <div
        className="w-full max-w-xl bg-slate-900 border border-purple-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-purple-900/30 overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3 bg-white/[0.02]">
          <Search size={18} className="text-purple-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, stage, gear, or jump to page... (e.g. 'book', 'gear', 'admin')"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownInInput}
            className="flex-1 bg-transparent text-white placeholder:text-slate-500 text-sm focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-white/10 text-slate-400 text-[10px] font-mono">
            ESC
          </kbd>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white sm:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              No matching modules or actions found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-purple-600/30 text-white border border-purple-500/40"
                      : "text-slate-300 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`size-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-purple-600 text-white"
                          : "bg-white/5 text-purple-400"
                      }`}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="truncate">
                      <span className="font-semibold">{cmd.title}</span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {cmd.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cmd.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {cmd.badge}
                      </span>
                    )}
                    {isSelected && (
                      <ArrowRight size={13} className="text-purple-400 rtl:rotate-180" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-white/10 bg-white/[0.01] flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span>&uarr;&darr; Navigate</span>
            <span>&crarr; Select</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-400">
            <Command size={12} />
            <span>YasPro Quick Control</span>
          </div>
        </div>
      </div>
    </div>
  );
}
