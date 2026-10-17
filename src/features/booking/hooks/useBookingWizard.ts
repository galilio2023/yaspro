import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { generateBookingReference } from "@/lib/utils";
import { createBooking } from "@/lib/actions";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  BookingState,
  StudioItem,
  CrewEquipmentItem,
  PropItem,
  AddonItem,
} from "../types";
import {
  INITIAL_BOOKING_STATE,
  SESSION_TYPES,
  STUDIOS,
  CREW_EQUIPMENT_ITEMS,
  PROPS_ITEMS,
  ADDONS_ITEMS,
  calculateBookingPrice,
  type StudioWizardCatalogOverride,
} from "../constants";

function getInitialBookingState(
  searchParams: ReturnType<typeof useSearchParams>,
  studios: StudioItem[],
  sessionTypes: readonly { id: string }[] = SESSION_TYPES
) {
  const fallbackStudioId = studios[0]?.id || "100";
  const initialState = {
    ...INITIAL_BOOKING_STATE,
    sessionType: sessionTypes[0]?.id || INITIAL_BOOKING_STATE.sessionType,
    studioId: fallbackStudioId,
  };

  if (!searchParams) {
    return { state: initialState, isAiConfigured: false };
  }

  const studioParam = searchParams.get("studio");
  const sessionTypeParam = searchParams.get("sessionType");
  const hoursParam = searchParams.get("hours");

  const updates: Partial<BookingState> = {};

  const matchedStudio = studios.find((s) => s.id === studioParam || s.slug === studioParam);
  if (matchedStudio) {
    updates.studioId = matchedStudio.id;
  }
  if (sessionTypeParam && sessionTypes.some((s) => s.id === sessionTypeParam)) {
    updates.sessionType = sessionTypeParam;
  }
  if (hoursParam) {
    const h = parseInt(hoursParam, 10);
    if (!isNaN(h) && h > 0) {
      updates.durationHours = Math.min(Math.max(1, h), 24);
    }
  }

  return {
    state: { ...initialState, ...updates },
    isAiConfigured: false,
  };
}

export function useBookingWizard(cmsStudios: StudioItem[], wizardCatalog?: StudioWizardCatalogOverride) {
  const { t } = useLanguage();
  // Merge CMS studios with canonical studios
  const studios = cmsStudios && cmsStudios.length > 0 ? cmsStudios : (STUDIOS as StudioItem[]);
  const sessionTypesList = wizardCatalog?.sessionTypes?.length ? wizardCatalog.sessionTypes : SESSION_TYPES;
  const crewEquipmentList = wizardCatalog?.crewEquipment ?? CREW_EQUIPMENT_ITEMS;
  const propsList = wizardCatalog?.props ?? PROPS_ITEMS;
  const addonsList = wizardCatalog?.addons ?? ADDONS_ITEMS;

  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<BookingState>(() => getInitialBookingState(searchParams, studios, sessionTypesList).state);
  const [isAiConfigured, setIsAiConfigured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");
  const [bookingId, setBookingId] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const update = (values: Partial<BookingState>) => {
    setErrorMessage(null);
    setState((prev) => ({ ...prev, ...values }));
  };

  const studio = studios.find((s) => s.id === state.studioId) || studios[0];
  const sessionTypeObj = sessionTypesList.find((s) => s.id === state.sessionType) || sessionTypesList[0];

  const selectedCrewItems: CrewEquipmentItem[] = (state.selectedCrewEquipmentIds || [])
    .map((id) => crewEquipmentList.find((c) => c.id === id))
    .filter(Boolean) as CrewEquipmentItem[];

  const selectedPropItems: PropItem[] = (state.selectedPropIds || [])
    .map((id) => propsList.find((p) => p.id === id))
    .filter(Boolean) as PropItem[];

  const selectedAddonItems: AddonItem[] = (state.selectedAddonIds || [])
    .map((id) => addonsList.find((a) => a.id === id))
    .filter(Boolean) as AddonItem[];

  const breakdown = calculateBookingPrice({
    sessionTypeId: state.sessionType,
    durationHours: state.durationHours,
    selectedCrewEquipmentIds: state.selectedCrewEquipmentIds,
    selectedPropIds: state.selectedPropIds,
    selectedAddonIds: state.selectedAddonIds,
    promoCode: state.promoCode,
  }, studio, wizardCatalog);

  const { total } = breakdown;

  const validateDate = () => {
    if (!state.date) {
      setErrorMessage(t("studioBooking.validation.selectDate"));
      return false;
    }
    const now = new Date();
    const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (state.date < todayISO) {
      setErrorMessage(t("studioBooking.validation.selectFutureDate"));
      return false;
    }
    if (!state.time) {
      setErrorMessage(t("studioBooking.validation.selectCallTime"));
      return false;
    }
    return true;
  };

  const nextStep = () => {
    setErrorMessage(null);
    if (step === 1 && !validateDate()) return;
    if (step === 2 && !state.sessionType) {
      setErrorMessage(t("studioBooking.validation.selectSessionType"));
      return;
    }
    if (step === 3 && !studio) {
      setErrorMessage(t("studioBooking.validation.selectStudio"));
      return;
    }
    setStep((s) => Math.min(7, s + 1));
  };

  const prevStep = () => {
    setErrorMessage(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const removeCrewItem = (id: string) => {
    update({
      selectedCrewEquipmentIds: (state.selectedCrewEquipmentIds || []).filter((i) => i !== id),
    });
  };

  const removePropItem = (id: string) => {
    update({
      selectedPropIds: (state.selectedPropIds || []).filter((i) => i !== id),
    });
  };

  const removeAddonItem = (id: string) => {
    update({
      selectedAddonIds: (state.selectedAddonIds || []).filter((i) => i !== id),
    });
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!validateDate()) {
      setStep(1);
      return;
    }

    // Validate required contact credentials
    if (!state.firstName.trim()) {
      setErrorMessage(t("studioBooking.validation.enterFirstName"));
      return;
    }
    if (!state.lastName.trim()) {
      setErrorMessage(t("studioBooking.validation.enterLastName"));
      return;
    }
    const trimmedEmail = state.email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage(t("studioBooking.validation.enterValidEmail"));
      return;
    }
    if (!state.phone.trim()) {
      setErrorMessage(t("studioBooking.validation.enterPhone"));
      return;
    }

    // Convert 12-hour time format (e.g., "10:00 AM", "2:00 PM") to 24-hour HH:mm
    let formattedTime = "10:00";
    if (state.time) {
      const match = state.time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const period = match[3]?.toUpperCase();
        if (period === "PM" && hours < 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        formattedTime = `${String(hours).padStart(2, "0")}:${minutes}`;
      } else if (/^\d{2}:\d{2}$/.test(state.time)) {
        formattedTime = state.time;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await createBooking({
        firstName: state.firstName.trim(),
        lastName: state.lastName.trim(),
        email: state.email.trim(),
        phone: state.phone.trim(),
        company: state.company?.trim(),
        studioId: studio?.id || "100",
        sessionType: (sessionTypeObj?.id === "98" || sessionTypeObj?.id === "photography" ? "photography" : sessionTypeObj?.id === "100" || sessionTypeObj?.id === "podcast" ? "podcast" : "video_production"),
        sessionTypeId: state.sessionType || sessionTypeObj?.id,
        scheduledAt: `${state.date}T${formattedTime}`,
        durationHours: state.durationHours,
        headcount: state.headcount,
        turnkeyPackageId: state.turnkeyPackageId || "none",
        selectedGearPackage: state.selectedGearPackage || "none",
        selectedCrewEquipmentIds: state.selectedCrewEquipmentIds || [],
        selectedPropIds: state.selectedPropIds || [],
        selectedAddonIds: state.selectedAddonIds || [],
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
        throw new Error((res as { message?: string }).message || t("studioBooking.validation.bookingFailed"));
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
          : t("studioBooking.validation.unableToProcess")
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
    studios,
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
    isAiConfigured,
    setIsAiConfigured,
    handleSubmit,
  };
}
