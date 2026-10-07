"use client";

import type { StudioItem } from "../types";
import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { WIZARD_STEPS } from "../constants";
import { useBookingWizard } from "../hooks/useBookingWizard";
import { BookingProgress } from "./BookingProgress";
import { BookingConfirmation } from "./BookingConfirmation";

import { StepDatetime } from "./steps/StepDatetime";
import { StepSessionType } from "./steps/StepSessionType";
import { StepStudio } from "./steps/StepStudio";
import { StepCrewEquipment } from "./steps/StepCrewEquipment";
import { StepProps } from "./steps/StepProps";
import { StepPostProduction } from "./steps/StepPostProduction";
import { StepContact } from "./steps/StepContact";

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

  if (confirmed) {
    return (
      <div className="w-full max-w-xl mx-auto py-8">
        <BookingConfirmation
          referenceCode={referenceCode}
          email={state.email}
          bookingId={bookingId}
          totalAmount={total}
        />
      </div>
    );
  }

  const handleNextStep = () => {
    setDirection(1);
    nextStep();
  };

  const handlePrevStep = () => {
    setDirection(-1);
    prevStep();
  };

  const handleStepClick = (newStep: number) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  };

  const stepVariants: Variants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 24 : -24,
    }),
    center: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.22,
        ease: "easeOut",
      },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -24 : 24,
      transition: {
        duration: 0.16,
        ease: "easeIn",
      },
    }),
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-4 sm:py-8">
      {/* 7 Circular Steps Navigation */}
      <BookingProgress
        steps={WIZARD_STEPS}
        currentStep={step}
        onStepClick={handleStepClick}
      />

      {/* Main Centered Booking Card */}
      <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0e121d] p-4 sm:p-6 lg:p-8 shadow-2xl shadow-black/80">
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-300 text-xs sm:text-sm"
          >
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
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
            {step === 3 && (
              <StepStudio
                state={state}
                update={update}
                studios={wizardStudios}
              />
            )}
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

        {/* Step Navigation Buttons (Back & Continue) for Steps 1 through 6 */}
        {step < 7 && (
          <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#181d29] hover:bg-[#202738] text-zinc-300 border border-white/10 transition-colors cursor-pointer"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNextStep}
              className="px-8 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#8b5cf6] hover:to-[#7c3aed] shadow-md shadow-purple-900/30 transition-all cursor-pointer active:scale-[0.98]"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
