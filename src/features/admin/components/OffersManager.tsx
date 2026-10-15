"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Tag,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Percent,
  CalendarCheck,
  Layers,
  ArrowRight,
} from "lucide-react";
import { OFFERS_AND_BUNDLES } from "@/features/offers/data";
import type { OfferBundleItem } from "@/features/offers/types";
import type { EnrichedBooking } from "@/lib/actions/bookings-rfp-operations";
import { formatCurrency } from "@/lib/utils";
import {
  AdminPageHeader,
  AdminStatsGrid,
  AdminFilterBar,
} from "@/components/admin";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableEmpty,
} from "@/components/ui/data-table";

interface OffersManagerProps {
  initialBookings?: EnrichedBooking[];
  promoCodes: { code: string; discount: string; type: string; eligibility: string }[];
}

export function OffersManager({ initialBookings = [], promoCodes }: OffersManagerProps) {
  const [activeTab, setActiveTab] = useState<"catalog" | "promos" | "bookings">("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "bundle" | "offer">("all");

  const offerBookings = initialBookings.filter(
    (b) => b.referenceCode.startsWith("YAS-OFR")
  );

  const filteredPackages = OFFERS_AND_BUNDLES.filter((pkg) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      pkg.name.toLowerCase().includes(q) ||
      pkg.nameAr.toLowerCase().includes(q) ||
      pkg.tagline.toLowerCase().includes(q) ||
      pkg.description.toLowerCase().includes(q) ||
      pkg.features.some((f) => f.toLowerCase().includes(q));

    const matchesCategory =
      categoryFilter === "all" || pkg.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalBundles = OFFERS_AND_BUNDLES.filter((p) => p.category === "bundle").length;
  const totalSpecialOffers = OFFERS_AND_BUNDLES.filter((p) => p.category === "offer").length;
  const avgPackagePrice = Math.round(
    OFFERS_AND_BUNDLES.reduce((acc, curr) => acc + curr.price, 0) /
      OFFERS_AND_BUNDLES.length
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Turnkey Offers & Production Bundles CMS"
        description="Monitor packaged soundstage lockouts, multi-cam live mixing, creator deals, and discount promo engines."
        icon={Sparkles}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/offers"
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Live Offers Page</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <AdminStatsGrid
        columns={4}
        stats={[
          {
            label: "Active Packages",
            value: OFFERS_AND_BUNDLES.length,
            unit: "Bundles",
            icon: Sparkles,
            variant: "brand",
          },
          {
            label: "Production Bundles",
            value: totalBundles,
            unit: "Turnkey",
            icon: Layers,
            variant: "default",
          },
          {
            label: "Creator Perks",
            value: totalSpecialOffers,
            unit: "Offers",
            icon: Tag,
            variant: "default",
          },
          {
            label: "Offer Reservations",
            value: offerBookings.length,
            unit: "Bookings",
            icon: CalendarCheck,
            variant: "success",
          },
        ]}
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        {[
          { id: "catalog", label: "Package Catalog", count: OFFERS_AND_BUNDLES.length },
          { id: "promos", label: "Promo Codes & Discounts", count: promoCodes.length },
          { id: "bookings", label: "Offer Bookings Log", count: offerBookings.length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-brand-violet/25 text-white border border-brand-mauve/30 shadow-md shadow-brand-violet/10"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-slate-300">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: Package Catalog */}
      {activeTab === "catalog" && (
        <div className="space-y-5">
          <AdminFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search bundle by name, Arabic title, features, or keywords..."
            filterValue={categoryFilter}
            onFilterChange={(v) => setCategoryFilter(v as typeof categoryFilter)}
            filterOptions={[
              { id: "all", label: "All Packages", count: OFFERS_AND_BUNDLES.length },
              { id: "bundle", label: "Production Bundles", count: totalBundles },
              { id: "offer", label: "Creator & Special Offers", count: totalSpecialOffers },
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden flex flex-col justify-between hover:border-brand-mauve/30 transition-all shadow-xl group"
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40">
                    <Image
                      src={pkg.image}
                      alt={pkg.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0b10] via-black/30 to-transparent" />
                    <div className="absolute top-3 start-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/20 text-white">
                        {pkg.hours} Hours Session
                      </span>
                      {pkg.badge && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-brand-mauve/20 text-brand-lavender border border-brand-mauve/30">
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    {pkg.savings && (
                      <div className="absolute bottom-3 end-3 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {pkg.savings}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-brand-mauve-soft transition-colors">
                        {pkg.name}
                      </h3>
                      <p className="text-xs text-brand-mauve font-arabic mt-0.5" dir="rtl">
                        {pkg.nameAr}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {pkg.description}
                      </p>
                    </div>

                    {/* Features list */}
                    <div className="pt-3 border-t border-white/5 space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block">
                        Included Deliverables
                      </span>
                      {pkg.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 size={13} className="text-brand-mauve shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{feat}</span>
                        </div>
                      ))}
                      {pkg.features.length > 3 && (
                        <span className="text-[10px] text-slate-500 font-mono block">
                          +{pkg.features.length - 3} additional deliverables
                        </span>
                      )}
                    </div>

                    {/* Restrictions Note */}
                    {pkg.restrictionNoteEn && (
                      <div className="p-2.5 rounded-xl bg-brand-violet/15 border border-brand-mauve/20 text-[11px] text-brand-lavender flex items-center gap-2">
                        <Clock size={13} className="shrink-0 text-brand-mauve" />
                        <span>{pkg.restrictionNoteEn}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Pricing & CTA */}
                <div className="p-5 pt-3 border-t border-white/10 flex items-center justify-between bg-black/20">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold font-mono text-white">
                        {formatCurrency(pkg.price)}
                      </span>
                      {pkg.originalPrice && (
                        <span className="text-xs font-mono text-slate-500 line-through">
                          {formatCurrency(pkg.originalPrice)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Excl. 5% UAE VAT
                    </span>
                  </div>

                  <Link
                    href={`/offers?pkg=${pkg.id}`}
                    target="_blank"
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
                  >
                    <span>Test Wizard</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Promo Codes */}
      {activeTab === "promos" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-brand-violet/15 border border-brand-mauve/20 backdrop-blur-xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Percent size={15} className="text-brand-mauve" />
                <span>Cryptographic &amp; Transactional Promo Engine</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Promo codes in Yas Pro are validated server-side in <code>promo-codes.ts</code> using advisory locks to prevent concurrent race-condition redemptions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {promoCodes.map((promo) => (
              <div
                key={promo.code}
                className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-brand-mauve/20 border border-brand-mauve/40 text-brand-mauve font-mono font-bold text-sm">
                    {promo.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold uppercase">
                    Active
                  </span>
                </div>
                <div>
                  <span className="text-xl font-bold font-mono text-white block">
                    {promo.discount}
                  </span>
                  <span className="text-xs font-semibold text-slate-300 block mt-0.5">
                    {promo.type}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {promo.eligibility}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Offer Bookings Log */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          <DataTable>
            <DataTableHeader>
              <tr>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Scheduled Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </DataTableHeader>
            <DataTableBody>
              {offerBookings.length === 0 ? (
                <DataTableEmpty
                  colSpan={7}
                  message="No turnkey offer bundle bookings recorded yet."
                />
              ) : (
                offerBookings.map((b) => (
                  <DataTableRow key={b.id}>
                    <td className="py-3 px-4 font-mono font-bold text-brand-lavender text-xs">
                      <div>{b.referenceCode}</div>
                      {b.promoCode && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono">
                          PROMO: {b.promoCode}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-white text-xs">
                      {b.packageName || "Turnkey Production Bundle"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white block text-xs">
                        {b.userName || "Direct Client"}
                      </span>
                      {b.userEmail && (
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {b.userEmail}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-300">
                      {new Date(b.scheduledAt).toLocaleDateString("en-US", {
                        timeZone: "Asia/Dubai",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white text-xs">
                      {formatCurrency(Number(b.totalAmount))}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-white/5 border border-white/10 text-slate-300">
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-brand-violet/20 border border-brand-mauve/30 text-brand-lavender">
                        {b.status}
                      </span>
                    </td>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </div>
      )}
    </div>
  );
}
