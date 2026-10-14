"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Camera,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Search,
  ShoppingBag,
  Truck,
  CalendarRange,
  Mail,
  Phone,
  CheckCircle,
  User,
} from "lucide-react";
import {
  upsertCmsEquipment,
  deleteCmsEquipment,
  updateCmsGearOrderStatus,
  updateCmsGearOrderPaymentStatus,
  createManualCmsGearOrder,
  updateCmsGearOrderDetails,
  deleteCmsGearOrder,
  type ManualGearOrderItem,
} from "@/lib/actions/equipment-gear";
import type { Equipment, GearOrder } from "@/db/schema";
import { AdminImageUploader } from "@/components/admin/AdminImageUploader";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
import { useFeedbackAlert } from "@/hooks/useFeedbackAlert";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { DataTable, DataTableHeader, DataTableBody, DataTableRow, DataTableEmpty } from "@/components/ui/data-table";

interface GearManagerProps {
  initialEquipment: Equipment[];
  initialOrders?: GearOrder[];
}

interface OrderFormData {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  deliveryOption: "pickup" | "delivery";
  deliveryAddress: string;
  startDate: string;
  endDate: string;
  rentalDays: number;
  items: ManualGearOrderItem[];
  subtotal: string;
  securityDeposit: string;
  discountAmount: string;
  totalAmount: string;
  currency: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "deposit_paid" | "paid" | "refunded";
  notes: string;
}

export function GearManager({ initialEquipment, initialOrders = [] }: GearManagerProps) {
  const [activeTab, setActiveTab] = useState<"fleet" | "orders">("fleet");
  const [gearList, setGearList] = useState<Equipment[]>(initialEquipment);
  const [ordersList, setOrdersList] = useState<GearOrder[]>(initialOrders);
  const [editingGear, setEditingGear] = useState<Partial<Equipment> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAvailability, setSelectedAvailability] = useState<"all" | "available" | "unavailable">("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Equipment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Orders State & Modals
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<"all" | "unpaid" | "deposit_paid" | "paid" | "refunded">("all");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const [orderFormData, setOrderFormData] = useState<OrderFormData | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderModalError, setOrderModalError] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<GearOrder | null>(null);

  const { feedback, showFeedback, clearFeedback } = useFeedbackAlert(2500);

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const targetId = itemToDelete.id || itemToDelete.slug;
      const res = await deleteCmsEquipment(targetId);
      if (res.success) {
        setGearList((prev) => prev.filter((g) => g.id !== itemToDelete.id && g.slug !== itemToDelete.slug));
        showFeedback(`Removed "${itemToDelete.name}" from fleet inventory.`);
        setItemToDelete(null);
      } else {
        setError(res.error || "Failed to delete equipment item.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete equipment item.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredGear = gearList.filter((g) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      g.name.toLowerCase().includes(q) ||
      (g.arabicName && g.arabicName.toLowerCase().includes(q)) ||
      (g.slug && g.slug.toLowerCase().includes(q)) ||
      (g.description && g.description.toLowerCase().includes(q));
    const matchesCategory = selectedCategory === "all" || g.category === selectedCategory;
    const matchesAvailability =
      selectedAvailability === "all"
        ? true
        : selectedAvailability === "available"
        ? g.isAvailable
        : !g.isAvailable;
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const pagination = usePagination(filteredGear, 15);

  const totalCameras = gearList.filter((g) => g.category === "cameras").length;
  const totalLenses = gearList.filter((g) => g.category === "lenses").length;
  const totalLighting = gearList.filter((g) => g.category === "lighting").length;
  const totalAudio = gearList.filter((g) => g.category === "audio").length;
  const totalAvailable = gearList.filter((g) => g.isAvailable).length;

  const handleOrderStatusChange = async (
    id: string,
    newStatus: "pending" | "confirmed" | "completed" | "cancelled"
  ) => {
    setUpdatingOrderId(id);
    try {
      const res = await updateCmsGearOrderStatus(id, newStatus);
      if (res.success) {
        setOrdersList((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
        );
        showFeedback(`Order marked as ${newStatus}`);
      } else {
        showFeedback(res.error || "Failed to update order status.");
      }
    } catch {
      showFeedback("Failed to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleOrderPaymentChange = async (
    id: string,
    newPayment: "unpaid" | "deposit_paid" | "paid" | "refunded"
  ) => {
    setUpdatingOrderId(id);
    try {
      const res = await updateCmsGearOrderPaymentStatus(id, newPayment);
      if (res.success) {
        setOrdersList((prev) =>
          prev.map((o) => (o.id === id ? { ...o, paymentStatus: newPayment } : o))
        );
        showFeedback(`Payment updated to ${newPayment.replace("_", " ")}`);
      } else {
        showFeedback(res.error || "Failed to update payment status.");
      }
    } catch {
      showFeedback("Failed to update payment status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = ordersList.filter((o) => {
    const q = orderSearchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      o.referenceCode.toLowerCase().includes(q) ||
      o.fullName.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q) ||
      (o.company && o.company.toLowerCase().includes(q));

    const matchesStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
    const matchesPayment = orderPaymentFilter === "all" || o.paymentStatus === orderPaymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const paginationOrders = usePagination(filteredOrders, 15);

  const totalPendingOrders = ordersList.filter((o) => o.status === "pending").length;
  const totalConfirmedOrders = ordersList.filter((o) => o.status === "confirmed").length;
  const totalPaidOrders = ordersList.filter((o) => o.paymentStatus === "paid" || o.paymentStatus === "deposit_paid").length;

  const handleOpenNew = () => {
    setError(null);
    clearFeedback();
    setEditingGear({
      name: "",
      category: "cameras",
      dailyRate: "1500.00",
      securityDeposit: "2000.00",
      description: "",
      imageUrl: "/images/gear/arri-alexa-mini-lf.jpg",
      isPopular: false,
      isKit: false,
      isAvailable: true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGear?.name || !editingGear?.dailyRate || !editingGear?.category) return;

    setIsSubmitting(true);
    setError(null);
    clearFeedback();

    try {
      const res = await upsertCmsEquipment(
        editingGear as Partial<Equipment> & { name: string; dailyRate: string; category: string }
      );

      if (res.success) {
        showFeedback("Equipment updated in Neon DB catalog!");
        setGearList((prev) => {
          const idx = prev.findIndex((g) => g.id === editingGear.id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...editingGear } as Equipment;
            return updated;
          }
          return [
            {
              ...editingGear,
              id: editingGear.id || `gear-${Date.now()}`,
              createdAt: new Date(),
            } as Equipment,
            ...prev,
          ];
        });
        setTimeout(() => {
          setEditingGear(null);
        }, 1200);
      } else {
        setError(res.error || "Failed to update equipment.");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update equipment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open New Rental Order Modal
  const handleOpenNewOrder = () => {
    setOrderModalError(null);
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const initialItem = gearList[0];
    const initialItemRate = initialItem ? Number(initialItem.dailyRate) || 500 : 500;

    setOrderFormData({
      fullName: "",
      email: "",
      phone: "",
      company: "",
      deliveryOption: "pickup",
      deliveryAddress: "",
      startDate: today,
      endDate: tomorrow,
      rentalDays: 1,
      items: initialItem
        ? [
            {
              gearId: initialItem.id,
              slug: initialItem.slug,
              name: initialItem.name,
              quantity: 1,
              dailyRate: initialItemRate,
              days: 1,
              lineTotal: initialItemRate,
            },
          ]
        : [],
      subtotal: initialItemRate.toFixed(2),
      securityDeposit: "1000.00",
      discountAmount: "0.00",
      totalAmount: (initialItemRate + 1000).toFixed(2),
      currency: "AED",
      status: "confirmed",
      paymentStatus: "unpaid",
      notes: "",
    });
  };

  // Open Edit Rental Order Modal
  const handleOpenEditOrder = (order: GearOrder) => {
    setOrderModalError(null);
    const items = (Array.isArray(order.items) ? order.items : []) as ManualGearOrderItem[];
    setOrderFormData({
      id: order.id,
      fullName: order.fullName,
      email: order.email,
      phone: order.phone,
      company: order.company || "",
      deliveryOption: (order.deliveryOption as "pickup" | "delivery") || "pickup",
      deliveryAddress: order.deliveryAddress || "",
      startDate: order.startDate,
      endDate: order.endDate,
      rentalDays: order.rentalDays,
      items,
      subtotal: order.subtotal,
      securityDeposit: order.securityDeposit || "0.00",
      discountAmount: order.discountAmount || "0.00",
      totalAmount: order.totalAmount,
      currency: order.currency || "AED",
      status: order.status,
      paymentStatus: order.paymentStatus as "unpaid" | "deposit_paid" | "paid" | "refunded",
      notes: order.notes || "",
    });
  };

  // Add Item to Order Form
  const handleAddItemToOrder = (gearId: string) => {
    if (!orderFormData) return;
    const itemToAdd = gearList.find((g) => g.id === gearId);
    if (!itemToAdd) return;

    const rate = Number(itemToAdd.dailyRate) || 500;
    const days = orderFormData.rentalDays || 1;
    const newItem: ManualGearOrderItem = {
      gearId: itemToAdd.id,
      slug: itemToAdd.slug,
      name: itemToAdd.name,
      quantity: 1,
      dailyRate: rate,
      days,
      lineTotal: rate * 1 * days,
    };

    const updatedItems = [...orderFormData.items, newItem];
    const newSubtotal = updatedItems.reduce((acc, curr) => acc + curr.lineTotal, 0);
    const deposit = Number(orderFormData.securityDeposit) || 0;
    const discount = Number(orderFormData.discountAmount) || 0;

    setOrderFormData({
      ...orderFormData,
      items: updatedItems,
      subtotal: newSubtotal.toFixed(2),
      totalAmount: Math.max(0, newSubtotal + deposit - discount).toFixed(2),
    });
  };

  // Remove Item from Order Form
  const handleRemoveItemFromOrder = (index: number) => {
    if (!orderFormData) return;
    const updatedItems = orderFormData.items.filter((_, i) => i !== index);
    const newSubtotal = updatedItems.reduce((acc, curr) => acc + curr.lineTotal, 0);
    const deposit = Number(orderFormData.securityDeposit) || 0;
    const discount = Number(orderFormData.discountAmount) || 0;

    setOrderFormData({
      ...orderFormData,
      items: updatedItems,
      subtotal: newSubtotal.toFixed(2),
      totalAmount: Math.max(0, newSubtotal + deposit - discount).toFixed(2),
    });
  };

  // Save Rental Order
  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderFormData) return;

    if (!orderFormData.fullName.trim() || !orderFormData.email.trim() || !orderFormData.phone.trim()) {
      setOrderModalError("Client name, email, and phone number are required.");
      return;
    }

    if (orderFormData.items.length === 0) {
      setOrderModalError("At least one equipment item must be included in the rental order.");
      return;
    }

    setIsSubmittingOrder(true);
    setOrderModalError(null);

    try {
      if (orderFormData.id) {
        // Edit existing order
        const res = await updateCmsGearOrderDetails({
          id: orderFormData.id,
          fullName: orderFormData.fullName,
          email: orderFormData.email,
          phone: orderFormData.phone,
          company: orderFormData.company,
          startDate: orderFormData.startDate,
          endDate: orderFormData.endDate,
          rentalDays: orderFormData.rentalDays,
          deliveryOption: orderFormData.deliveryOption,
          deliveryAddress: orderFormData.deliveryAddress,
          notes: orderFormData.notes,
          status: orderFormData.status,
          paymentStatus: orderFormData.paymentStatus,
        });

        if (res.success) {
          setOrdersList((prev) =>
            prev.map((o) =>
              o.id === orderFormData.id
                ? {
                    ...o,
                    fullName: orderFormData.fullName,
                    email: orderFormData.email,
                    phone: orderFormData.phone,
                    company: orderFormData.company,
                    startDate: orderFormData.startDate,
                    endDate: orderFormData.endDate,
                    rentalDays: orderFormData.rentalDays,
                    deliveryOption: orderFormData.deliveryOption,
                    deliveryAddress: orderFormData.deliveryAddress,
                    notes: orderFormData.notes,
                    status: orderFormData.status,
                    paymentStatus: orderFormData.paymentStatus,
                  }
                : o
            )
          );
          showFeedback("Rental order details successfully updated.");
          setOrderFormData(null);
        } else {
          setOrderModalError(res.error || "Failed to update order.");
        }
      } else {
        // Create manual order
        const res = await createManualCmsGearOrder({
          fullName: orderFormData.fullName,
          email: orderFormData.email,
          phone: orderFormData.phone,
          company: orderFormData.company,
          deliveryOption: orderFormData.deliveryOption,
          deliveryAddress: orderFormData.deliveryAddress,
          startDate: orderFormData.startDate,
          endDate: orderFormData.endDate,
          rentalDays: orderFormData.rentalDays,
          items: orderFormData.items,
          subtotal: orderFormData.subtotal,
          securityDeposit: orderFormData.securityDeposit,
          discountAmount: orderFormData.discountAmount,
          totalAmount: orderFormData.totalAmount,
          currency: orderFormData.currency,
          status: orderFormData.status,
          paymentStatus: orderFormData.paymentStatus,
          notes: orderFormData.notes,
        });

        if (res.success && res.order) {
          setOrdersList((prev) => [res.order as GearOrder, ...prev]);
          showFeedback(`Manual rental order ${res.order.referenceCode} created.`);
          setOrderFormData(null);
        } else {
          setOrderModalError(res.error || "Failed to create gear order.");
        }
      }
    } catch (err) {
      setOrderModalError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Confirm Delete Order
  const handleConfirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteCmsGearOrder(orderToDelete.id);
      if (res.success) {
        setOrdersList((prev) => prev.filter((o) => o.id !== orderToDelete.id));
        showFeedback(`Order ${orderToDelete.referenceCode} deleted.`);
        setOrderToDelete(null);
      } else {
        alert(res.error || "Failed to delete order.");
      }
    } catch (err) {
      alert((err as Error).message || "An error occurred while deleting order.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 font-display">
            <Camera className="text-emerald-400" /> Gear &amp; Cinema Equipment Fleet
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage cameras, lenses, lighting kits, and customer equipment rental orders.
          </p>
        </div>

        {activeTab === "fleet" ? (
          <button
            type="button"
            onClick={handleOpenNew}
            className="px-4 py-2.5 rounded-xl btn-brand text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus size={16} /> Add Equipment
          </button>
        ) : (
          <button
            type="button"
            onClick={handleOpenNewOrder}
            className="px-4 py-2.5 rounded-xl btn-brand text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus size={16} /> Create Rental Order
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("fleet")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === "fleet"
              ? "border-emerald-400 text-emerald-400 font-semibold"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Camera size={16} />
          <span>Fleet Catalog ({gearList.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === "orders"
              ? "border-emerald-400 text-emerald-400 font-semibold"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <ShoppingBag size={16} />
          <span>Rental Orders ({ordersList.length})</span>
        </button>
      </div>

      {activeTab === "fleet" && (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
              <span className="text-[11px] text-slate-400 font-mono uppercase block">Total Fleet</span>
              <span className="text-xl font-bold text-white font-mono mt-1 block">{gearList.length}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
              <span className="text-[11px] text-emerald-400 font-mono uppercase block">Available Locker</span>
              <span className="text-xl font-bold text-emerald-300 font-mono mt-1 block">{totalAvailable}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
              <span className="text-[11px] text-brand-mauve font-mono uppercase block">Cameras &amp; Lenses</span>
              <span className="text-xl font-bold text-white font-mono mt-1 block">{totalCameras + totalLenses}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
              <span className="text-[11px] text-sky-400 font-mono uppercase block">Lighting &amp; Audio</span>
              <span className="text-xl font-bold text-sky-300 font-mono mt-1 block">{totalLighting + totalAudio}</span>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search gear by name, slug, model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-mauve transition-colors"
              />
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            </div>

            <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-brand-mauve"
              >
                <option value="all">All Categories</option>
                <option value="cameras">Cameras</option>
                <option value="lenses">Cinema Lenses</option>
                <option value="lighting">Lighting &amp; Grip</option>
                <option value="audio">Audio &amp; Mics</option>
                <option value="bundles">Production Kits</option>
              </select>

              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value as "all" | "available" | "unavailable")}
                aria-label="Filter by availability"
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-brand-mauve"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          {feedback && <FeedbackAlert type="success" message={feedback} onDismiss={clearFeedback} />}
          {error && <FeedbackAlert type="error" message={error} onDismiss={() => setError(null)} />}

          {/* Equipment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagination.paginatedItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all group"
              >
                <div>
                  <div className="relative w-full h-40 rounded-xl overflow-hidden bg-black/40 border border-white/5 mb-3">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Camera size={32} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      {item.isPopular && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-violet text-white border border-brand-mauve/40 shadow-sm">
                          Popular
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          item.isAvailable
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {item.isAvailable ? "Ready" : "Rented"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-sm tracking-tight">{item.name}</h3>
                      {item.arabicName && (
                        <span className="text-xs text-slate-400 font-arabic block">{item.arabicName}</span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400 uppercase">
                      {item.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {item.description || "No technical specs provided."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Daily Rental</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {item.dailyRate} AED
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingGear(item)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <PaginationControls
            currentPage={pagination.currentPage}
            pageCount={pagination.pageCount}
            total={pagination.total}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            onPrev={pagination.prevPage}
            onNext={pagination.nextPage}
            variant="card"
          />
        </>
      )}

      {/* ─── TAB 2: Customer Rental Orders ───────────────────────────────────── */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {/* Orders KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
              <span className="text-[11px] text-slate-400 font-mono uppercase block">Total Orders</span>
              <span className="text-xl font-bold text-white font-mono mt-1 block">
                {ordersList.length}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
              <span className="text-[11px] text-brand-mauve font-mono uppercase block">Pending Fulfillment</span>
              <span className="text-xl font-bold text-brand-mauve font-mono mt-1 block">
                {totalPendingOrders}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
              <span className="text-[11px] text-emerald-400 font-mono uppercase block">Active / Confirmed</span>
              <span className="text-xl font-bold text-emerald-300 font-mono mt-1 block">
                {totalConfirmedOrders}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
              <span className="text-[11px] text-sky-400 font-mono uppercase block">Paid / Deposit Held</span>
              <span className="text-xl font-bold text-sky-300 font-mono mt-1 block">
                {totalPaidOrders}
              </span>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search orders by reference, client, email..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-mauve transition-colors"
              />
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={orderStatusFilter}
                onChange={(e) =>
                  setOrderStatusFilter(
                    e.target.value as "all" | "pending" | "confirmed" | "completed" | "cancelled"
                  )
                }
                aria-label="Filter by order status"
                className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-brand-mauve"
              >
                <option value="all">All Order Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={orderPaymentFilter}
                onChange={(e) =>
                  setOrderPaymentFilter(
                    e.target.value as "all" | "unpaid" | "deposit_paid" | "paid" | "refunded"
                  )
                }
                aria-label="Filter by payment status"
                className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-brand-mauve"
              >
                <option value="all">All Payment Statuses</option>
                <option value="unpaid">Unpaid</option>
                <option value="deposit_paid">Deposit Paid</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="rounded-2xl border border-white/10 bg-[#0c0b10] overflow-hidden">
            <DataTable>
              <DataTableHeader>
                <tr>
                  <th className="py-3.5 px-4 text-left text-xs font-semibold text-zinc-400">Order Ref</th>
                  <th className="py-3.5 px-4 text-left text-xs font-semibold text-zinc-400">Client Details</th>
                  <th className="py-3.5 px-4 text-left text-xs font-semibold text-zinc-400">Rental Period</th>
                  <th className="py-3.5 px-4 text-left text-xs font-semibold text-zinc-400">Gear Rented</th>
                  <th className="py-3.5 px-4 text-left text-xs font-semibold text-zinc-400">Delivery</th>
                  <th className="py-3.5 px-4 text-left text-xs font-semibold text-zinc-400">Total &amp; Payment</th>
                  <th className="py-3.5 px-4 text-right text-xs font-semibold text-zinc-400">Fulfillment Status</th>
                  <th className="py-3.5 px-4 text-right text-xs font-semibold text-zinc-400">Actions</th>
                </tr>
              </DataTableHeader>
              <DataTableBody>
                {paginationOrders.paginatedItems.length === 0 ? (
                  <DataTableEmpty colSpan={8} message="No gear rental orders match your filters." />
                ) : (
                  paginationOrders.paginatedItems.map((order) => {
                    const isUpdating = updatingOrderId === order.id;
                    const items = (Array.isArray(order.items) ? order.items : []) as Array<{
                      name: string;
                      quantity: number;
                      dailyRate: number;
                      days: number;
                      lineTotal: number;
                    }>;
                    return (
                      <DataTableRow key={order.id}>
                        {/* Reference */}
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-white tracking-wider px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs">
                            {order.referenceCode}
                          </span>
                          <span className="block text-[10px] text-zinc-500 mt-1 font-mono">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-3 px-4 text-xs">
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <User size={13} className="text-emerald-400" />
                            {order.fullName}
                          </div>
                          <div className="text-zinc-400 text-[11px] flex items-center gap-1 mt-0.5">
                            <Mail size={11} /> {order.email}
                          </div>
                          <div className="text-zinc-500 text-[11px] flex items-center gap-1">
                            <Phone size={11} /> {order.phone}
                          </div>
                        </td>

                        {/* Rental Window */}
                        <td className="py-3 px-4 text-xs font-mono">
                          <div className="flex items-center gap-1.5 text-zinc-300">
                            <CalendarRange size={13} className="text-emerald-400" />
                            <span>{order.startDate}</span>
                            <span className="text-zinc-500">→</span>
                            <span>{order.endDate}</span>
                          </div>
                          <span className="text-[11px] text-zinc-400 block mt-0.5">
                            {order.rentalDays} Day{order.rentalDays > 1 ? "s" : ""} Rental
                          </span>
                        </td>

                        {/* Items */}
                        <td className="py-3 px-4 text-xs">
                          <div className="space-y-1">
                            {items.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-3 text-zinc-300">
                                <span className="font-medium text-white">{it.name}</span>
                                <span className="font-mono text-zinc-400 text-[11px]">
                                  x{it.quantity} ({it.lineTotal} AED)
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Delivery */}
                        <td className="py-3 px-4 text-xs">
                          <div className="flex items-center gap-1.5 font-medium text-zinc-300 capitalize">
                            <Truck size={13} className="text-emerald-400" />
                            <span>{order.deliveryOption}</span>
                          </div>
                          {order.deliveryAddress && (
                            <span className="text-[11px] text-zinc-400 block truncate max-w-[140px] mt-0.5" title={order.deliveryAddress}>
                              {order.deliveryAddress}
                            </span>
                          )}
                        </td>

                        {/* Financials & Payment status */}
                        <td className="py-3 px-4 text-xs">
                          <div className="font-bold text-white font-mono text-sm">
                            {order.totalAmount} AED
                          </div>
                          <div className="mt-1">
                            <select
                              value={order.paymentStatus}
                              disabled={isUpdating}
                              onChange={(e) =>
                                handleOrderPaymentChange(
                                  order.id,
                                  e.target.value as "unpaid" | "deposit_paid" | "paid" | "refunded"
                                )
                              }
                              className="text-[11px] px-2 py-1 rounded-lg bg-zinc-900 border border-white/10 text-zinc-300 focus:outline-none focus:border-brand-mauve"
                            >
                              <option value="unpaid">Unpaid</option>
                              <option value="deposit_paid">Deposit Paid</option>
                              <option value="paid">Paid</option>
                              <option value="refunded">Refunded</option>
                            </select>
                          </div>
                        </td>

                        {/* Fulfillment status */}
                        <td className="py-3 px-4 text-right">
                          <select
                            value={order.status}
                            disabled={isUpdating}
                            onChange={(e) =>
                              handleOrderStatusChange(
                                order.id,
                                e.target.value as "pending" | "confirmed" | "completed" | "cancelled"
                              )
                            }
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/15 text-zinc-200 focus:outline-none focus:border-emerald-400"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditOrder(order)}
                              className="px-2 py-1 rounded bg-brand-violet/20 hover:bg-brand-violet/30 border border-brand-mauve/30 text-brand-mauve text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                              title="Edit Order & Schedule"
                            >
                              <Edit3 size={11} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setOrderToDelete(order)}
                              className="p-1 rounded bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 transition-colors cursor-pointer"
                              title="Delete Order"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </DataTableRow>
                    );
                  })
                )}
              </DataTableBody>
            </DataTable>

            {paginationOrders.pageCount > 1 && (
              <PaginationControls
                currentPage={paginationOrders.currentPage}
                pageCount={paginationOrders.pageCount}
                total={paginationOrders.total}
                startIndex={paginationOrders.startIndex}
                endIndex={paginationOrders.endIndex}
                onPrev={paginationOrders.prevPage}
                onNext={paginationOrders.nextPage}
                variant="table"
              />
            )}
          </div>
        </div>
      )}

      {/* Modal: Create or Edit Fleet Equipment */}
      {editingGear && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Camera className="text-emerald-400" size={20} />
                {editingGear.id ? "Edit Equipment" : "Add New Equipment"}
              </h2>
              <button
                type="button"
                onClick={() => setEditingGear(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {error && <FeedbackAlert type="error" message={error} className="mt-4" />}

            {feedback && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle size={14} /> {feedback}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Equipment Name (English)</label>
                  <input
                    type="text"
                    required
                    value={editingGear.name || ""}
                    onChange={(e) =>
                      setEditingGear({
                        ...editingGear,
                        name: e.target.value,
                        slug: editingGear.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Equipment Name (Arabic)</label>
                  <input
                    type="text"
                    value={editingGear.arabicName || ""}
                    onChange={(e) => setEditingGear({ ...editingGear, arabicName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-arabic focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={editingGear.category || "cameras"}
                    onChange={(e) => setEditingGear({ ...editingGear, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="cameras">Cameras</option>
                    <option value="lenses">Cinema Lenses</option>
                    <option value="lighting">Lighting &amp; Grip</option>
                    <option value="audio">Audio &amp; Mics</option>
                    <option value="bundles">Production Kits</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Daily Rate (AED)</label>
                  <input
                    type="text"
                    required
                    value={editingGear.dailyRate || ""}
                    onChange={(e) => setEditingGear({ ...editingGear, dailyRate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Deposit (AED)</label>
                  <input
                    type="text"
                    value={editingGear.securityDeposit || ""}
                    onChange={(e) => setEditingGear({ ...editingGear, securityDeposit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Equipment Image</label>
                <AdminImageUploader
                  value={editingGear.imageUrl || ""}
                  onChange={(url) => setEditingGear({ ...editingGear, imageUrl: url })}
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Technical Specs &amp; Description</label>
                <textarea
                  rows={3}
                  value={editingGear.description || ""}
                  onChange={(e) => setEditingGear({ ...editingGear, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={editingGear.isAvailable ?? true}
                    onChange={(e) => setEditingGear({ ...editingGear, isAvailable: e.target.checked })}
                    className="rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Available in Locker</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={editingGear.isPopular ?? false}
                    onChange={(e) => setEditingGear({ ...editingGear, isPopular: e.target.checked })}
                    className="rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Popular / Highlight</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingGear(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl btn-brand text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{isSubmitting ? "Saving..." : "Save Equipment"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create or Edit Rental Order */}
      {orderFormData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="text-emerald-400" size={20} />
                {orderFormData.id ? "Edit & Reschedule Rental Order" : "Create Manual Rental Order"}
              </h2>
              <button
                type="button"
                onClick={() => setOrderFormData(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {orderModalError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                {orderModalError}
              </div>
            )}

            <form onSubmit={handleSaveOrder} className="mt-4 space-y-4 text-xs">
              {/* Customer Details */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 block font-bold">
                  Client Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={orderFormData.fullName}
                      onChange={(e) => setOrderFormData({ ...orderFormData, fullName: e.target.value })}
                      placeholder="e.g. Tariq Mansour"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={orderFormData.email}
                      onChange={(e) => setOrderFormData({ ...orderFormData, email: e.target.value })}
                      placeholder="tariq@production.ae"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={orderFormData.phone}
                      onChange={(e) => setOrderFormData({ ...orderFormData, phone: e.target.value })}
                      placeholder="+971 50 999 8877"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Company / Production House</label>
                    <input
                      type="text"
                      value={orderFormData.company}
                      onChange={(e) => setOrderFormData({ ...orderFormData, company: e.target.value })}
                      placeholder="e.g. Dune Media Productions"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Rental Dates & Delivery */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 block font-bold">
                  Schedule &amp; Fulfillment
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={orderFormData.startDate}
                      onChange={(e) => setOrderFormData({ ...orderFormData, startDate: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={orderFormData.endDate}
                      onChange={(e) => setOrderFormData({ ...orderFormData, endDate: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Rental Days</label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      required
                      value={orderFormData.rentalDays}
                      onChange={(e) => {
                        const days = Number(e.target.value) || 1;
                        const updatedItems = orderFormData.items.map((it) => ({
                          ...it,
                          days,
                          lineTotal: it.dailyRate * it.quantity * days,
                        }));
                        const subtotal = updatedItems.reduce((acc, curr) => acc + curr.lineTotal, 0);
                        const deposit = Number(orderFormData.securityDeposit) || 0;
                        const discount = Number(orderFormData.discountAmount) || 0;
                        setOrderFormData({
                          ...orderFormData,
                          rentalDays: days,
                          items: updatedItems,
                          subtotal: subtotal.toFixed(2),
                          totalAmount: Math.max(0, subtotal + deposit - discount).toFixed(2),
                        });
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Fulfillment Method</label>
                    <select
                      value={orderFormData.deliveryOption}
                      onChange={(e) =>
                        setOrderFormData({
                          ...orderFormData,
                          deliveryOption: e.target.value as "pickup" | "delivery",
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="pickup">Client Pickup (Yas Studio Locker)</option>
                      <option value="delivery">Location Delivery &amp; Dispatch</option>
                    </select>
                  </div>
                  {orderFormData.deliveryOption === "delivery" && (
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Delivery Address</label>
                      <input
                        type="text"
                        value={orderFormData.deliveryAddress}
                        onChange={(e) => setOrderFormData({ ...orderFormData, deliveryAddress: e.target.value })}
                        placeholder="Street, Studio or Shoot Location"
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Equipment Items Selection */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 block font-bold">
                    Equipment Fleet Selection ({orderFormData.items.length})
                  </span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddItemToOrder(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 text-xs text-emerald-300 focus:outline-none"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      + Add Item from Catalog...
                    </option>
                    {gearList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.dailyRate} AED/day)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {orderFormData.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/5 text-xs"
                    >
                      <span className="text-white font-medium">{it.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-400 font-mono text-[11px]">
                          {it.quantity} unit @ {it.dailyRate} AED/d ={" "}
                          <strong className="text-emerald-400">{it.lineTotal} AED</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItemFromOrder(idx)}
                          className="p-1 rounded text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                          title="Remove Item"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financials & Status */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 block font-bold">
                  Financial Reconciliation &amp; Status
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Subtotal (AED)</label>
                    <input
                      type="text"
                      readOnly
                      value={orderFormData.subtotal}
                      className="w-full px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/10 text-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Security Deposit</label>
                    <input
                      type="text"
                      value={orderFormData.securityDeposit}
                      onChange={(e) => {
                        const deposit = Number(e.target.value) || 0;
                        const subtotal = Number(orderFormData.subtotal) || 0;
                        const discount = Number(orderFormData.discountAmount) || 0;
                        setOrderFormData({
                          ...orderFormData,
                          securityDeposit: e.target.value,
                          totalAmount: Math.max(0, subtotal + deposit - discount).toFixed(2),
                        });
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Order Status</label>
                    <select
                      value={orderFormData.status}
                      onChange={(e) =>
                        setOrderFormData({
                          ...orderFormData,
                          status: e.target.value as OrderFormData["status"],
                        })
                      }
                      className="w-full px-2 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Payment Status</label>
                    <select
                      value={orderFormData.paymentStatus}
                      onChange={(e) =>
                        setOrderFormData({
                          ...orderFormData,
                          paymentStatus: e.target.value as OrderFormData["paymentStatus"],
                        })
                      }
                      className="w-full px-2 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="deposit_paid">Deposit Paid</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <span className="text-xs text-slate-300 font-medium">Grand Total Payable</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {orderFormData.totalAmount} AED
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Dispatch / Rental Notes</label>
                <textarea
                  rows={2}
                  value={orderFormData.notes}
                  onChange={(e) => setOrderFormData({ ...orderFormData, notes: e.target.value })}
                  placeholder="e.g. Flight cases inspected, batteries charged to 100%, return by 6 PM Sunday."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setOrderFormData(null)}
                  disabled={isSubmittingOrder}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="px-5 py-2 rounded-xl btn-brand text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{isSubmittingOrder ? "Saving..." : orderFormData.id ? "Update Order Details" : "Create Rental Order"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      {itemToDelete && (
        <AdminConfirmModal
          isOpen={Boolean(itemToDelete)}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Fleet Equipment"
          message={`Are you sure you want to permanently remove "${itemToDelete.name}" from the cinema rental fleet? This action cannot be undone.`}
          confirmLabel="Delete Item"
          variant="danger"
          isSubmitting={isDeleting}
        />
      )}

      {/* Delete Order Confirmation Modal */}
      {orderToDelete && (
        <AdminConfirmModal
          isOpen={Boolean(orderToDelete)}
          onClose={() => setOrderToDelete(null)}
          onConfirm={handleConfirmDeleteOrder}
          title="Delete Rental Order"
          message={`Are you sure you want to permanently delete rental order "${orderToDelete.referenceCode}" for ${orderToDelete.fullName}? All item reservations will be discarded.`}
          confirmLabel="Delete Order"
          variant="danger"
          isSubmitting={isDeleting}
        />
      )}
    </div>
  );
}
