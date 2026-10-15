"use client";

import { useEffect, useState } from "react";
import type { PodcastStudio, PodcastAddon } from "../types";
import { usePodcastBooking } from "../hooks/usePodcastBooking";
import { Step1DateTime } from "./Step1DateTime";
import { Step2Setup } from "./Step2Setup";
import { Step3Service } from "./Step3Service";
import { Step4Addons } from "./Step4Addons";
import { Step5ReviewCheckout } from "./Step5ReviewCheckout";
import { PodcastQuoteRail } from "./PodcastQuoteRail";
import { PodcastConfirmation } from "./PodcastConfirmation";
import { Plus, ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { BookingStepper, ErrorBanner, formatAED, studioSprings } from "@/features/booking/components/ui/BookingKit";
import { motion, AnimatePresence, Variants } from "framer-motion";

const STEPPER_STEPS = [
  { id: 1, label: "Schedule & Time", shortLabel: "Schedule" },
  { id: 2, label: "Studio Setup", shortLabel: "Studio" },
  { id: 3, label: "Production Tier", shortLabel: "Tier" },
  { id: 4, label: "Add-ons & Edits", shortLabel: "Add-ons" },
  { id: 5, label: "Review & Checkout", shortLabel: "Review" },
] as const;

const stepVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0, transition: studioSprings.cinematic },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28, transition: { duration: 0.14, ease: "easeIn" } }),
};

export function PodcastBookingWizard({ studios: catalogStudios, addons: catalogAddons }: { studios?: PodcastStudio[]; addons?: PodcastAddon[] } = {}) {
  const {
    studios,
    addons,
    step,
    setStep,
    nextStep,
    prevStep,
    sessions,
    activeSessionIndex,
    setActiveSessionIndex,
    currentSession,
    currentStudio,
    currentService,
    subtotalAllSessions,
    promoDiscount,
    grandTotal,
    appliedPromo,
    promoError,
    contact,
    setContact,
    isAgreedToTerms,
    setIsAgreedToTerms,
    isSubmitting,
    errorMessage,
    confirmedResult,
    updateCurrentSession,
    setAddonQuantity,
    toggleAddon,
    addNewSession,
    removeSession,
    applyPromo,
    removePromo,
    submitBooking,
  } = usePodcastBooking(catalogStudios, catalogAddons);

  const [direction, setDirection] = useState(1);

  // Elevate floating actions so they do not overlap this wizard's sticky mobile action bar
  useEffect(() => {
    if (confirmedResult) return;
    document.body.setAttribute("data-has-bottom-pricing-bar", "true");
    return () => {
      document.body.removeAttribute("data-has-bottom-pricing-bar");
    };
  }, [confirmedResult]);

  const scrollToTop = () => {
    const el = document.getElementById("podcast-booking-wizard");
    if (el && el.getBoundingClientRect().top < 0) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNextStep = () => {
    setDirection(1);
    const before = step;
    nextStep();
    if (before !== step) scrollToTop();
    else requestAnimationFrame(scrollToTop);
  };

  const handlePrevStep = () => {
    setDirection(-1);
    prevStep();
    requestAnimationFrame(scrollToTop);
  };

  const handleStepClick = (newStep: number) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep as 1 | 2 | 3 | 4 | 5);
    requestAnimationFrame(scrollToTop);
  };

  if (confirmedResult) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8">
        <PodcastConfirmation
          result={confirmedResult}
          onBookAnother={() => window.location.reload()}
        />
      </div>
    );
  }

  const isLastStep = step === 5;
  const nextStepLabel = STEPPER_STEPS.find((s) => s.id === step + 1)?.shortLabel ?? "Next";

  return (
    <div id="podcast-booking-wizard" className="w-full max-w-6xl mx-auto scroll-mt-28 space-y-6 sm:space-y-8">
      {/* 1. Multi-Session Tabs Bar (Clean, subtle session tabs) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0e0e13] border border-white/[0.08]">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {sessions.map((sess, idx) => {
            const isActive = idx === activeSessionIndex;
            return (
              <div
                key={sess.id}
                className={`flex items-center rounded-xl transition overflow-hidden shrink-0 border ${
                  isActive
                    ? "bg-brand-violet text-white border-brand-mauve/50 shadow-md shadow-brand-violet/40"
                    : "bg-white/[0.04] text-zinc-400 hover:text-white border-white/[0.06] hover:bg-white/[0.08]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveSessionIndex(idx)}
                  className="px-3.5 py-1.5 text-xs font-bold font-mono uppercase tracking-wider min-h-[36px] cursor-pointer whitespace-nowrap"
                >
                  Session {idx + 1}
                </button>
                {sessions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSession(idx)}
                    className="pe-2.5 ps-0.5 py-1.5 opacity-70 hover:opacity-100 transition cursor-pointer"
                    title="Remove Session"
                    aria-label={`Remove session ${idx + 1}`}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={addNewSession}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition flex items-center gap-1.5 border border-dashed border-white/20 shrink-0 min-h-[36px] cursor-pointer"
          >
            <Plus size={13} /> Add Session
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 font-mono whitespace-nowrap shrink-0">
          <span>Studio Engine:</span>
          <span className="inline-block size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-200 font-medium">Iris Bay Dubai · Level 18</span>
        </div>
      </div>

      {/* 2. Unified 5-Step Stepper */}
      <div className="p-3 sm:p-5 rounded-2xl bg-[#0b0b0f] border border-white/[0.08]">
        <BookingStepper
          steps={STEPPER_STEPS}
          current={step}
          onStepClick={handleStepClick}
          canJumpTo={(num) => num < step}
        />
      </div>

      {/* 3. Main Stage & Live Quote Rail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        {/* Main Stage */}
        <div className="min-w-0">
          <div className="rounded-3xl border border-white/[0.08] bg-[#0b0b0f] p-4 sm:p-7 lg:p-8 pb-6 sm:pb-8 lg:pb-8 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]">
            {errorMessage && step !== 5 && (
              <div className="mb-5">
                <ErrorBanner message={errorMessage} />
              </div>
            )}

            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {step === 1 && (
                  <Step1DateTime
                    session={currentSession}
                    onChange={updateCurrentSession}
                  />
                )}
                {step === 2 && (
                  <Step2Setup
                    studios={studios}
                    session={currentSession}
                    onChange={updateCurrentSession}
                  />
                )}
                {step === 3 && (
                  <Step3Service
                    session={currentSession}
                    onChange={updateCurrentSession}
                  />
                )}
                {step === 4 && (
                  <Step4Addons
                    addons={addons}
                    session={currentSession}
                    onSetQuantity={setAddonQuantity}
                    onToggle={toggleAddon}
                  />
                )}
                {step === 5 && (
                  <Step5ReviewCheckout
                    studios={studios}
                    addons={addons}
                    sessions={sessions}
                    contact={contact}
                    onUpdateContact={(up) => setContact((prev) => ({ ...prev, ...up }))}
                    appliedPromo={appliedPromo}
                    promoDiscount={promoDiscount}
                    promoError={promoError}
                    onApplyPromo={applyPromo}
                    onRemovePromo={removePromo}
                    subtotal={subtotalAllSessions}
                    grandTotal={grandTotal}
                    isAgreedToTerms={isAgreedToTerms}
                    onToggleTerms={setIsAgreedToTerms}
                    isSubmitting={isSubmitting}
                    errorMessage={errorMessage}
                    onSubmit={submitBooking}
                    onEditSession={(idx) => {
                      setActiveSessionIndex(idx);
                      setDirection(-1);
                      setStep(1);
                      requestAnimationFrame(scrollToTop);
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action bar — sticky on mobile, inline on desktop */}
          <div
            dir="ltr"
            className="sticky bottom-2 sm:bottom-3 z-30 mt-3 sm:mt-4 lg:static lg:mt-5 rounded-xl sm:rounded-2xl border border-white/[0.1] lg:border-transparent bg-[#0b0b0f]/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none p-2 sm:p-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:pb-0 lg:p-0 shadow-2xl lg:shadow-none flex items-center gap-2 sm:gap-3"
          >
            {step > 1 && (
              <motion.button
                type="button"
                onClick={handlePrevStep}
                whileTap={{ scale: 0.96 }}
                transition={studioSprings.snappy}
                aria-label="Back"
                className="h-9 sm:h-11 px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 text-zinc-200 text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 cursor-pointer transition-colors shrink-0"
              >
                <ArrowLeft size={14} className="sm:size-[15px]" />
                <span className="hidden sm:inline">Back</span>
              </motion.button>
            )}

            {/* Mobile running total snapshot — hidden on last step since Step5 has its own checkout action card */}
            {!isLastStep && (
              <div className="lg:hidden min-w-0 flex-1">
                <span className="block font-mono text-[9px] sm:text-[10px] tracking-[0.16em] uppercase text-zinc-500">
                  Total ({sessions.length} {sessions.length === 1 ? "Session" : "Sessions"})
                </span>
                <span className="block text-xs sm:text-base font-bold text-brand-mauve tabular-nums truncate">
                  {formatAED(grandTotal)}
                </span>
              </div>
            )}

            {!isLastStep && (
              <motion.button
                type="button"
                onClick={handleNextStep}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={studioSprings.snappy}
                className="lg:ms-auto h-9 sm:h-11 px-3 sm:px-5 rounded-lg sm:rounded-xl btn-brand text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-2 cursor-pointer shrink-0"
              >
                <span>
                  <span className="sm:hidden">Continue</span>
                  <span className="hidden sm:inline">Continue · {nextStepLabel}</span>
                </span>
                <ArrowRight size={14} className="sm:size-[15px]" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Live Studio Quote Rail (Sticky on desktop) */}
        <div className="hidden lg:block sticky top-28">
          {currentStudio && <PodcastQuoteRail
            addons={addons}
            session={currentSession}
            studio={currentStudio}
            service={currentService}
            allSessions={sessions}
            activeSessionIndex={activeSessionIndex}
            onSelectSessionIndex={setActiveSessionIndex}
            subtotal={subtotalAllSessions}
            promoDiscount={promoDiscount}
            appliedPromo={appliedPromo}
            grandTotal={grandTotal}
            onRemoveAddon={(key) => setAddonQuantity(key, 0)}
            onApplyPromo={applyPromo}
            onRemovePromo={removePromo}
            promoError={promoError}
          />}
        </div>
      </div>
    </div>
  );
}
