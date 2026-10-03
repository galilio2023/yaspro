import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { generateBookingReference } from "@/lib/utils";
import { createBooking } from "@/lib/actions";
import { BookingState, StudioItem } from "../types";
import { INITIAL_BOOKING_STATE, SESSION_TYPES, STUDIO_GEAR_PACKAGES } from "../constants";
import { calculateBookingPrice } from "../lib/pricing";

function getInitialBookingState(searchParams: ReturnType<typeof useSearchParams>, studios: StudioItem[]) {
  const initialState = { ...INITIAL_BOOKING_STATE, studioId: studios[0]?.id || "" };
  if (!searchParams) {
    return { state: initialState, isAiConfigured: false };
  }

  const studioParam = searchParams.get("studio");
  const gearParam = searchParams.get("gear");
  const sessionTypeParam = searchParams.get("sessionType");
  const shootDaysParam = searchParams.get("shootDays");
  const hoursParam = searchParams.get("hours");
  const aiFlag = searchParams.get("aiConfigured");

  const updates: Partial<BookingState> = {};

  const selectedStudio = studios.find((s) => s.id === studioParam || s.slug === studioParam);
  if (selectedStudio) {
    updates.studioId = selectedStudio.id;
  }
  if (gearParam && STUDIO_GEAR_PACKAGES.some((g) => g.id === gearParam)) {
    updates.selectedGearPackage = gearParam;
  }
  if (sessionTypeParam && SESSION_TYPES.some((s) => s.id === sessionTypeParam)) {
    updates.sessionType = sessionTypeParam;
  }
  if (shootDaysParam) {
    const days = parseInt(shootDaysParam, 10);
    if (!isNaN(days) && days > 0) {
      updates.durationHours = Math.min(days * 8, 24);
    }
  } else if (hoursParam) {
    const h = parseInt(hoursParam, 10);
    if (!isNaN(h) && h > 0) {
      updates.durationHours = Math.min(Math.max(1, h), 24);
    }
  }

  return {
    state: { ...initialState, ...updates },
    isAiConfigured: aiFlag === "true" || aiFlag === "1",
  };
}

export function useBookingWizard(cmsStudios: StudioItem[]) {
  const studios = cmsStudios.filter((studio) => studio.isActive !== false);
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<BookingState>(() => getInitialBookingState(searchParams, studios).state);
  const [isAiConfigured, setIsAiConfigured] = useState(() => getInitialBookingState(searchParams, studios).isAiConfigured);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");
  const [bookingId, setBookingId] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state with URL search parameters if query params change after mount
  const [prevSearch, setPrevSearch] = useState(() => searchParams?.toString() ?? "");
  const currentSearch = searchParams?.toString() ?? "";
  if (currentSearch !== prevSearch) {
    setPrevSearch(currentSearch);
    const parsed = getInitialBookingState(searchParams, studios);
    setState((prev) => ({ ...prev, ...parsed.state }));
    if (parsed.isAiConfigured) {
      setIsAiConfigured(true);
    }
  }
  const update = (values: Partial<BookingState>) => {
    setErrorMessage(null);
    setState((prev) => ({ ...prev, ...values }));
  };

  const studio = studios.find((s) => s.id === state.studioId);
  const sessionTypeObj = SESSION_TYPES.find((s) => s.id === state.sessionType);
  const gearPkg = STUDIO_GEAR_PACKAGES.find((g) => g.id === state.selectedGearPackage);

  const breakdown = calculateBookingPrice({
    studioId: state.studioId,
    turnkeyPackageId: state.turnkeyPackageId,
    durationHours: state.durationHours,
    needsCrew: state.needsCrew,
    selectedGearPackage: state.selectedGearPackage,
    hasTeleprompter: state.hasTeleprompter,
    extraMicsCount: state.extraMicsCount,
    hasRushDelivery: state.hasRushDelivery,
    promoCode: state.promoCode,
    needsEditing: state.needsEditing,
    needsColorGrading: state.needsColorGrading,
    needsSoundMastering: state.needsSoundMastering,
    needsAiAutoCut: state.needsAiAutoCut,
  }, studio || { id: "", name: "", desc: "", rate: 0 });

  const { studioCost, crewCost, gearCost, postCost, total } = breakdown;

  const nextStep = () => {
    setErrorMessage(null);
    if (step === 1 && !state.date) {
      setErrorMessage("Please select a session reservation date before continuing.");
      return;
    }
    if (step === 3 && !studio) {
      setErrorMessage("Please select an available studio before continuing.");
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

    if (!studio) {
      setErrorMessage("Please select an available studio before submitting.");
      return;
    }

    // Validate required contact credentials
    if (!state.firstName.trim()) {
      setErrorMessage("Please enter your first name.");
      return;
    }
    if (!state.lastName.trim()) {
      setErrorMessage("Please enter your last name.");
      return;
    }
    const trimmedEmail = state.email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
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
        studioId: studio.id,
        sessionType: state.sessionType || "video_production",
        scheduledAt: `${state.date}T${state.time || "10:00"}`,
        durationHours: state.durationHours,
        headcount: state.headcount,
        turnkeyPackageId: state.turnkeyPackageId || "none",
        selectedGearPackage: state.selectedGearPackage,
        hasTeleprompter: state.hasTeleprompter,
        extraMicsCount: state.extraMicsCount,
        hasRushDelivery: state.hasRushDelivery,
        promoCode: state.promoCode?.trim(),
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
      if (res.data?.bookingId) {
        setBookingId(res.data.bookingId);
      }
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
    breakdown,
    isSubmitting,
    confirmed,
    referenceCode,
    bookingId,
    errorMessage,
    isAiConfigured,
    setIsAiConfigured,
    handleSubmit,
  };
}
