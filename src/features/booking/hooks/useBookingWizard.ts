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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const update = (values: Partial<BookingState>) => {
    setErrorMessage(null);
    setState((prev) => ({ ...prev, ...values }));
  };

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

  const nextStep = () => {
    setErrorMessage(null);
    if (step === 1 && !state.date) {
      setErrorMessage("Please select a session reservation date before continuing.");
      return;
    }
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setErrorMessage(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    // Validate required contact credentials
    if (!state.firstName.trim()) {
      setErrorMessage("Please enter your first name.");
      return;
    }
    if (!state.lastName.trim()) {
      setErrorMessage("Please enter your last name.");
      return;
    }
    if (!state.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
      setErrorMessage("Please enter a valid contact email address.");
      return;
    }
    if (!state.phone.trim()) {
      setErrorMessage("Please provide a contact phone or WhatsApp number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createBooking({
        firstName: state.firstName.trim(),
        lastName: state.lastName.trim(),
        email: state.email.trim(),
        phone: state.phone.trim(),
        company: state.company?.trim(),
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

      if (res && "success" in res && res.success === false) {
        throw new Error((res as { message?: string }).message || "Booking reservation failed.");
      }

      setReferenceCode(res.referenceCode || generateBookingReference());
      setConfirmed(true);
    } catch (e) {
      console.error(e);
      setErrorMessage(
        e instanceof Error
          ? e.message
          : "Unable to process booking at this time. Please retry or contact our Dubai Concierge on WhatsApp."
      );
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
    errorMessage,
    handleSubmit,
  };
}
