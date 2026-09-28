"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  Building,
  Mail,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { updateUserRole, deleteCmsUser } from "@/lib/cms-actions";
import type { User } from "@/db/schema";

interface UsersManagerProps {
  initialUsers: User[];
}

export function UsersManager({ initialUsers }: UsersManagerProps) {
  const [usersList, setUsersList] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "client" | "admin">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleToggleRole = async (user: User) => {
    const newRole = user.role === "admin" ? "client" : "admin";
    if (
      !confirm(
        `Are you sure you want to change ${user.name}'s role to "${newRole}"?`
      )
    ) {
      return;
    }

    setUpdatingId(user.id);
    const res = await updateUserRole(user.id, newRole);
    if (res.success) {
      setUsersList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
      setFeedback(`Updated ${user.name} to ${newRole}`);
      setTimeout(() => setFeedback(null), 3000);
    } else {
      alert(res.error || "Failed to update role");
    }
    setUpdatingId(null);
  };

  const handleDeleteUser = async (user: User) => {
    if (
      !confirm(
        `Permanently delete account for ${user.name} (${user.email})? This action cannot be undone.`
      )
    ) {
      return;
    }

    setUpdatingId(user.id);
    const res = await deleteCmsUser(user.id);
    if (res.success) {
      setUsersList((prev) => prev.filter((u) => u.id !== user.id));
      setFeedback(`User ${user.name} deleted`);
      setTimeout(() => setFeedback(null), 3000);
    } else {
      alert(res.error || "Failed to delete user");
    }
    setUpdatingId(null);
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.company && u.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.phone && u.phone.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalClients = usersList.filter((u) => u.role === "client").length;
  const totalAdmins = usersList.filter((u) => u.role === "admin").length;

  return (
    <div className="space-y-6">
      {/* Header and KPI Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display flex items-center gap-2.5">
            <Users size={24} className="text-purple-400" />
            Registered Users &amp; Client Accounts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real production clients, verified phone contacts, and enterprise administrators.
          </p>
        </div>

        {feedback && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 size={14} />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Users size={14} className="text-purple-400" /> Total Accounts
          </span>
          <span className="text-2xl font-bold text-white mt-1 block">
            {usersList.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Building size={14} className="text-cyan-400" /> Production Clients
          </span>
          <span className="text-2xl font-bold text-white mt-1 block">
            {totalClients}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" /> System Administrators
          </span>
          <span className="text-2xl font-bold text-white mt-1 block">
            {totalAdmins}
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name, email, company, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {(["all", "client", "admin"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setRoleFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer ${
                roleFilter === tab
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab === "all" ? "All Users" : `${tab}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-slate-400 uppercase tracking-wider font-mono text-[11px] border-b border-white/10">
              <tr>
                <th className="py-3 px-4">User &amp; Organization</th>
                <th className="py-3 px-4">Actual Email &amp; Verification</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No registered users match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* User and Organization */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 border border-purple-500/30 flex items-center justify-center font-bold text-white text-xs shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">
                            {user.name}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building size={11} className="text-purple-400" />
                            {user.company || "Independent Client"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} className="text-slate-400 shrink-0" />
                        <a
                          href={`mailto:${user.email}`}
                          className="hover:text-purple-400 transition-colors"
                        >
                          {user.email}
                        </a>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 mt-0.5">
                        <CheckCircle2 size={10} /> Active Account
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 font-mono">
                      {user.phone ? (
                        <div className="flex items-center gap-2">
                          <span>{user.phone}</span>
                          <a
                            href={`https://wa.me/${user.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">Not provided</span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          user.role === "admin"
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                            : "bg-blue-500/15 text-blue-300 border-blue-500/20"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <>
                            <Shield size={10} className="text-purple-400" /> Administrator
                          </>
                        ) : (
                          <>
                            <UserCheck size={10} className="text-blue-400" /> Client
                          </>
                        )}
                      </span>
                    </td>

                    {/* Registered Date */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        <Clock size={11} className="text-slate-500" />
                        <span>
                          {new Date(user.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleRole(user)}
                          disabled={updatingId === user.id}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px] disabled:opacity-50"
                          title="Toggle Role"
                        >
                          {user.role === "admin" ? "Demote" : "Make Admin"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          disabled={updatingId === user.id}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete User"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
