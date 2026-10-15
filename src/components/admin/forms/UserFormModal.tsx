"use client";

import React, { useState } from "react";
import type { User } from "@/db/schema";
import { AdminModal } from "../shared/AdminModal";
import { AdminInput, AdminSelect } from "../shared/AdminFormFields";

export interface UserFormValues {
  name: string;
  email: string;
  password: string;
  role: "client" | "admin";
  phone: string;
  company: string;
}

export interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** `user` is the record being edited, or null when creating. */
  user: User | null;
  onSave: (values: UserFormValues, editingId: string | null) => Promise<boolean | void>;
  isSubmitting?: boolean;
  error?: string | null;
}

export function UserFormModal(props: UserFormModalProps) {
  if (!props.isOpen) return null;
  return <UserFormContent key={props.user?.id || "new"} {...props} />;
}

function UserFormContent({ isOpen, onClose, user, onSave, isSubmitting = false, error }: UserFormModalProps) {
  const isEdit = Boolean(user);
  const [form, setForm] = useState<UserFormValues>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    role: (user?.role as UserFormValues["role"]) ?? "client",
    phone: user?.phone ?? "",
    company: user?.company ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const set = (key: keyof UserFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!isEdit) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Enter a valid email";
      if (form.password.length < 8) errors.password = "At least 8 characters";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    await onSave(form, user?.id ?? null);
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      title={isEdit ? "Edit User Profile" : "Create User Account"}
      description={isEdit
        ? "Update contact details. Email and role are managed separately for account safety."
        : "Provision a verified account with a password the user can sign in with immediately."}
      submitLabel={isEdit ? "Save Profile" : "Create Account"}
      maxWidth="md"
    >
      {error && <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">{error}</div>}
      <AdminInput label="Full Name" required value={form.name} error={fieldErrors.name} onChange={set("name")} />
      <AdminInput label="Email" type="email" required={!isEdit} disabled={isEdit} value={form.email} error={fieldErrors.email} onChange={set("email")} />
      {!isEdit && (
        <>
          <AdminInput
            label="Initial Password"
            type="password"
            required
            autoComplete="new-password"
            helper="Share securely; ask the user to change it after first sign-in."
            value={form.password}
            error={fieldErrors.password}
            onChange={set("password")}
          />
          <AdminSelect
            label="Role"
            value={form.role}
            onChange={set("role")}
            options={[
              { value: "client", label: "Client" },
              { value: "admin", label: "System Admin" },
            ]}
          />
        </>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <AdminInput label="Phone" type="tel" value={form.phone} onChange={set("phone")} />
        <AdminInput label="Company" value={form.company} onChange={set("company")} />
      </div>
    </AdminModal>
  );
}
