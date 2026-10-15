"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Tag,
  CheckCircle2,
  Clock,
  ExternalLink,
  Percent,
  CalendarCheck,
  Layers,
  ArrowRight,
  Plus,
  Edit3,
  Trash2,
} from "lucide-react";
import { OFFERS_AND_BUNDLES } from "@/features/offers/data";
import type { OfferBundleItem } from "@/features/offers/types";
import type { EnrichedBooking } from "@/lib/actions/bookings-rfp-operations";
import {
  upsertCmsPromoCode,
  togglePromoCodeStatus,
  deleteCmsPromoCode,
  type CmsPromoCode,
  type PromoCodeInput,
} from "@/lib/actions/offers-promo-operations";
import {
  upsertCmsOffer,
  toggleOfferStatus,
  deleteCmsOffer,
  type CmsOfferInput,
  type CmsOfferItem,
} from "@/lib/actions/offers-packages-operations";
import { formatCurrency } from "@/lib/utils";
import {
  AdminPageHeader,
  AdminStatsGrid,
  AdminFilterBar,
  AdminConfirmModal,
} from "@/components/admin";
import { PromoCodeFormModal } from "@/components/admin/forms/PromoCodeFormModal";
import { OfferFormModal } from "@/components/admin/forms/OfferFormModal";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableEmpty,
} from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";

export interface OffersManagerPromoItem extends Partial<CmsPromoCode> {
  code: string;
  discount?: string;
  type?: string;
  eligibility?: string;
}

interface OffersManagerProps {
  initialBookings?: EnrichedBooking[];
  promoCodes: OffersManagerPromoItem[];
  initialOffers?: (OfferBundleItem | CmsOfferItem)[];
}

export function OffersManager({
  initialBookings = [],
  promoCodes,
  initialOffers,
}: OffersManagerProps) {
  const router = useRouter();
  const promoList = promoCodes;
  const [packageList, setPackageList] = useState<(OfferBundleItem | CmsOfferItem)[]>(
    initialOffers && initialOffers.length > 0 ? initialOffers : OFFERS_AND_BUNDLES
  );
  const [prevOffers, setPrevOffers] = useState(initialOffers);
  if (initialOffers && prevOffers !== initialOffers) {
    setPrevOffers(initialOffers);
    setPackageList(initialOffers);
  }

  const [activeTab, setActiveTab] = useState<"catalog" | "promos" | "bookings">("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "bundle" | "offer">("all");

  // Promo Engine state
  const [promoEditing, setPromoEditing] = useState<Partial<PromoCodeInput> | null>(null);
  const [promoDeleting, setPromoDeleting] = useState<OffersManagerPromoItem | null>(null);
  const [promoBusy, setPromoBusy] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoFeedback, setPromoFeedback] = useState<string | null>(null);

  // Package Catalog state
  const [offerEditing, setOfferEditing] = useState<Partial<CmsOfferInput> | null>(null);
  const [offerDeleting, setOfferDeleting] = useState<(OfferBundleItem | CmsOfferItem) | null>(null);
  const [offerBusy, setOfferBusy] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);
  const [offerFeedback, setOfferFeedback] = useState<string | null>(null);

  const [now] = useState(() => Date.now());

  const handleOfferSave = async (offer: CmsOfferInput): Promise<boolean> => {
    setOfferBusy(true);
    setOfferError(null);
    try {
      const res = await upsertCmsOffer(offer);
      if (!res.success) {
        setOfferError(res.error || "Failed to save package.");
        return false;
      }
      setOfferFeedback(res.message || "Package saved.");
      setOfferEditing(null);
      router.refresh();
      return true;
    } catch (err) {
      setOfferError(err instanceof Error ? err.message : "Failed to save package.");
      return false;
    } finally {
      setOfferBusy(false);
    }
  };

  const handleOfferToggle = async (pkg: OfferBundleItem | CmsOfferItem) => {
    setOfferBusy(true);
    try {
      const newActive = pkg.isActive === false;
      const res = await toggleOfferStatus(pkg.id, newActive);
      setOfferFeedback(res.success ? res.message || "Updated." : res.error || "Update failed.");
      if (res.success) {
        setPackageList((prev) =>
          prev.map((item) => (item.id === pkg.id ? { ...item, isActive: newActive } : item))
        );
        router.refresh();
      }
    } finally {
      setOfferBusy(false);
    }
  };

  const handleOfferDelete = async () => {
    if (!offerDeleting) return;
    setOfferBusy(true);
    try {
      const res = await deleteCmsOffer(offerDeleting.id);
      setOfferFeedback(res.success ? res.message || "Deleted." : res.error || "Delete failed.");
      if (res.success) {
        setPackageList((prev) => prev.filter((item) => item.id !== offerDeleting.id));
        router.refresh();
      }
    } finally {
      setOfferBusy(false);
      setOfferDeleting(null);
    }
  };

  const handlePromoSave = async (promo: PromoCodeInput): Promise<boolean> => {
    setPromoBusy(true);
    setPromoError(null);
    try {
      const res = await upsertCmsPromoCode(promo);
      if (!res.success) {
        setPromoError(res.error || "Failed to save promo code.");
        return false;
      }
      setPromoFeedback(res.message || "Promo code saved.");
      setPromoEditing(null);
      router.refresh();
      return true;
    } catch (err) {
      setPromoError(err instanceof Error ? err.message : "Failed to save promo code.");
      return false;
    } finally {
      setPromoBusy(false);
    }
  };

  const handlePromoToggle = async (promo: OffersManagerPromoItem) => {
    if (!promo.id) return;
    const res = await togglePromoCodeStatus(promo.id, !promo.isActive);
    setPromoFeedback(res.success ? res.message || "Updated." : res.error || "Update failed.");
    if (res.success) router.refresh();
  };

  const handlePromoDelete = async () => {
    if (!promoDeleting?.id) return;
    setPromoBusy(true);
    try {
      const res = await deleteCmsPromoCode(promoDeleting.id);
      setPromoFeedback(res.success ? res.message || "Deleted." : res.error || "Delete failed.");
      if (res.success) router.refresh();
    } finally {
      setPromoBusy(false);
      setPromoDeleting(null);
    }
  };

  const offerBookings = initialBookings.filter(
    (b) => b.referenceCode.startsWith("YAS-OFR")
  );

  const [catalogPage, setCatalogPage] = useState(0);
  const [promoPage, setPromoPage] = useState(0);
  const pageSize = 6;

  const filteredPackages = packageList.filter((pkg) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      pkg.name.toLowerCase().includes(q) ||
      pkg.nameAr.toLowerCase().includes(q) ||
      (pkg.tagline && pkg.tagline.toLowerCase().includes(q)) ||
      (pkg.description && pkg.description.toLowerCase().includes(q)) ||
      (Array.isArray(pkg.features) && pkg.features.some((f) => f.toLowerCase().includes(q)));

    const matchesCategory =
      categoryFilter === "all" || pkg.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const catalogTotal = filteredPackages.length;
  const catalogPageCount = Math.ceil(catalogTotal / pageSize) || 1;
  const safeCatalogPage = Math.min(catalogPage, Math.max(0, catalogPageCount - 1));
  const catalogStartIndex = safeCatalogPage * pageSize;
  const catalogEndIndex = Math.min(catalogStartIndex + pageSize, catalogTotal);
  const paginatedPackages = filteredPackages.slice(catalogStartIndex, catalogEndIndex);

  const promoTotal = promoList.length;
  const promoPageCount = Math.ceil(promoTotal / pageSize) || 1;
  const safePromoPage = Math.min(promoPage, Math.max(0, promoPageCount - 1));
  const promoStartIndex = safePromoPage * pageSize;
  const promoEndIndex = Math.min(promoStartIndex + pageSize, promoTotal);
  const paginatedPromos = promoList.slice(promoStartIndex, promoEndIndex);

  const totalBundles = packageList.filter((p) => p.category === "bundle").length;
  const totalSpecialOffers = packageList.filter((p) => p.category === "offer").length;


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
            value: packageList.length,
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
          { id: "catalog", label: "Package Catalog", count: packageList.length },
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
          <div className="p-5 rounded-2xl bg-brand-violet/15 border border-brand-mauve/20 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles size={15} className="text-brand-mauve" />
                <span>Turnkey Packages & Soundstage Lockouts</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Manage bundle pricing in AED, session duration, included deliverables, marketing badges, and scheduling restrictions. Any changes update the live checkout wizard immediately.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setOfferError(null); setOfferEditing({}); }}
              className="px-4 py-2.5 rounded-xl btn-brand text-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus size={16} />
              <span>New Package</span>
            </button>
          </div>

          {offerFeedback && (
            <div role="status" className="p-3 rounded-xl bg-brand-violet/15 border border-brand-mauve/20 text-xs text-brand-lavender">
              {offerFeedback}
            </div>
          )}

          <AdminFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search bundle by name, Arabic title, features, or keywords..."
            filterValue={categoryFilter}
            onFilterChange={(v) => setCategoryFilter(v as typeof categoryFilter)}
            filterOptions={[
              { id: "all", label: "All Packages", count: packageList.length },
              { id: "bundle", label: "Production Bundles", count: totalBundles },
              { id: "offer", label: "Creator & Special Offers", count: totalSpecialOffers },
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedPackages.map((pkg) => (
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
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          pkg.isActive === false
                            ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                            : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                        }`}
                      >
                        {pkg.isActive === false ? "Disabled" : "Active"}
                      </span>
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

                {/* Footer Pricing & Actions */}
                <div className="p-5 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/20">
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

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setOfferError(null);
                        setOfferEditing({
                          id: pkg.id,
                          category: pkg.category,
                          name: pkg.name,
                          nameAr: pkg.nameAr,
                          tagline: pkg.tagline,
                          taglineAr: pkg.taglineAr,
                          description: pkg.description,
                          descriptionAr: pkg.descriptionAr,
                          price: pkg.price,
                          originalPrice: pkg.originalPrice,
                          savings: pkg.savings,
                          savingsAr: pkg.savingsAr,
                          hours: pkg.hours,
                          badge: pkg.badge,
                          badgeAr: pkg.badgeAr,
                          image: pkg.image,
                          features: pkg.features,
                          featuresAr: pkg.featuresAr,
                          restrictedDays: pkg.restrictedDays,
                          restrictionNoteEn: pkg.restrictionNoteEn,
                          restrictionNoteAr: pkg.restrictionNoteAr,
                          isActive: pkg.isActive !== false,
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Edit package"
                      aria-label={`Edit package ${pkg.name}`}
                    >
                      <Edit3 size={12} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOfferToggle(pkg)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 cursor-pointer transition-colors"
                      title={pkg.isActive === false ? "Enable package" : "Pause package"}
                    >
                      {pkg.isActive === false ? "Enable" : "Pause"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOfferDeleting(pkg)}
                      className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
                      aria-label={`Delete package ${pkg.name}`}
                      title="Delete package"
                    >
                      <Trash2 size={13} />
                    </button>

                    <Link
                      href={`/offers?pkg=${pkg.id}`}
                      target="_blank"
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-colors flex items-center gap-1"
                      title="Open and test in client booking wizard"
                    >
                      <span>Test Wizard</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <PaginationControls
            currentPage={safeCatalogPage}
            pageCount={catalogPageCount}
            total={catalogTotal}
            startIndex={catalogStartIndex}
            endIndex={catalogEndIndex}
            onPrev={() => setCatalogPage((p) => Math.max(0, p - 1))}
            onNext={() => setCatalogPage((p) => Math.min(catalogPageCount - 1, p + 1))}
            variant="card"
          />

          <OfferFormModal
            isOpen={offerEditing !== null}
            onClose={() => setOfferEditing(null)}
            onSave={handleOfferSave}
            initialOffer={offerEditing}
            isSubmitting={offerBusy}
            error={offerError}
          />
          <AdminConfirmModal
            isOpen={offerDeleting !== null}
            onClose={() => setOfferDeleting(null)}
            onConfirm={handleOfferDelete}
            title="Delete package?"
            message={`Permanently remove "${offerDeleting?.name}"? You can also Pause it instead to hide it without deleting.`}
            confirmLabel="Delete Package"
            isSubmitting={offerBusy}
          />
        </div>
      )}

      {/* TAB 2: Promo Codes */}
      {activeTab === "promos" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-brand-violet/15 border border-brand-mauve/20 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Percent size={15} className="text-brand-mauve" />
                <span>Promo Code Engine</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Database codes take effect instantly at checkout and override same-name built-in codes. Built-in codes
                can be overridden or disabled by saving them as a database promo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setPromoError(null); setPromoEditing({}); }}
              className="px-4 py-2.5 rounded-xl btn-brand text-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus size={16} />
              <span>New Promo Code</span>
            </button>
          </div>

          {promoFeedback && (
            <div role="status" className="p-3 rounded-xl bg-brand-violet/15 border border-brand-mauve/20 text-xs text-brand-lavender">
              {promoFeedback}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paginatedPromos.map((promo) => {
                  const expired = promo.expiresAt ? new Date(promo.expiresAt).getTime() < now : false;
                  const eligibility =
                    promo.eligibility ||
                    (promo.eligibleOfferIds?.length
                      ? promo.eligibleOfferIds
                          .map((id) => OFFERS_AND_BUNDLES.find((o) => o.id === id)?.name || id)
                          .join(", ")
                      : "All valid offers & bundles");
                  const displayDiscount =
                    promo.discount ||
                    (promo.discountPercent != null
                      ? `${promo.discountPercent}% OFF`
                      : `${formatCurrency(Number(promo.discountAmount || 0))} OFF`);
                  const displayLabel =
                    promo.label || promo.type || (promo.source === "static" ? "Built-in code" : "Promo");
                  const isActive = promo.isActive ?? true;

                  return (
                    <div
                      key={promo.id || promo.code}
                      className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-xl bg-brand-mauve/20 border border-brand-mauve/40 text-brand-mauve font-mono font-bold text-sm">
                          {promo.code}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                            !isActive || expired
                              ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                              : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                          }`}
                        >
                          {!isActive ? "Disabled" : expired ? "Expired" : "Active"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xl font-bold font-mono text-white block">
                          {displayDiscount}
                        </span>
                        <span className="text-xs font-semibold text-slate-300 block mt-0.5">
                          {displayLabel}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1">{eligibility}</p>
                        <p className="text-[11px] text-slate-500 mt-1 font-mono">
                          Used {promo.usageCount ?? 0}
                          {promo.maxUses ? ` / ${promo.maxUses}` : ""}
                          {promo.expiresAt
                            ? ` · Expires ${new Date(promo.expiresAt).toLocaleDateString("en-GB")}`
                            : ""}
                        </p>
                      </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setPromoError(null);
                        setPromoEditing({
                          id: promo.id,
                          code: promo.code,
                          label: promo.label ?? undefined,
                          discountPercent: promo.discountPercent,
                          discountAmount: promo.discountAmount,
                          eligibleOfferIds: promo.eligibleOfferIds,
                          expiresAt: promo.expiresAt ? new Date(promo.expiresAt).toISOString() : null,
                          maxUses: promo.maxUses,
                          isActive: promo.isActive,
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                    {promo.source === "database" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handlePromoToggle(promo)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 cursor-pointer"
                        >
                          {promo.isActive ? "Disable" : "Enable"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPromoDeleting(promo)}
                          aria-label={`Delete promo ${promo.code}`}
                          className="ms-auto p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                );
              })}
          </div>

          <PaginationControls
            currentPage={safePromoPage}
            pageCount={promoPageCount}
            total={promoTotal}
            startIndex={promoStartIndex}
            endIndex={promoEndIndex}
            onPrev={() => setPromoPage((p) => Math.max(0, p - 1))}
            onNext={() => setPromoPage((p) => Math.min(promoPageCount - 1, p + 1))}
            variant="card"
          />

          <PromoCodeFormModal
            isOpen={promoEditing !== null}
            onClose={() => setPromoEditing(null)}
            onSave={handlePromoSave}
            initialPromo={promoEditing}
            offerOptions={OFFERS_AND_BUNDLES.map((o) => ({ id: o.id, name: o.name }))}
            isSubmitting={promoBusy}
            error={promoError}
          />
          <AdminConfirmModal
            isOpen={promoDeleting !== null}
            onClose={() => setPromoDeleting(null)}
            onConfirm={handlePromoDelete}
            title="Delete promo code?"
            message={`"${promoDeleting?.code}" will stop working at checkout. Existing bookings keep their recorded code.`}
            confirmLabel="Delete"
            isSubmitting={promoBusy}
          />
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
