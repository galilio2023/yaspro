"use client";

import React, { useState } from "react";
import { Plus, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminFormFieldProps {
  label: string;
  error?: string | null;
  helper?: string;
  required?: boolean;
  className?: string;
}

export interface AdminInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    AdminFormFieldProps {
  prefixNode?: React.ReactNode;
  suffixNode?: React.ReactNode;
}

export function AdminInput({
  label,
  error,
  helper,
  required,
  className,
  prefixNode,
  suffixNode,
  id,
  ...props
}: AdminInputProps) {
  const inputId = id || label.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const describedBy = error ? errorId : helper ? helperId : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={inputId}
        className="block text-xs font-semibold text-slate-300 tracking-wide"
      >
        {label} {required && <span className="text-rose-400">*</span>}
      </label>

      <div className="relative flex items-center">
        {prefixNode && (
          <div className="absolute start-3.5 flex items-center pointer-events-none text-slate-500 text-xs">
            {prefixNode}
          </div>
        )}

        <input
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            "w-full rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs py-2.5 transition-colors focus:outline-none focus:border-brand-mauve",
            prefixNode ? "ps-9 pe-3.5" : suffixNode ? "pe-12 ps-3.5" : "px-3.5",
            error && "border-rose-500/50 focus:border-rose-500",
            props.disabled && "opacity-50 cursor-not-allowed"
          )}
          {...props}
        />

        {suffixNode && (
          <div className="absolute end-3.5 flex items-center pointer-events-none text-slate-400 text-xs font-mono font-medium">
            {suffixNode}
          </div>
        )}
      </div>

      {helper && !error && (
        <p id={helperId} className="text-[11px] text-slate-500 leading-normal">{helper}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-[11px] text-rose-400 font-medium leading-normal">
          {error}
        </p>
      )}
    </div>
  );
}

export interface AdminTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    AdminFormFieldProps {}

export function AdminTextarea({
  label,
  error,
  helper,
  required,
  className,
  id,
  rows = 3,
  ...props
}: AdminTextareaProps) {
  const inputId = id || label.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const describedBy = error ? errorId : helper ? helperId : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={inputId}
        className="block text-xs font-semibold text-slate-300 tracking-wide"
      >
        {label} {required && <span className="text-rose-400">*</span>}
      </label>

      <textarea
        id={inputId}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(
          "w-full rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs p-3 transition-colors focus:outline-none focus:border-brand-mauve resize-y",
          error && "border-rose-500/50 focus:border-rose-500",
          props.disabled && "opacity-50 cursor-not-allowed"
        )}
        {...props}
      />

      {helper && !error && (
        <p id={helperId} className="text-[11px] text-slate-500 leading-normal">{helper}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-[11px] text-rose-400 font-medium leading-normal">
          {error}
        </p>
      )}
    </div>
  );
}

export interface AdminSelectOption {
  value: string;
  label: string;
}

export interface AdminSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    AdminFormFieldProps {
  options: AdminSelectOption[];
}

export function AdminSelect({
  label,
  options,
  error,
  helper,
  required,
  className,
  id,
  ...props
}: AdminSelectProps) {
  const inputId = id || label.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const describedBy = error ? errorId : helper ? helperId : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={inputId}
        className="block text-xs font-semibold text-slate-300 tracking-wide"
      >
        {label} {required && <span className="text-rose-400">*</span>}
      </label>

      <div className="relative">
        <select
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            "w-full appearance-none rounded-xl bg-slate-900 border border-white/10 text-white text-xs ps-3.5 pe-9 py-2.5 transition-colors focus:outline-none focus:border-brand-mauve cursor-pointer",
            error && "border-rose-500/50 focus:border-rose-500",
            props.disabled && "opacity-50 cursor-not-allowed"
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-white py-1">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>

      {helper && !error && (
        <p id={helperId} className="text-[11px] text-slate-500 leading-normal">{helper}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-[11px] text-rose-400 font-medium leading-normal">
          {error}
        </p>
      )}
    </div>
  );
}

export interface AdminSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function AdminSwitch({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className,
}: AdminSwitchProps) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="pe-4">
        <span className="block text-xs font-semibold text-white">{label}</span>
        {description && (
          <span className="block text-[11px] text-slate-400 mt-0.5">
            {description}
          </span>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={cn(
          "w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 shrink-0",
          checked ? "bg-brand-mauve" : "bg-white/10"
        )}
      >
        <div
          className={cn(
            "bg-white size-4 rounded-full shadow-md transform transition-transform duration-200",
            checked ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

export interface AdminTagsInputProps extends AdminFormFieldProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function AdminTagsInput({
  label,
  tags,
  onChange,
  error,
  helper = "Type and press enter or click '+' to add",
  placeholder = "Add item...",
  className,
}: AdminTagsInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputValue("");
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-xs font-semibold text-slate-300 tracking-wide">
        {label}
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs px-3.5 py-2 transition-colors focus:outline-none focus:border-brand-mauve"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 min-h-[30px] pt-1">
        {tags.map((tag, idx) => (
          <span
            key={`${tag}-${idx}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-violet/30 border border-brand-mauve/30 text-white text-[11px] font-medium"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="text-brand-mauve-soft hover:text-white transition-colors cursor-pointer p-0.5 rounded"
              title={`Remove ${tag}`}
              aria-label={`Remove tag ${tag}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      {helper && <p className="text-[11px] text-slate-500">{helper}</p>}
      {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
    </div>
  );
}
