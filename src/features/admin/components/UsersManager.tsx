"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  Building,
  Mail,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { updateUserRole, deleteCmsUser } from "@/lib/actions/users-client-operations";
import type { User } from "@/db/schema";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
import { DataTable, DataTableHeader, DataTableBody, DataTableRow, DataTableEmpty } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePagination } from "@/hooks/usePagination";
import { useFeedbackAlert } from "@/hooks/useFeedbackAlert";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";

interface UsersManagerProps {
  initialUsers: User[];
}

export function UsersManager({ initialUsers }: UsersManagerProps) {
  const [usersList, setUsersList] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "client" | "enterprise" | "admin">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [roleTarget, setRoleTarget] = useState<{ user: User; newRole: "client" | "enterprise" | "admin" } | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { feedback, showFeedback, clearFeedback } = useFeedbackAlert(3000);

  const filteredUsers = usersList.filter((u) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.company && u.company.toLowerCase().includes(query)) ||
      (u.phone && u.phone.toLowerCase().includes(query));
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const pagination = usePagination(filteredUsers, 20);

  const totalClients = usersList.filter((u) => u.role === "client").length;
  const totalEnterprise = usersList.filter((u) => u.role === "enterprise").length;
  const totalAdmins = usersList.filter((u) => u.role === "admin").length;

  const handleRoleSelect = (user: User, newRole: "client" | "enterprise" | "admin") => {
    if (user.role === newRole) return;
    setRoleTarget({ user, newRole });
  };

  const handleConfirmRoleChange = async () => {
    if (!roleTarget) return;
    const { user, newRole } = roleTarget;
    setIsSubmittingAction(true);
    setErrorMessage(null);
    setUpdatingId(user.id);
    try {
      const res = await updateUserRole(user.id, newRole);
      if (res.success) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
        );
        showFeedback(`Updated ${user.name}'s role to ${newRole}`);
        setRoleTarget(null);
      } else {
        setErrorMessage(res.error || "Failed to update role");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setIsSubmittingAction(false);
      setUpdatingId(null);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsSubmittingAction(true);
    setErrorMessage(null);
    setUpdatingId(userToDelete.id);
    try {
      const res = await deleteCmsUser(userToDelete.id);
      if (res.success) {
        setUsersList((prev) => prev.filter((u) => u.id !== userToDelete.id));
        showFeedback(`User account for ${userToDelete.name} deleted.`);
        setUserToDelete(null);
      } else {
        setErrorMessage(res.error || "Failed to delete user");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setIsSubmittingAction(false);
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display flex items-center gap-2.5">
            <Users size={24} className="text-amber-400" />
            Registered Users &amp; Client Accounts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real production clients, verified phone contacts, and enterprise administrators.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {feedback && (
            <FeedbackAlert type="success" message={feedback} onDismiss={clearFeedback} />
          )}
          {errorMessage && (
            <FeedbackAlert type="error" message={errorMessage} onDismiss={() => setErrorMessage(null)} />
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Accounts", icon: <Users size={14} className="text-amber-400" />, value: usersList.length },
          { label: "Production Clients", icon: <Building size={14} className="text-stone-300" />, value: totalClients },
          { label: "Enterprise Vaults", icon: <Shield size={14} className="text-amber-400" />, value: totalEnterprise },
          { label: "System Admins", icon: <ShieldCheck size={14} className="text-emerald-400" />, value: totalAdmins },
        ].map(({ label, icon, value }) => (
          <div key={label} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">{icon} {label}</span>
            <span className="text-2xl font-bold text-white mt-1 block">{value}</span>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name, email, company, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
        </div>
        <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
          {(["all", "client", "enterprise", "admin"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setRoleFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer ${
                roleFilter === tab
                  ? "bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab === "all" ? "All Users" : tab === "enterprise" ? "Enterprise" : `${tab}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <DataTable>
        <DataTableHeader>
          <tr>
            <th className="py-3 px-4">User &amp; Organization</th>
            <th className="py-3 px-4">Actual Email &amp; Verification</th>
            <th className="py-3 px-4">Contact Phone</th>
            <th className="py-3 px-4">Role</th>
            <th className="py-3 px-4">Registered Date</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </DataTableHeader>
        <DataTableBody>
          {filteredUsers.length === 0 ? (
            <DataTableEmpty colSpan={6} message="No registered users match your search criteria." />
          ) : (
            pagination.paginatedItems.map((user) => (
              <DataTableRow key={user.id}>
                {/* User & Organization */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-gradient-to-tr from-amber-600/30 to-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-300 text-xs shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-white block">{user.name}</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building size={11} className="text-amber-400" />
                        {user.company || "Independent Client"}
                      </span>
                    </div>
                  </div>
                </td>
                {/* Email */}
                <td className="py-3.5 px-4 font-mono text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Mail size={12} className="text-slate-400 shrink-0" />
                    <a href={`mailto:${user.email}`} className="hover:text-amber-400 transition-colors">
                      {user.email}
                    </a>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 mt-0.5">
                    <CheckCircle2 size={10} /> Active Account
                  </span>
                </td>
                {/* Phone */}
                <td className="py-3.5 px-4 font-mono text-slate-300">
                  {user.phone ? (
                    <div className="flex items-center gap-2">
                      <span>{user.phone}</span>
                      <a
                        href={`https://wa.me/${user.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-md bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  ) : (
                    <span className="text-slate-600 italic">Not provided</span>
                  )}
                </td>
                {/* Role Selector */}
                <td className="py-3.5 px-4">
                  <select
                    value={user.role}
                    disabled={updatingId === user.id}
                    onChange={(e) =>
                      handleRoleSelect(
                        user,
                        e.target.value as "client" | "enterprise" | "admin"
                      )
                    }
                    className={`text-[10px] font-semibold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer transition-colors ${
                      user.role === "admin"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : user.role === "enterprise"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-slate-700/40 text-slate-300 border-slate-600/30"
                    }`}
                  >
                    <option value="client" className="bg-slate-900 text-white">Client</option>
                    <option value="enterprise" className="bg-slate-900 text-white">Enterprise Partner</option>
                    <option value="admin" className="bg-slate-900 text-white">System Admin</option>
                  </select>
                </td>
                {/* Registered Date */}
                <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                  <div className="flex items-center gap-1">
                    <Clock size={11} className="text-slate-500" />
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </td>
                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setUserToDelete(user)}
                      disabled={updatingId === user.id}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete User"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </DataTableRow>
            ))
          )}
        </DataTableBody>
      </DataTable>

      <PaginationControls
        currentPage={pagination.currentPage}
        pageCount={pagination.pageCount}
        total={pagination.total}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
        onPrev={pagination.prevPage}
        onNext={pagination.nextPage}
        variant="table"
      />

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <AdminConfirmModal
          isOpen={Boolean(userToDelete)}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleConfirmDeleteUser}
          title="Delete Account"
          message={`Are you sure you want to permanently delete the account for ${userToDelete.name} (${userToDelete.email})? This action cannot be undone.`}
          confirmLabel="Delete Account"
          variant="danger"
          isSubmitting={isSubmittingAction}
        />
      )}

      {/* Role Change Confirmation Modal */}
      {roleTarget && (
        <AdminConfirmModal
          isOpen={Boolean(roleTarget)}
          onClose={() => setRoleTarget(null)}
          onConfirm={handleConfirmRoleChange}
          title="Change User Access Role"
          message={`Are you sure you want to change ${roleTarget.user.name}'s role from "${roleTarget.user.role}" to "${roleTarget.newRole}"?`}
          confirmLabel="Update Role"
          variant="warning"
          isSubmitting={isSubmittingAction}
        />
      )}
    </div>
  );
}
