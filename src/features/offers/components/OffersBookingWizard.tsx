"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useOffersBooking } from "../hooks/useOffersBooking";
import { Step1OfferSelection } from "./Step1OfferSelection";
import { Step2Schedule } from "./Step2Schedule";
import { Step3Checkout } from "./Step3Checkout";
import { OffersConfirmation } from "./OffersConfirmation";
import { BookingStepper, formatAED, studioSprings } from "@/features/booking/components/ui/BookingKit";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";

const STEPPER_STEPS_EN = [
  { id: 1, label: "Offers & Bundles", shortLabel: "Packages" },
  { id: 2, label: "Date & Time", shortLabel: "Schedule" },
  { id: 3, label: "Payment & Review", shortLabel: "Payment" },
] as const;

const STEPPER_STEPS_AR = [
  { id: 1, label: "العروض والباقات", shortLabel: "الباقات" },
  { id: 2, label: "الموعد والوقت", shortLabel: "الموعد" },
  { id: 3, label: "الدفع والتأكيد", shortLabel: "الدفع" },
] as const;

const stepVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0, transition: studioSprings.cinematic },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28, transition: { duration: 0.14, ease: "easeIn" } }),
};

export function OffersBookingWizard() {
  const { isArabic } = useLanguage();
  const {
    step,
    setStep,
    nextStep,
    prevStep,
    selectedOfferId,
    setSelectedOfferId,
    selectedOffer,
    date,
    setDate,
    timeSlot,
    setTimeSlot,
    contact,
    updateContact,
    promoCodeInput,
    setPromoCodeInput,
    appliedPromo,
    promoDiscount,
    promoError,
    applyPromo,
    removePromo,
    breakdown,
    isSubmitting,
    errorMessage,
    confirmedResult,
    submitBooking,
    canProceedToStep2,
    canProceedToStep3,
  } = useOffersBooking();

  const [direction, setDirection] = useState<number>(1);
  const stepperSteps = isArabic ? STEPPER_STEPS_AR : STEPPER_STEPS_EN;

  // Elevate floating actions so they do not overlap this wizard's sticky mobile action bar
  useEffect(() => {
    if (confirmedResult) return;
    document.body.setAttribute("data-has-bottom-pricing-bar", "true");
    return () => {
      document.body.removeAttribute("data-has-bottom-pricing-bar");
    };
  }, [confirmedResult]);

  const scrollToWizard = () => {
    const el = document.getElementById("offers-booking-wizard");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNextStep = () => {
    setDirection(1);
    nextStep();
    requestAnimationFrame(scrollToWizard);
  };

  const handlePrevStep = () => {
    setDirection(-1);
    prevStep();
    requestAnimationFrame(scrollToWizard);
  };

  if (confirmedResult) {
    return (
      <div className="w-full max-w-xl mx-auto py-6">
        <OffersConfirmation
          referenceCode={confirmedResult.referenceCode}
          email={contact.email}
          bookingId={confirmedResult.bookingId}
          totalAmount={confirmedResult.totalAmount || breakdown.grandTotal}
          offerName={isArabic ? selectedOffer.nameAr : selectedOffer.name}
          date={date}
          timeSlot={timeSlot}
        />
      </div>
    );
  }

  return (
    <div id="offers-booking-wizard" className="w-full space-y-8 scroll-mt-24">
      {/* ── Stepper Header ── */}
      <div className="max-w-2xl mx-auto px-2">
        <BookingStepper
          steps={stepperSteps}
          current={step}
          onStepClick={(id) => {
            setDirection(id > step ? 1 : -1);
            setStep(id);
            requestAnimationFrame(scrollToWizard);
          }}
          canJumpTo={(id) => {
            if (id === 1) return true;
            if (id === 2) return canProceedToStep2;
            if (id === 3) return canProceedToStep2 && canProceedToStep3;
            return false;
          }}
          ariaLabel="Offers booking progress"
        />
      </div>

      {/* ── Step Content with Motion ── */}
      <div className="min-h-[480px]">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <Step1OfferSelection
                selectedOfferId={selectedOfferId}
                onSelectOffer={setSelectedOfferId}
                onContinue={handleNextStep}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <Step2Schedule
                offer={selectedOffer}
                selectedDate={date}
                selectedTimeSlot={timeSlot}
                onDateChange={setDate}
                onTimeSlotChange={setTimeSlot}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <Step3Checkout
                offer={selectedOffer}
                date={date}
                timeSlot={timeSlot}
                contact={contact}
                onUpdateContact={updateContact}
                breakdown={breakdown}
                promoInput={promoCodeInput}
                onPromoInputChange={setPromoCodeInput}
                appliedPromo={appliedPromo}
                promoError={promoError}
                onApplyPromo={applyPromo}
                onRemovePromo={removePromo}
                isSubmitting={isSubmitting}
                errorMessage={errorMessage}
                onSubmit={submitBooking}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Wizard Sticky Action Bar ── */}
      <div className="sticky bottom-0 z-40 -mx-4 sm:mx-0 p-4 sm:p-5 bg-black/90 sm:bg-[#0c0c10]/95 backdrop-blur-xl sm:rounded-2xl border-t sm:border border-white/10 shadow-2xl flex items-center justify-between gap-3">
        {/* Step Indicator & Back Button */}
        <div className="flex items-center gap-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft size={14} className="rtl:rotate-180" />
              <span>{isArabic ? "السابق" : "Back"}</span>
            </button>
          ) : (
            <div className="font-mono text-xs text-zinc-500">
              {isArabic ? "الخطوة 1 من 3" : "Step 1 of 3"}
            </div>
          )}
        </div>

        {/* Selected Offer & Price pill (Desktop only) */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-xs text-zinc-400 font-medium">
            {isArabic ? selectedOffer.nameAr : selectedOffer.name}
          </span>
          <span className="text-sm font-bold text-brand-mauve font-display">
            {formatAED(breakdown.grandTotal, 2)}
          </span>
        </div>

        {/* Continue Button (Steps 1 & 2) */}
        {step < 3 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="px-6 py-2.5 rounded-xl bg-brand-mauve hover:bg-brand-mauve-soft text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-brand-violet/20 cursor-pointer active:scale-98"
          >
            <span>
              {step === 1
                ? isArabic
                  ? "تحديد الموعد والوقت"
                  : "Select Date & Time"
                : isArabic
                ? "متابعة إلى الدفع"
                : "Proceed to Checkout"}
            </span>
            <ArrowRight size={14} className="rtl:rotate-180" />
          </button>
        ) : (
          <div className="text-xs text-zinc-500 font-mono">
            {isArabic ? "جاهز للتأكيد النهائي" : "Ready for Confirmation"}
          </div>
        )}
      </div>
    </div>
  );
}
