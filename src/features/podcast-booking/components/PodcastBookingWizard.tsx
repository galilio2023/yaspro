"use client";

import { useEffect } from "react";
import { usePodcastBooking } from "../hooks/usePodcastBooking";
import { Step1DateTime } from "./Step1DateTime";
import { Step2Setup } from "./Step2Setup";
import { Step3Service } from "./Step3Service";
import { Step4Addons } from "./Step4Addons";
import { PodcastCheckoutModal } from "./PodcastCheckoutModal";
import { PodcastConfirmation } from "./PodcastConfirmation";
import { Plus, ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { BookingStepper, ErrorBanner, formatAED, studioSprings } from "@/features/booking/components/ui/BookingKit";
import { motion } from "framer-motion";

export function PodcastBookingWizard() {
  const {
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
    currentSessionBreakdown,
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
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    updateCurrentSession,
    setAddonQuantity,
    toggleAddon,
    addNewSession,
    removeSession,
    applyPromo,
    removePromo,
    submitBooking,
  } = usePodcastBooking();

  // Elevate floating actions so they do not overlap this wizard's sticky bottom pricing bar
  useEffect(() => {
    document.body.setAttribute("data-has-bottom-pricing-bar", "true");
    return () => {
      document.body.removeAttribute("data-has-bottom-pricing-bar");
    };
  }, []);

  if (confirmedResult) {
    return (
      <PodcastConfirmation
        result={confirmedResult}
        onBookAnother={() => window.location.reload()}
      />
    );
  }

  const stepsList = [
    { id: 1, label: "Date & Time", shortLabel: "Date" },
    { id: 2, label: "Studio Setup", shortLabel: "Setup" },
    { id: 3, label: "Production Tier", shortLabel: "Service" },
    { id: 4, label: "Add-ons & Edits", shortLabel: "Add-ons" },
  ] as const;

  const nextStepLabel = stepsList.find((s) => s.id === step + 1)?.label ?? "Next Step";

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* 1. Multi-Session Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0e0e13] border border-white/[0.08]">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {sessions.map((sess, idx) => {
            const isActive = idx === activeSessionIndex;
            return (
              <div key={sess.id} className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveSessionIndex(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 min-h-[38px] cursor-pointer ${
                    isActive
                      ? "bg-amber-400 text-black shadow-md shadow-amber-500/25"
                      : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]"
                  }`}
                >
                  <span className="font-mono text-[11px] uppercase tracking-wider">Session {idx + 1}</span>
                  {sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSession(idx);
                      }}
                      className="p-1 rounded-md hover:bg-black/20 text-inherit transition cursor-pointer"
                      title="Remove Session"
                      aria-label={`Remove session ${idx + 1}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addNewSession}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition flex items-center gap-1.5 border border-dashed border-white/20 shrink-0 min-h-[38px] cursor-pointer"
          >
            <Plus size={14} /> Add Session
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <span>Live Studio Status:</span>
          <span className="inline-block size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-200 font-medium">Iris Bay Dubai · Level 18</span>
        </div>
      </div>

      {/* 2. Unified Stepper */}
      <div className="p-3 sm:p-5 rounded-2xl bg-[#0b0b0f] border border-white/[0.08]">
        <BookingStepper
          steps={stepsList}
          current={step}
          onStepClick={(num) => setStep(num as 1 | 2 | 3 | 4)}
          canJumpTo={(num) => num < step}
        />
      </div>

      {/* Error Message if any */}
      {errorMessage && <ErrorBanner message={errorMessage} />}

      {/* 3. Step Content Area */}
      <div className="min-h-[440px] rounded-3xl border border-white/[0.08] bg-[#0b0b0f] p-4 sm:p-7 lg:p-8 shadow-2xl">
        {step === 1 && (
          <Step1DateTime
            session={currentSession}
            onChange={updateCurrentSession}
          />
        )}
        {step === 2 && (
          <Step2Setup
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
            session={currentSession}
            onSetQuantity={setAddonQuantity}
            onToggle={toggleAddon}
          />
        )}
      </div>

      {/* 4. Sticky Bottom Action & Pricing Bar */}
      <div
        dir="ltr"
        className="sticky bottom-4 z-40 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#0b0b0f]/95 backdrop-blur-xl border border-white/[0.12] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        {/* Left: Session Details Snapshot */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {step > 1 && (
            <motion.button
              type="button"
              onClick={prevStep}
              whileTap={{ scale: 0.95 }}
              transition={studioSprings.snappy}
              className="size-11 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white flex items-center justify-center transition shrink-0 cursor-pointer"
              title="Previous Step"
            >
              <ArrowLeft size={16} />
            </motion.button>
          )}

          <div className="space-y-0.5 text-left min-w-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-white font-mono uppercase tracking-wider">
                Session {activeSessionIndex + 1}:
              </span>
              <span className="text-amber-400 font-black text-sm sm:text-base tabular-nums">
                {formatAED(currentSessionBreakdown.total)}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate max-w-xs sm:max-w-md">
              {currentStudio.name} • {currentSession.durationHours}h • {currentService.title}
            </p>
          </div>
        </div>

        {/* Right: Next / Checkout Action */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {step < 4 ? (
            <motion.button
              type="button"
              onClick={nextStep}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={studioSprings.snappy}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to {nextStepLabel}</span>
              <ArrowRight size={15} />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={() => setIsCheckoutModalOpen(true)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={studioSprings.snappy}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <span className="px-2 py-0.5 rounded-md bg-black/15 text-black font-mono">
                {formatAED(grandTotal)}
              </span>
            </motion.button>
          )}
        </div>
      </div>

      {/* 5. Checkout Review & Payment Modal */}
      <PodcastCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
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
      />
    </div>
  );
}
