"use client";

import { useEffect } from "react";
import { usePodcastBooking } from "../hooks/usePodcastBooking";
import { Step1DateTime } from "./Step1DateTime";
import { Step2Setup } from "./Step2Setup";
import { Step3Service } from "./Step3Service";
import { Step4Addons } from "./Step4Addons";
import { PodcastCheckoutModal } from "./PodcastCheckoutModal";
import { PodcastConfirmation } from "./PodcastConfirmation";
import { Calendar, Layers, Sparkles, Plus, ArrowLeft, ArrowRight, Check, Trash2, AlertCircle } from "lucide-react";

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
    document.body.setAttribute("data-has-bottom-cart", "true");
    return () => {
      document.body.removeAttribute("data-has-bottom-cart");
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
    { num: 1, label: "Date & Time", shortLabel: "Date", icon: Calendar },
    { num: 2, label: "Setup", shortLabel: "Setup", icon: Layers },
    { num: 3, label: "Service", shortLabel: "Service", icon: Sparkles },
    { num: 4, label: "Add-ons", shortLabel: "Add-ons", icon: Plus },
  ] as const;

  const nextStepLabel = stepsList.find((s) => s.num === step + 1)?.label ?? "Next Step";

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* 1. Multi-Session Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {sessions.map((sess, idx) => {
            const isActive = idx === activeSessionIndex;
            return (
              <div key={sess.id} className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveSessionIndex(idx)}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 min-h-[36px] ${
                    isActive
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                      : "bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08]"
                  }`}
                >
                  <span>Session {idx + 1}</span>
                  {sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSession(idx);
                      }}
                      className="p-1 rounded hover:bg-black/20 text-inherit transition"
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
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition flex items-center gap-1.5 border border-dashed border-white/20 shrink-0 min-h-[36px]"
          >
            <Plus size={14} /> Add Session
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted">
          <span>Live Studio Availability:</span>
          <span className="inline-block size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-medium">Iris Bay Dubai</span>
        </div>
      </div>

      {/* 2. Step Navigation Bar */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-4 p-1.5 sm:p-3 rounded-2xl bg-white/[0.02] border border-white/10">
        {stepsList.map((st) => {
          const isActive = step === st.num;
          const isCompleted = step > st.num;
          const Icon = st.icon;

          return (
            <button
              key={st.num}
              type="button"
              onClick={() => setStep(st.num)}
              className={`p-2 sm:p-3.5 rounded-xl transition flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-center sm:text-left min-h-[44px] justify-center sm:justify-start ${
                isActive
                  ? "bg-white/[0.08] border border-amber-500/40 text-white"
                  : isCompleted
                  ? "text-emerald-400 hover:bg-white/[0.04]"
                  : "text-white/40 hover:bg-white/[0.02]"
              }`}
            >
              <div
                className={`size-6 sm:size-7 rounded-lg flex items-center justify-center text-[11px] sm:text-xs font-bold shrink-0 ${
                  isActive
                    ? "bg-amber-500 text-black shadow-sm"
                    : isCompleted
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-white/5 text-white/40"
                }`}
              >
                {isCompleted ? <Check size={13} /> : st.num}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wider text-text-muted block leading-none hidden sm:block">
                  Step {st.num}
                </span>
                <span className="text-[11px] sm:text-sm font-bold truncate block">
                  <span className="inline sm:hidden">{st.shortLabel}</span>
                  <span className="hidden sm:inline">{st.label}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Error Message if any */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3. Step Content Area */}
      <div className="min-h-[420px]">
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
      <div className="sticky bottom-4 z-40 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-zinc-950/95 backdrop-blur-xl border border-white/15 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Session Details Snapshot */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="size-10 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition shrink-0"
              title="Previous Step"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          <div className="space-y-0.5 text-left min-w-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-white">
                Session {activeSessionIndex + 1}:
              </span>
              <span className="text-amber-400 font-extrabold text-sm sm:text-base">
                AED {currentSessionBreakdown.total.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-text-muted truncate max-w-xs sm:max-w-md">
              {currentStudio.name} • {currentSession.durationHours}h • {currentService.title}
            </p>
          </div>
        </div>

        {/* Right: Next / Checkout Action */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
            >
              <span>Continue to {nextStepLabel}</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCheckoutModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <span className="px-2 py-0.5 rounded-md bg-black/15 text-black font-mono">
                AED {grandTotal.toLocaleString()}
              </span>
            </button>
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
