"use client";

import type { StudioItem } from "../types";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { WIZARD_STEPS } from "../constants";
import { useBookingWizard } from "../hooks/useBookingWizard";
import { BookingConfirmation } from "./BookingConfirmation";
import { StudioQuoteRail } from "./StudioQuoteRail";
import { BookingStepper, ErrorBanner, formatAED, studioSprings } from "./ui/BookingKit";

import { StepDatetime } from "./steps/StepDatetime";
import { StepSessionType } from "./steps/StepSessionType";
import { StepStudio } from "./steps/StepStudio";
import { StepCrewEquipment } from "./steps/StepCrewEquipment";
import { StepProps } from "./steps/StepProps";
import { StepPostProduction } from "./steps/StepPostProduction";
import { StepContact } from "./steps/StepContact";

const STEPPER_STEPS = WIZARD_STEPS.map((s) => ({
  id: s.id,
  label: s.label,
  shortLabel: s.label.split(" ")[0].replace("&", "").trim() || s.label,
}));

const stepVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0, transition: studioSprings.cinematic },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28, transition: { duration: 0.14, ease: "easeIn" } }),
};

export function BookingWizard({ studios }: { studios: StudioItem[] }) {
  const {
    step,
    setStep,
    nextStep,
    prevStep,
    state,
    update,
    studio,
    studios: wizardStudios,
    sessionTypeObj,
    selectedCrewItems,
    selectedPropItems,
    selectedAddonItems,
    removeCrewItem,
    removePropItem,
    removeAddonItem,
    total,
    breakdown,
    isSubmitting,
    confirmed,
    referenceCode,
    bookingId,
    errorMessage,
    handleSubmit,
  } = useBookingWizard(studios);

  const [direction, setDirection] = useState(1);
  const totalSteps = WIZARD_STEPS.length;
  const isLastStep = step === totalSteps;
  const nextLabel = WIZARD_STEPS.find((s) => s.id === step + 1)?.label;

  // Lift floating action buttons above the sticky mobile action bar
  useEffect(() => {
    if (confirmed) return;
    document.body.setAttribute("data-has-bottom-pricing-bar", "true");
    return () => document.body.removeAttribute("data-has-bottom-pricing-bar");
  }, [confirmed]);

  const scrollToTop = () => {
    const el = document.getElementById("studio-booking-wizard");
    if (el && el.getBoundingClientRect().top < 0) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (confirmed) {
    return (
      <div className="w-full max-w-xl mx-auto py-8">
        <BookingConfirmation referenceCode={referenceCode} email={state.email} bookingId={bookingId} totalAmount={total} />
      </div>
    );
  }

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
    setStep(newStep);
    requestAnimationFrame(scrollToTop);
  };

  const quoteProps = {
    state,
    sessionType: sessionTypeObj,
    breakdown,
    selectedCrewItems,
    selectedPropItems,
    selectedAddonItems,
    onRemoveCrewItem: removeCrewItem,
    onRemovePropItem: removePropItem,
    onRemoveAddonItem: removeAddonItem,
  };

  return (
    <div id="studio-booking-wizard" className="w-full max-w-6xl mx-auto scroll-mt-28">
      <div className="mb-6 sm:mb-8">
        <BookingStepper
          steps={STEPPER_STEPS}
          current={step}
          onStepClick={handleStepClick}
          canJumpTo={(id) => id < step}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        {/* Main stage */}
        <div className="min-w-0">
          <div className="rounded-3xl border border-white/[0.08] bg-[#0b0b0f] p-4 sm:p-7 lg:p-8 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]">
            {errorMessage && (
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
                {step === 1 && <StepDatetime state={state} update={update} />}
                {step === 2 && <StepSessionType state={state} update={update} />}
                {step === 3 && <StepStudio state={state} update={update} studios={wizardStudios} />}
                {step === 4 && <StepCrewEquipment state={state} update={update} />}
                {step === 5 && <StepProps state={state} update={update} />}
                {step === 6 && <StepPostProduction state={state} update={update} />}
                {step === 7 && (
                  <StepContact
                    state={state}
                    update={update}
                    studio={studio}
                    breakdown={breakdown}
                    selectedCrewItems={selectedCrewItems}
                    selectedPropItems={selectedPropItems}
                    selectedAddonItems={selectedAddonItems}
                    onRemoveCrewItem={removeCrewItem}
                    onRemovePropItem={removePropItem}
                    onRemoveAddonItem={removeAddonItem}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action bar — sticky on mobile, inline on desktop */}
          <div
            dir="ltr"
            className="sticky bottom-3 z-30 mt-4 lg:static lg:mt-5 rounded-2xl border border-white/[0.1] lg:border-transparent bg-[#0b0b0f]/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:pb-0 lg:p-0 shadow-2xl lg:shadow-none flex items-center gap-3"
          >
            {step > 1 && (
              <motion.button
                type="button"
                onClick={handlePrevStep}
                whileTap={{ scale: 0.96 }}
                transition={studioSprings.snappy}
                aria-label="Back"
                className="h-11 sm:h-12 px-3.5 sm:px-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 text-zinc-200 text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-colors shrink-0"
              >
                <ArrowLeft size={15} />
                <span className="hidden sm:inline">Back</span>
              </motion.button>
            )}

            {/* Mobile running total — hidden on last step since StepContact has its own submit button with total */}
            {!isLastStep && (
              <div className="lg:hidden min-w-0 flex-1">
                <span className="block font-mono text-[10px] tracking-[0.16em] uppercase text-zinc-500">Total</span>
                <span className="block text-sm sm:text-base font-bold text-brand-mauve tabular-nums truncate">{formatAED(breakdown.total, 2)}</span>
              </div>
            )}

            {!isLastStep && (
              <motion.button
                type="button"
                onClick={handleNextStep}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={studioSprings.snappy}
                className="lg:ms-auto h-11 sm:h-12 px-4 sm:px-6 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-colors shadow-[0_12px_30px_-12px_rgba(255,255,255,0.35)] shrink-0"
              >
                <span>
                  <span className="sm:hidden">Continue</span>
                  <span className="hidden sm:inline">Continue{nextLabel ? ` · ${nextLabel}` : ""}</span>
                </span>
                <ArrowRight size={15} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Live quote rail */}
        <div className="hidden lg:block sticky top-28">
          <StudioQuoteRail studio={studio} {...quoteProps} />
        </div>
      </div>
    </div>
  );
}
