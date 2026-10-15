"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Shield,
  ShieldCheck,
  Building,
  Mail,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Plus,
  Pencil,
} from "lucide-react";
import {
  updateUserRole,
  deleteCmsUser,
  updateCmsUserProfile,
  createCmsUser,
} from "@/lib/actions/users-client-operations";
import type { User } from "@/db/schema";
import {
  AdminPageHeader,
  AdminStatsGrid,
  AdminFilterBar,
  AdminConfirmModal,
} from "@/components/admin";
import { UserFormModal, type UserFormValues } from "@/components/admin/forms/UserFormModal";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableEmpty,
} from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useFeedbackAlert } from "@/hooks/useFeedbackAlert";
import { useAdminFilter } from "../hooks/useAdminFilter";

interface UsersManagerProps {
  initialUsers: User[];
}

export function UsersManager({ initialUsers }: UsersManagerProps) {
  const router = useRouter();
  const [usersList, setUsersList] = useState<User[]>(initialUsers);
  const [prevInitial, setPrevInitial] = useState(initialUsers);
  // Re-sync when the server re-renders with fresh data (after creating a user).
  if (prevInitial !== initialUsers) {
    setPrevInitial(initialUsers);
    setUsersList(initialUsers);
  }
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [roleTarget, setRoleTarget] = useState<{
    user: User;
    newRole: "client" | "admin";
  } | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { feedback, showFeedback, clearFeedback } = useFeedbackAlert(3000);

  const filter = useAdminFilter<User, "all" | "client" | "enterprise" | "admin">({
    data: usersList,
    initialFilter: "all",
    pageSize: 20,
    predicate: (u, query, role) => {
      const matchesSearch =
        !query ||
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        (u.company && u.company.toLowerCase().includes(query)) ||
        (u.phone && u.phone.toLowerCase().includes(query));

      const matchesRole = role === "all" || u.role === role;
      return Boolean(matchesSearch && matchesRole);
    },
  });

  const totalClients = usersList.filter((u) => u.role === "client").length;
  const totalEnterprise = usersList.filter((u) => u.role === "enterprise").length;
  const totalCorporate = usersList.filter((u) => Boolean(u.company)).length;
  const totalAdmins = usersList.filter((u) => u.role === "admin").length;

  const handleRoleSelect = (user: User, newRole: "client" | "admin") => {
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

  const handleSaveUser = async (values: UserFormValues, editingId: string | null): Promise<boolean> => {
    setIsSubmittingAction(true);
    setFormError(null);
    try {
      const res = editingId
        ? await updateCmsUserProfile(editingId, { name: values.name, phone: values.phone, company: values.company })
        : await createCmsUser(values);
      if (!res.success) {
        setFormError(res.error || "Failed to save user.");
        return false;
      }
      if (editingId) {
        setUsersList((prev) =>
          prev.map((u) =>
            u.id === editingId
              ? { ...u, name: values.name.trim(), phone: values.phone.trim() || null, company: values.company.trim() || null }
              : u
          )
        );
      } else {
        router.refresh();
      }
      showFeedback(res.message || "User saved.");
      setUserFormOpen(false);
      return true;
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save user.");
      return false;
    } finally {
      setIsSubmittingAction(false);
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
      <AdminPageHeader
        title="Registered Users & Client Accounts"
        description="Production clients, corporate accounts, and system administrators."
        icon={Users}
        feedback={feedback}
        onDismissFeedback={clearFeedback}
        actions={
          <button
            type="button"
            onClick={() => { setFormError(null); setUserToEdit(null); setUserFormOpen(true); }}
            className="px-4 py-2.5 rounded-xl btn-brand text-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus size={16} />
            <span>New User</span>
          </button>
        }
      />

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <AdminStatsGrid
        columns={4}
        stats={[
          {
            label: "Total Accounts",
            value: usersList.length,
            unit: "Users",
            icon: Users,
            variant: "default",
          },
          {
            label: "Production Clients",
            value: totalClients,
            unit: "Clients",
            icon: Building,
            variant: "default",
          },
          {
            label: "Corporate Accounts",
            value: totalCorporate,
            unit: "Companies",
            icon: Shield,
            variant: "brand",
          },
          {
            label: "System Admins",
            value: totalAdmins,
            unit: "Secured",
            icon: ShieldCheck,
            variant: "success",
          },
        ]}
      />

      {/* Search & Filters */}
      <AdminFilterBar
        searchQuery={filter.searchQuery}
        onSearchChange={filter.setSearchQuery}
        searchPlaceholder="Search by name, email, company, phone..."
        filterValue={filter.filterValue}
        onFilterChange={filter.setFilterValue}
        filterOptions={[
          { id: "all", label: "All Users", count: usersList.length },
          { id: "client", label: "Clients", count: totalClients },
          { id: "enterprise", label: "Enterprise", count: totalEnterprise },
          { id: "admin", label: "Admins", count: totalAdmins },
        ]}
      />

      {/* Users Table */}
      <DataTable>
        <DataTableHeader>
          <tr>
            <th className="py-3 px-4">User &amp; Organization</th>
            <th className="py-3 px-4">Email &amp; Status</th>
            <th className="py-3 px-4">Contact Phone</th>
            <th className="py-3 px-4">Role</th>
            <th className="py-3 px-4">Registered Date</th>
            <th className="py-3 px-4 text-end">Actions</th>
          </tr>
        </DataTableHeader>
        <DataTableBody>
          {filter.filteredData.length === 0 ? (
            <DataTableEmpty
              colSpan={6}
              message="No registered users match your search criteria."
              onReset={filter.resetFilters}
            />
          ) : (
            filter.pagination.paginatedItems.map((user) => (
              <DataTableRow key={user.id}>
                {/* User & Organization */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-gradient-to-tr from-brand-violet/40 to-brand-mauve/20 border border-brand-mauve/30 flex items-center justify-center font-bold text-brand-mauve-soft text-xs shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-white block">{user.name}</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building size={11} className="text-brand-mauve" />
                        {user.company || "Independent Client"}
                      </span>
                    </div>
                  </div>
                </td>
                {/* Email */}
                <td className="py-3.5 px-4 font-mono text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Mail size={12} className="text-slate-400 shrink-0" />
                    <a href={`mailto:${user.email}`} className="hover:text-brand-mauve transition-colors">
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
                        className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors"
                        title="Chat on WhatsApp"
                        aria-label={`Chat with ${user.name} on WhatsApp`}
                      >
                        <ExternalLink size={12} />
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
                        e.target.value as "client" | "admin"
                      )
                    }
                    className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition-colors ${
                      user.role === "admin"
                        ? "bg-brand-violet/20 text-brand-mauve border-brand-mauve/30"
                        : "bg-slate-800 text-slate-300 border-white/10"
                    }`}
                  >
                    <option value="client" className="bg-slate-900 text-white">Client</option>
                    <option value="enterprise" disabled className="bg-slate-900 text-white">Enterprise</option>
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
                <td className="py-3.5 px-4 text-end">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setFormError(null); setUserToEdit(user); setUserFormOpen(true); }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Edit Profile"
                      aria-label={`Edit profile for ${user.name}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserToDelete(user)}
                      disabled={updatingId === user.id}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer disabled:opacity-50 min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Delete User"
                      aria-label={`Delete account for ${user.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </DataTableRow>
            ))
          )}
        </DataTableBody>
      </DataTable>

      <PaginationControls
        currentPage={filter.pagination.currentPage}
        pageCount={filter.pagination.pageCount}
        total={filter.pagination.total}
        startIndex={filter.pagination.startIndex}
        endIndex={filter.pagination.endIndex}
        onPrev={filter.pagination.prevPage}
        onNext={filter.pagination.nextPage}
      />

      <UserFormModal
        isOpen={userFormOpen}
        onClose={() => setUserFormOpen(false)}
        user={userToEdit}
        onSave={handleSaveUser}
        isSubmitting={isSubmittingAction}
        error={formError}
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
