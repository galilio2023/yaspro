"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { syncUserProfile } from "@/lib/actions";
import {
  User, Mail, Phone, Building, ShieldCheck,
  Pencil, Save, X, CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";

interface PortalSettingsFormProps {
  user: {
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    role: string;
  };
}

export function PortalSettingsForm({ user }: PortalSettingsFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [savedPhone, setSavedPhone] = useState(user.phone ?? "");
  const [savedCompany, setSavedCompany] = useState(user.company ?? "");
  const [editPhone, setEditPhone] = useState(user.phone ?? "");
  const [editCompany, setEditCompany] = useState(user.company ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);
    const res = await syncUserProfile({
      email: user.email,
      phone: editPhone,
      company: editCompany,
    });
    setIsSaving(false);
    if (res.success) {
      setSavedPhone(editPhone.trim());
      setSavedCompany(editCompany.trim());
      setFeedback({ type: "success", msg: "Profile updated successfully." });
      setIsEditing(false);
      router.refresh();
    } else {
      setFeedback({ type: "error", msg: res.message ?? "Failed to save." });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="rounded-3xl bg-slate-900/60 border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <User size={16} className="text-emerald-400" /> Profile Information
        </h2>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <Pencil size={13} /> Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => {
                setIsEditing(false);
                setEditPhone(savedPhone);
                setEditCompany(savedCompany);
                setFeedback(null);
              }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-300 border border-white/10 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <X size={13} /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={`mx-6 mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border ${feedback.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-rose-500/10 border-rose-500/30 text-rose-300"}`}>
          {feedback.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          {feedback.msg}
        </div>
      )}

      {/* Fields */}
      <div className="p-6 space-y-5">
        {/* Name — read only */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="p-2 rounded-xl bg-slate-700/50 text-slate-400 shrink-0">
            <User size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-0.5">Full Name</div>
            <div className="text-sm font-semibold text-white">{user.name}</div>
          </div>
          <span className="ml-auto text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">Read-only</span>
        </div>

        {/* Email — read only */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="p-2 rounded-xl bg-stone-500/15 text-stone-300 shrink-0">
            <Mail size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-0.5">Verified Email</div>
            <div className="text-sm font-semibold text-white">{user.email}</div>
          </div>
          <span className="ml-auto text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">Read-only</span>
        </div>

        {/* Phone — editable */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <Phone size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-0.5">Phone Number</div>
            {isEditing ? (
              <input
                type="tel"
                disabled={isSaving}
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+971 XX XXX XXXX"
                dir="ltr"
                className="w-full text-sm font-semibold text-white bg-white/5 border border-emerald-500/40 rounded-lg px-3 py-1.5 outline-none focus:border-emerald-400/70 placeholder:text-slate-500"
              />
            ) : (
              <div className="text-sm font-semibold text-white" dir="ltr">{savedPhone || "Not provided"}</div>
            )}
          </div>
        </div>

        {/* Company — editable */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
            <Building size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-0.5">Company / Organisation</div>
            {isEditing ? (
              <input
                type="text"
                disabled={isSaving}
                value={editCompany}
                onChange={(e) => setEditCompany(e.target.value)}
                placeholder="Independent"
                className="w-full text-sm font-semibold text-white bg-white/5 border border-amber-500/40 rounded-lg px-3 py-1.5 outline-none focus:border-amber-400/70 placeholder:text-slate-500"
              />
            ) : (
              <div className="text-sm font-semibold text-white">{savedCompany || "Independent"}</div>
            )}
          </div>
        </div>

        {/* Role — read only */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
            <ShieldCheck size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 uppercase tracking-wide mb-0.5">Account Role</div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full capitalize">
              <ShieldCheck size={11} /> {user.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
