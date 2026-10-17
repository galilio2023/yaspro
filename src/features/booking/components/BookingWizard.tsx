"use client";

import type { StudioItem } from "../types";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { WIZARD_STEPS, type StudioWizardCatalogOverride } from "../constants";
import { useBookingWizard } from "../hooks/useBookingWizard";
import { BookingConfirmation } from "./BookingConfirmation";
import { StudioQuoteRail } from "./StudioQuoteRail";
import { BookingStepper, ErrorBanner, formatAED, studioSprings } from "./ui/BookingKit";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";

import { StepDatetime } from "./steps/StepDatetime";
import { StepSessionType } from "./steps/StepSessionType";
import { StepStudio } from "./steps/StepStudio";
import { StepCrewEquipment } from "./steps/StepCrewEquipment";
import { StepProps } from "./steps/StepProps";
import { StepPostProduction } from "./steps/StepPostProduction";
import { StepContact } from "./steps/StepContact";

const stepVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0, transition: studioSprings.cinematic },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28, transition: { duration: 0.14, ease: "easeIn" } }),
};

export function BookingWizard({
  studios,
  wizardCatalog,
}: {
  studios: StudioItem[];
  wizardCatalog?: StudioWizardCatalogOverride;
}) {
  const { t, isArabic, direction: uiDirection } = useLanguage();
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
  } = useBookingWizard(studios, wizardCatalog);

  const stepperSteps = [
    { id: 1, label: t("studioBooking.steps.step1"), shortLabel: t("studioBooking.steps.step1Short") },
    { id: 2, label: t("studioBooking.steps.step2"), shortLabel: t("studioBooking.steps.step2Short") },
    { id: 3, label: t("studioBooking.steps.step3"), shortLabel: t("studioBooking.steps.step3Short") },
    { id: 4, label: t("studioBooking.steps.step4"), shortLabel: t("studioBooking.steps.step4Short") },
    { id: 5, label: t("studioBooking.steps.step5"), shortLabel: t("studioBooking.steps.step5Short") },
    { id: 6, label: t("studioBooking.steps.step6"), shortLabel: t("studioBooking.steps.step6Short") },
    { id: 7, label: t("studioBooking.steps.step7"), shortLabel: t("studioBooking.steps.step7Short") },
  ];

  const [direction, setDirection] = useState(1);
  const totalSteps = WIZARD_STEPS.length;
  const isLastStep = step === totalSteps;
  const nextLabel = stepperSteps.find((s) => s.id === step + 1)?.label;

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
      <div className="w-full max-w-xl mx-auto py-8" dir={uiDirection}>
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
    <div id="studio-booking-wizard" dir={uiDirection} className="w-full max-w-6xl mx-auto scroll-mt-28">
      <div className="mb-6 sm:mb-8">
        <BookingStepper
          steps={stepperSteps}
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
                {step === 2 && <StepSessionType state={state} update={update} sessionTypes={wizardCatalog?.sessionTypes} />}
                {step === 3 && <StepStudio state={state} update={update} studios={wizardStudios} />}
                {step === 4 && <StepCrewEquipment state={state} update={update} crewEquipment={wizardCatalog?.crewEquipment} />}
                {step === 5 && <StepProps state={state} update={update} propsList={wizardCatalog?.props} />}
                {step === 6 && <StepPostProduction state={state} update={update} addons={wizardCatalog?.addons} />}
                {step === 7 && (
                  <StepContact
                    state={state}
                    update={update}
                    studio={studio}
                    sessionType={sessionTypeObj}
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
            dir={uiDirection}
            className="sticky bottom-2 sm:bottom-3 z-30 mt-3 sm:mt-4 lg:static lg:mt-5 rounded-xl sm:rounded-2xl border border-white/[0.1] lg:border-transparent bg-[#0b0b0f]/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none p-2 sm:p-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:pb-0 lg:p-0 shadow-2xl lg:shadow-none flex items-center gap-2 sm:gap-3"
          >
            {step > 1 && (
              <motion.button
                type="button"
                onClick={handlePrevStep}
                whileTap={{ scale: 0.96 }}
                transition={studioSprings.snappy}
                aria-label={t("studioBooking.actions.back")}
                className="h-9 sm:h-11 px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 text-zinc-200 text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 cursor-pointer transition-colors shrink-0"
              >
                <ArrowLeft size={14} className={cn("sm:size-[15px]", isArabic && "-scale-x-100")} />
                <span className="hidden sm:inline">{t("studioBooking.actions.back")}</span>
              </motion.button>
            )}

            {/* Mobile running total — hidden on last step since StepContact has its own submit button with total */}
            {!isLastStep && (
              <div className="lg:hidden min-w-0 flex-1">
                <span className="block font-mono text-[9px] sm:text-[10px] tracking-[0.16em] uppercase text-zinc-500">
                  {t("studioBooking.actions.total")}
                </span>
                <span className="block text-xs sm:text-base font-bold text-brand-mauve tabular-nums truncate">
                  {formatAED(breakdown.total, 2)}
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
                className="lg:ms-auto h-9 sm:h-11 px-3 sm:px-5 rounded-lg sm:rounded-xl btn-brand text-xs sm:text-sm flex items-center gap-1 sm:gap-2 cursor-pointer transition-colors shrink-0"
              >
                <span>
                  <span className="sm:hidden">{t("studioBooking.actions.continue")}</span>
                  <span className="hidden sm:inline">
                    {t("studioBooking.actions.continue")}
                    {nextLabel ? ` · ${nextLabel}` : ""}
                  </span>
                </span>
                <ArrowRight size={14} className={cn("sm:size-[15px]", isArabic && "-scale-x-100")} />
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
