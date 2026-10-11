"use client";

/**
 * Yaspro Booking Kit
 * Shared visual primitives for Studio Booking and Podcast Booking so both
 * flows speak the same cinematic language (obsidian surfaces, tungsten amber
 * focal light, razor borders, mono production metadata, spring physics).
 */

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type HTMLMotionProps } from "framer-motion";
import { AlertCircle, ArrowUpRight, Check, Minus, Plus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const studioSprings = {
  snappy: { type: "spring", stiffness: 450, damping: 28 },
  cinematic: { type: "spring", stiffness: 260, damping: 32 },
} as const;

export const formatAED = (value: number, fractionDigits = 0) =>
  `AED ${value.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;

const pad2 = (n: number) => String(n).padStart(2, "0");

/* -------------------------------------------------------------------------- */
/*                                  Page Hero                                 */
/* -------------------------------------------------------------------------- */

export interface BookingHeroSpec {
  label: string;
  value: string;
}

export function BookingHero({
  headingId,
  eyebrow,
  title,
  accent,
  description,
  specs,
  crossLink,
}: {
  headingId: string;
  eyebrow: string;
  title: string;
  accent?: string;
  description: string;
  specs: BookingHeroSpec[];
  crossLink?: { href: string; label: string; cta: string };
}) {
  return (
    <header className="mb-6 sm:mb-14 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-12 items-end">
      <div className="lg:col-span-7 space-y-3 sm:space-y-5">
        <div className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-zinc-400">
          <span className="relative flex size-2">
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-60" />
            <span className="relative size-2 rounded-full bg-red-500" />
          </span>
          <span>{eyebrow}</span>
        </div>

        <h1
          id={headingId}
          className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.05] sm:leading-[1.02] text-balance"
        >
          {title}
          {accent && (
            <>
              {" "}
              <span className="text-brand-mauve">{accent}</span>
            </>
          )}
        </h1>

        <p className="text-xs sm:text-base text-zinc-400 leading-relaxed max-w-xl">{description}</p>

        {crossLink && (
          <Link
            href={crossLink.href}
            className="group flex flex-wrap sm:inline-flex items-center gap-1.5 sm:gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <span>{crossLink.label}</span>
            <span className="inline-flex items-center gap-1 font-semibold text-brand-mauve group-hover:text-brand-mauve-soft">
              {crossLink.cta}
              <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </Link>
        )}
      </div>

      {/* Spec sheet: 2x2 micro-grid on mobile, vertical list on desktop */}
      <dl className="lg:col-span-5 rounded-2xl border border-white/[0.08] bg-white/[0.015] overflow-hidden">
        <div className="px-3.5 sm:px-5 py-2 sm:py-3 flex items-center justify-between bg-white/[0.02] border-b border-white/[0.06]">
          <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-zinc-500">Production Sheet</span>
          <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-brand-mauve/90">Iris Bay · DXB</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 divide-y sm:divide-y-0 lg:divide-y divide-white/[0.06] sm:gap-px sm:bg-white/[0.06] lg:bg-transparent">
          {specs.map((spec) => (
            <div key={spec.label} className="px-3.5 sm:px-5 py-2 sm:py-3 flex sm:flex-col lg:flex-row items-center sm:items-start lg:items-center justify-between gap-2 sm:gap-1 lg:gap-4 bg-[#0b0b0f] sm:bg-[#0e0e13] lg:bg-transparent">
              <dt className="font-mono text-[9px] sm:text-[10px] tracking-[0.16em] uppercase text-zinc-500 shrink-0">{spec.label}</dt>
              <dd className="text-[11px] sm:text-xs font-medium text-zinc-100 text-end sm:text-start lg:text-end truncate max-w-[220px] sm:max-w-none">{spec.value}</dd>
            </div>
          ))}
        </div>
      </dl>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Stepper                                  */
/* -------------------------------------------------------------------------- */

export interface BookingStep {
  id: number;
  label: string;
  shortLabel?: string;
}

export function BookingStepper({
  steps,
  current,
  onStepClick,
  canJumpTo = () => true,
  ariaLabel = "Booking steps",
}: {
  steps: readonly BookingStep[];
  current: number;
  onStepClick: (id: number) => void;
  canJumpTo?: (id: number) => boolean;
  ariaLabel?: string;
}) {
  const active = steps.find((s) => s.id === current);
  const progress = steps.length > 1 ? ((current - 1) / (steps.length - 1)) * 100 : 100;
  const edgeInset = 100 / (steps.length * 2);

  return (
    <nav aria-label={ariaLabel} dir="ltr" className="w-full">
      {/* Compact header (mobile) */}
      <div className="flex items-baseline justify-between mb-3 sm:hidden">
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-brand-mauve">
          Step {pad2(current)} / {pad2(steps.length)}
        </span>
        <span className="text-sm font-semibold text-white">{active?.label}</span>
      </div>

      {/* Mobile progress rail */}
      <div className="sm:hidden h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-brand-mauve"
          initial={false}
          animate={{ width: `${(current / steps.length) * 100}%` }}
          transition={studioSprings.cinematic}
        />
      </div>

      {/* Desktop stepper */}
      <div className="hidden sm:block relative">
        <div
          aria-hidden
          className="absolute top-4 h-px bg-white/[0.08]"
          style={{ left: `${edgeInset}%`, right: `${edgeInset}%` }}
        />
        <motion.div
          aria-hidden
          className="absolute top-4 h-px bg-brand-mauve/80"
          style={{ left: `${edgeInset}%` }}
          initial={false}
          animate={{ width: `${(100 - edgeInset * 2) * (progress / 100)}%` }}
          transition={studioSprings.cinematic}
        />

      <ol className="relative flex items-start justify-between">
        {steps.map((s) => {
          const isCurrent = s.id === current;
          const isDone = s.id < current;
          const enabled = isCurrent || canJumpTo(s.id);

          return (
            <li key={s.id} className="relative z-10 flex flex-col items-center min-w-0 flex-1">
              <button
                type="button"
                onClick={() => enabled && onStepClick(s.id)}
                disabled={!enabled}
                aria-current={isCurrent ? "step" : undefined}
                className="group flex flex-col items-center gap-2 disabled:cursor-not-allowed focus-visible:outline-none"
              >
                <span
                  className={cn(
                    "size-8 rounded-full flex items-center justify-center font-mono text-[11px] font-semibold transition-all duration-200 ring-4 ring-[#070709]",
                    isCurrent && "bg-brand-mauve text-zinc-950 shadow-[0_0_0_1px_rgba(187,167,195,0.6),0_8px_24px_-6px_rgba(152,123,165,0.55)]",
                    isDone && "bg-zinc-100 text-black group-hover:bg-white",
                    !isCurrent && !isDone && "bg-[#111115] text-zinc-500 border border-white/10 group-enabled:group-hover:border-white/25 group-enabled:group-hover:text-zinc-300",
                    "group-focus-visible:ring-brand-mauve/40"
                  )}
                >
                  {isDone ? <Check size={14} strokeWidth={3} /> : pad2(s.id)}
                </span>
                <span
                  className={cn(
                    "text-[11px] lg:text-xs font-medium tracking-tight whitespace-nowrap transition-colors px-1",
                    isCurrent ? "text-white" : isDone ? "text-zinc-300" : "text-zinc-500"
                  )}
                >
                  <span className="lg:hidden">{s.shortLabel ?? s.label}</span>
                  <span className="hidden lg:inline">{s.label}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      </div>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Step Intro                                 */
/* -------------------------------------------------------------------------- */

export function StepIntro({
  index,
  total,
  title,
  description,
  aside,
}: {
  index: number;
  total: number;
  title: string;
  description?: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="pb-3.5 sm:pb-5 mb-4 sm:mb-6 border-b border-white/[0.06]">
      <div className="flex items-center justify-between gap-2 mb-1 sm:mb-1.5">
        <span className="block font-mono text-[10px] tracking-[0.22em] uppercase text-brand-mauve">
          Step {pad2(index)} — {pad2(total)}
        </span>
        {aside && <div className="shrink-0 sm:hidden">{aside}</div>}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-3">
        <div className="space-y-1 min-w-0">
          <h2 className="text-xl sm:text-[28px] font-bold text-white tracking-tight leading-tight">{title}</h2>
          {description && <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl">{description}</p>}
        </div>
        {aside && <div className="hidden sm:block shrink-0">{aside}</div>}
      </div>
    </div>
  );
}

export function MetaTag({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "amber" | "mauve" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[10px] tracking-[0.14em] uppercase border whitespace-nowrap shrink-0",
        tone === "amber" || tone === "mauve"
          ? "bg-brand-mauve/15 border-brand-mauve/30 text-brand-mauve font-semibold"
          : "bg-white/[0.03] border-white/10 text-zinc-400"
      )}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Cards                                   */
/* -------------------------------------------------------------------------- */

export const cardSurface = (selected: boolean, disabled = false) =>
  cn(
    "relative rounded-2xl border overflow-hidden text-start flex flex-col transition-[border-color,background-color,box-shadow] duration-200",
    selected
      ? "border-brand-mauve/70 bg-brand-mauve/[0.05] shadow-[0_0_0_1px_rgba(152,123,165,0.35),0_24px_48px_-24px_rgba(84,37,104,0.45)]"
      : "border-white/[0.08] bg-[#0e0e12] hover:border-white/20 hover:bg-[#121217]",
    disabled && "opacity-45 hover:border-white/[0.08] hover:bg-[#0e0e12]"
  );

export function SelectedMark({ selected, className }: { selected: boolean; className?: string }) {
  return (
    <motion.span
      aria-hidden
      initial={false}
      animate={{ scale: selected ? 1 : 0.6, opacity: selected ? 1 : 0 }}
      transition={studioSprings.snappy}
      className={cn(
        "absolute top-3 end-3 z-10 size-7 rounded-full bg-brand-mauve text-zinc-950 flex items-center justify-center shadow-lg shadow-black/40",
        className
      )}
    >
      <Check size={15} strokeWidth={3} />
    </motion.span>
  );
}

type SelectableCardProps = Omit<HTMLMotionProps<"button">, "onClick" | "children"> & {
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  showMark?: boolean;
};

export function SelectableCard({
  selected,
  disabled,
  onSelect,
  children,
  className,
  showMark = true,
  ...rest
}: SelectableCardProps) {
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.985 }}
      transition={studioSprings.snappy}
      className={cn(
        cardSurface(selected, disabled),
        "group w-full cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mauve/50",
        className
      )}
      {...rest}
    >
      {showMark && <SelectedMark selected={selected} />}
      {children}
    </motion.button>
  );
}

export function CardMedia({
  src,
  alt,
  className,
  contain = false,
  children,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  contain?: boolean;
  children?: React.ReactNode;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative w-full aspect-[16/9] overflow-hidden bg-zinc-900", contain && "bg-white/[0.02]", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={cn(
          "transition-transform duration-700 ease-out group-hover:scale-[1.04]",
          contain ? "object-contain p-5" : "object-cover"
        )}
      />
      {!contain && (
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0e0e12] via-[#0e0e12]/10 to-transparent" />
      )}
      {children}
    </div>
  );
}

export function PriceLine({
  amount,
  unit,
  emphasis = false,
}: {
  amount: number;
  unit?: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-1.5 tabular-nums">
      <span className={cn("font-bold tracking-tight", emphasis ? "text-brand-mauve text-base" : "text-white text-sm sm:text-base")}>
        {formatAED(amount)}
      </span>
      {unit && <span className="text-[11px] text-zinc-500">/ {unit}</span>}
    </div>
  );
}

/** Non-interactive visual pill for toggle cards (the whole card is the button). */
export function TogglePill({
  selected,
  addLabel = "Add",
  addedLabel = "Added",
  className,
}: {
  selected: boolean;
  addLabel?: string;
  addedLabel?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0",
        selected ? "bg-brand-mauve text-zinc-950" : "bg-white/[0.06] text-zinc-300 group-hover:bg-white/[0.1] group-hover:text-white",
        className
      )}
    >
      {selected ? <Check size={11} strokeWidth={3} /> : <Plus size={11} />}
      {selected ? addedLabel : addLabel}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Inputs & Chips                               */
/* -------------------------------------------------------------------------- */

export function ChoiceChip({
  selected,
  onClick,
  children,
  className,
  disabled,
  ariaLabel,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      transition={studioSprings.snappy}
      className={cn(
        "relative min-h-[40px] rounded-xl border text-xs font-semibold tabular-nums transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mauve/50",
        selected
          ? "bg-brand-mauve border-brand-mauve text-zinc-950 shadow-[0_8px_20px_-8px_rgba(152,123,165,0.6)]"
          : "bg-white/[0.02] border-white/[0.08] text-zinc-300 hover:border-white/20 hover:text-white hover:bg-white/[0.04]",
        className
      )}
    >
      {children}
    </motion.button>
  );
}

export function Counter({
  value,
  min,
  max,
  onChange,
  format = (v) => String(v),
  decLabel = "Decrease",
  incLabel = "Increase",
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  decLabel?: string;
  incLabel?: string;
}) {
  return (
    <div dir="ltr" className="inline-flex items-center rounded-xl border border-white/10 bg-black/30 p-1">
      <button
        type="button"
        aria-label={decLabel}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="size-9 rounded-lg flex items-center justify-center text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        <Minus size={15} />
      </button>
      <motion.span
        key={value}
        initial={{ y: -6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={studioSprings.snappy}
        className="min-w-[56px] text-center font-mono text-sm font-semibold text-white tabular-nums"
      >
        {format(value)}
      </motion.span>
      <button
        type="button"
        aria-label={incLabel}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="size-9 rounded-lg flex items-center justify-center text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Panels & Alerts                              */
/* -------------------------------------------------------------------------- */

export function Panel({
  icon: Icon,
  title,
  description,
  aside,
  children,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  aside?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-white/[0.07] bg-white/[0.015] p-4 sm:p-6 space-y-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {Icon && (
            <span className="size-9 shrink-0 rounded-xl bg-brand-mauve/10 border border-brand-mauve/25 text-brand-lavender flex items-center justify-center">
              <Icon size={17} />
            </span>
          )}
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-white leading-tight">{title}</h3>
            {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
          </div>
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

export function ErrorBanner({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={studioSprings.snappy}
      className="p-3.5 rounded-xl bg-red-500/[0.08] border border-red-500/25 flex items-center gap-2.5 text-red-200 text-xs sm:text-sm"
    >
      <AlertCircle size={16} className="text-red-400 shrink-0" />
      <span>{message}</span>
    </motion.div>
  );
}

export const fieldClass =
  "w-full px-3.5 py-2.5 min-h-[46px] rounded-xl bg-black/30 border border-white/10 text-white text-base sm:text-sm placeholder:text-zinc-600 focus:outline-none focus:border-brand-mauve/70 focus:ring-2 focus:ring-brand-mauve/20 transition-colors";

export function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-[11px] font-medium text-zinc-400">
        {label}
        {required && <span className="text-brand-mauve ms-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}
