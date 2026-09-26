import { useState } from "react";
import { generateBookingReference } from "@/lib/utils";
import { createBooking } from "@/lib/actions";
import { BookingState } from "../types";
import { INITIAL_BOOKING_STATE, SESSION_TYPES, STUDIOS, STUDIO_GEAR_PACKAGES } from "../constants";

export function useBookingWizard() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<BookingState>(INITIAL_BOOKING_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");

  const update = (values: Partial<BookingState>) =>
    setState((prev) => ({ ...prev, ...values }));

  const studio = STUDIOS.find((s) => s.id === state.studioId) || STUDIOS[0];
  const sessionTypeObj = SESSION_TYPES.find((s) => s.id === state.sessionType);
  const gearPkg = STUDIO_GEAR_PACKAGES.find((g) => g.id === state.selectedGearPackage);

  const studioCost = studio ? studio.rate * state.durationHours : 0;
  const crewCost = state.needsCrew ? 500 : 0;
  const gearCost = gearPkg ? gearPkg.rate : 0;
  const postCost =
    (state.needsEditing ? 400 : 0) +
    (state.needsColorGrading ? 300 : 0) +
    (state.needsSoundMastering ? 250 : 0) +
    (state.needsAiAutoCut ? 450 : 0);

  const total = studioCost + crewCost + gearCost + postCost;

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await createBooking({
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
        phone: state.phone,
        company: state.company,
        studioId: state.studioId || "studio-a",
        sessionType: state.sessionType || "video_production",
        scheduledAt: `${state.date}T${state.time || "10:00"}`,
        durationHours: state.durationHours,
        headcount: state.headcount,
        selectedGearPackage: state.selectedGearPackage,
        needsCrew: state.needsCrew,
        needsEditing: state.needsEditing,
        needsColorGrading: state.needsColorGrading,
        needsSoundMastering: state.needsSoundMastering,
        needsAiAutoCut: state.needsAiAutoCut,
        propsNotes: state.propsNotes,
        specialRequests: state.specialRequests,
        totalAmount: total,
      });

      setReferenceCode(res.referenceCode || generateBookingReference());
      setConfirmed(true);
    } catch (e) {
      console.error(e);
      setReferenceCode(generateBookingReference());
      setConfirmed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    setStep,
    nextStep,
    prevStep,
    state,
    update,
    studio,
    sessionTypeObj,
    gearPkg,
    studioCost,
    crewCost,
    gearCost,
    postCost,
    total,
    isSubmitting,
    confirmed,
    referenceCode,
    handleSubmit,
  };
}
