"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { WIZARD_STEPS } from "../constants";
import { useBookingWizard } from "../hooks/useBookingWizard";
import { BookingProgress } from "./BookingProgress";
import { BookingSummary } from "./BookingSummary";
import { BookingConfirmation } from "./BookingConfirmation";
import { BookingStepHeader } from "./BookingStepHeader";
import { BookingStepNavigation } from "./BookingStepNavigation";

import { StepDatetime } from "./steps/StepDatetime";
import { StepSessionType } from "./steps/StepSessionType";
import { StepStudio } from "./steps/StepStudio";
import { StepCrewEquipment } from "./steps/StepCrewEquipment";
import { StepProps } from "./steps/StepProps";
import { StepPostProduction } from "./steps/StepPostProduction";
import { StepContact } from "./steps/StepContact";

export function BookingWizard() {
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
    errorMessage,
    handleSubmit,
  } = useBookingWizard();

  if (confirmed) {
    return (
      <BookingConfirmation
        referenceCode={referenceCode}
        email={state.email}
      />
    );
  }

  const currentStepConfig = WIZARD_STEPS[step - 1];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column (8 cols): Step Navigation & Content */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <BookingProgress
            steps={WIZARD_STEPS}
            currentStep={step}
            onStepClick={setStep}
          />

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-10 shadow-xl shadow-black/20">
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

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
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
              onPrev={prevStep}
              onNext={nextStep}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>

        {/* Right Column (4 cols, sticky): Live Session Summary Card */}
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

export default BookingWizard;
