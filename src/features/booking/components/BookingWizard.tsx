"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { AlertCircle, Cpu } from "lucide-react";
import { WIZARD_STEPS } from "../constants";
import { useBookingWizard } from "../hooks/useBookingWizard";
import { BookingProgress } from "./BookingProgress";
import { BookingSummary } from "./BookingSummary";
import { BookingConfirmation } from "./BookingConfirmation";
import { BookingStepHeader } from "./BookingStepHeader";
import { BookingStepNavigation } from "./BookingStepNavigation";
import { AiBriefPitchModal } from "./AiBriefPitchModal";

import { StepDatetime } from "./steps/StepDatetime";
import { StepSessionType } from "./steps/StepSessionType";
import { StepStudio } from "./steps/StepStudio";
import { StepCrewEquipment } from "./steps/StepCrewEquipment";
import { StepProps } from "./steps/StepProps";
import { StepPostProduction } from "./steps/StepPostProduction";
import { StepContact } from "./steps/StepContact";

export function BookingWizard() {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const {
    step,
    setStep,
    nextStep,
    prevStep,
    state,
    update,
    studio,
    sessionTypeObj,
    total,
    isSubmitting,
    confirmed,
    referenceCode,
    bookingId,
    errorMessage,
    isAiConfigured,
    setIsAiConfigured,
    handleSubmit,
  } = useBookingWizard();

  const [direction, setDirection] = useState(1);

  if (confirmed) {
    return (
      <BookingConfirmation
        referenceCode={referenceCode}
        email={state.email}
        bookingId={bookingId}
        totalAmount={total}
      />
    );
  }

  const currentStepConfig = WIZARD_STEPS[step - 1];

  const handleApplyAiPreset = (studioId: string, gearPackageId: string, hours: number) => {
    update({
      studioId,
      selectedGearPackage: gearPackageId,
      durationHours: hours,
    });
    setIsAiConfigured(true);
  };

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
      x: dir > 0 ? 32 : -32,
      scale: 0.99,
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 320, damping: 30, mass: 0.8 },
        opacity: { duration: 0.22, ease: "easeOut" },
        scale: { duration: 0.22 },
      },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -32 : 32,
      scale: 0.99,
      transition: {
        duration: 0.18,
        ease: "easeIn",
      },
    }),
  };

  return (
    <div className="w-full">
      <AiBriefPitchModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyPreset={handleApplyAiPreset}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column (8 cols): Step Navigation & Content */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
            <BookingProgress
              steps={WIZARD_STEPS}
              currentStep={step}
              onStepClick={handleStepClick}
            />

            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 border border-white/15 hover:bg-zinc-800 hover:border-white/30 text-zinc-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0 self-end sm:self-auto active:scale-[0.97]"
            >
              <Cpu size={13} className="text-amber-400" />
              <span>Production Brief Assistant</span>
            </button>
          </div>

          <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl p-4 sm:p-6 lg:p-10 shadow-2xl shadow-black/60 overflow-hidden">
            {isAiConfigured && (
              <div className="mb-6 p-4 rounded-2xl bg-zinc-900 border border-white/12 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
                    <Cpu size={14} />
                  </div>
                  <div>
                    <div className="text-white font-bold">Configured by Production Advisor</div>
                    <div className="text-zinc-400 text-[11px]">
                      Soundstage ({studio?.name}), gear package, and session hours have been automatically synchronized with your blueprint.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiConfigured(false)}
                  className="text-zinc-400 hover:text-white text-[11px] underline shrink-0 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            <BookingStepHeader
              currentStep={step}
              totalSteps={WIZARD_STEPS.length}
              stepLabel={currentStepConfig.label}
              sessionTypeLabel={sessionTypeObj?.label}
            />

            {errorMessage && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-300 text-xs sm:text-sm animate-fade-up"
              >
                <AlertCircle size={18} className="text-red-400 shrink-0" />
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
                {step === 3 && <StepStudio state={state} update={update} />}
                {step === 4 && <StepCrewEquipment state={state} update={update} />}
                {step === 5 && <StepProps state={state} update={update} />}
                {step === 6 && <StepPostProduction state={state} update={update} />}
                {step === 7 && <StepContact state={state} update={update} />}
              </motion.div>
            </AnimatePresence>

            <BookingStepNavigation
              currentStep={step}
              totalSteps={WIZARD_STEPS.length}
              onPrev={handlePrevStep}
              onNext={handleNextStep}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>

        {/* Right Column (4 cols): Sticky Live Summary Quote */}
        <BookingSummary
          state={state}
          studio={studio}
          sessionTypeObj={sessionTypeObj}
          total={total}
        />
      </div>
    </div>
  );
}
