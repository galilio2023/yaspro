"use client";

import { getLocalCalendarDate } from "@/features/gear/lib/rental-schedule";

import { useState, useMemo } from "react";
import { PodcastSessionItem, PodcastBookingContact, PodcastBookingStep } from "../types";
import { PODCAST_STUDIOS, PODCAST_SERVICES, PODCAST_ADDONS, PODCAST_PROMO_CODES, TIME_SLOTS } from "../data";
import { createPodcastBooking, PodcastBookingResult } from "../actions";

function getTomorrowDateString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getLocalCalendarDate(tomorrow);
}

function createDefaultSession(index = 1): PodcastSessionItem {
  return {
    id: `session-${Date.now()}-${index}`,
    date: getTomorrowDateString(),
    timeSlot: TIME_SLOTS[0] || "5:30 PM",
    durationHours: 1,
    headcount: 2,
    studioKey: "nature-grid",
    serviceKey: "recording-pro-edit",
    addons: {},
    notes: "",
  };
}

export function usePodcastBooking() {
  const [step, setStep] = useState<PodcastBookingStep>(1);
  const [sessions, setSessions] = useState<PodcastSessionItem[]>([createDefaultSession(1)]);
  const [activeSessionIndex, setActiveSessionIndex] = useState(0);

  const [contact, setContact] = useState<PodcastBookingContact>({
    fullName: "",
    email: "",
    phone: "",
    specialRequests: "",
    promoCode: "",
  });

  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedResult, setConfirmedResult] = useState<PodcastBookingResult | null>(null);

  const currentSession = sessions[activeSessionIndex] || sessions[0];

  const currentStudio = useMemo(() => {
    return PODCAST_STUDIOS.find((s) => s.key === currentSession?.studioKey) || PODCAST_STUDIOS[0];
  }, [currentSession?.studioKey]);

  const currentService = useMemo(() => {
    return PODCAST_SERVICES.find((s) => s.key === currentSession?.serviceKey) || PODCAST_SERVICES[0];
  }, [currentSession?.serviceKey]);

  // Price for a single session
  const getSessionPrice = (session: PodcastSessionItem) => {
    const svc = PODCAST_SERVICES.find((s) => s.key === session.serviceKey) || PODCAST_SERVICES[0];
    const duration = Math.max(1, session.durationHours || 1);
    const serviceCost = svc.price * duration;

    let addonsCost = 0;
    if (session.addons) {
      for (const [addonKey, qty] of Object.entries(session.addons)) {
        if (qty > 0) {
          const addon = PODCAST_ADDONS.find((a) => a.key === addonKey);
          if (addon) {
            addonsCost += addon.priceNum * qty;
          }
        }
      }
    }
    return {
      serviceCost,
      addonsCost,
      total: serviceCost + addonsCost,
    };
  };

  const currentSessionBreakdown = useMemo(() => {
    return getSessionPrice(currentSession);
  }, [currentSession]);

  const subtotalAllSessions = useMemo(() => {
    return sessions.reduce((acc, sess) => acc + getSessionPrice(sess).total, 0);
  }, [sessions]);

  const promoDiscount = useMemo(() => {
    if (!appliedPromo) return 0;
    const rule = PODCAST_PROMO_CODES[appliedPromo];
    if (!rule) return 0;
    if (rule.percent) {
      return Math.round((subtotalAllSessions * rule.percent) / 100);
    }
    if (rule.flat) {
      return Math.min(subtotalAllSessions, rule.flat);
    }
    return 0;
  }, [appliedPromo, subtotalAllSessions]);

  const grandTotal = Math.max(0, subtotalAllSessions - promoDiscount);

  // Updates for active session
  const updateCurrentSession = (updates: Partial<PodcastSessionItem>) => {
    setSessions((prev) => {
      const copy = [...prev];
      copy[activeSessionIndex] = { ...copy[activeSessionIndex], ...updates };
      return copy;
    });
  };

  const setAddonQuantity = (addonKey: string, qty: number) => {
    setSessions((prev) => {
      const copy = [...prev];
      const active = { ...copy[activeSessionIndex] };
      const newAddons = { ...active.addons };
      if (qty <= 0) {
        delete newAddons[addonKey];
      } else {
        newAddons[addonKey] = qty;
      }
      active.addons = newAddons;
      copy[activeSessionIndex] = active;
      return copy;
    });
  };

  const toggleAddon = (addonKey: string) => {
    const currentQty = currentSession.addons?.[addonKey] || 0;
    setAddonQuantity(addonKey, currentQty > 0 ? 0 : 1);
  };

  // Multi-session
  const addNewSession = () => {
    const newSess = createDefaultSession(sessions.length + 1);
    setSessions((prev) => [...prev, newSess]);
    setActiveSessionIndex(sessions.length);
    setStep(1);
  };

  const removeSession = (index: number) => {
    if (sessions.length <= 1) return;
    setSessions((prev) => prev.filter((_, idx) => idx !== index));
    if (activeSessionIndex >= index) {
      setActiveSessionIndex(Math.max(0, activeSessionIndex - 1));
    }
  };

  // Step Navigation
  const nextStep = () => {
    setErrorMessage(null);
    if (step === 1) {
      if (!currentSession.date) {
        setErrorMessage("Please select a session date.");
        return;
      }
      if (!currentSession.timeSlot) {
        setErrorMessage("Please select a recording time slot.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const studio = PODCAST_STUDIOS.find((item) => item.key === currentSession.studioKey);
      if (!studio) {
        setErrorMessage("Please select your preferred podcast studio setup.");
        return;
      }
      if (studio.seats < currentSession.headcount) {
        setErrorMessage("Please select a studio with enough seats for your guests.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!currentSession.serviceKey) {
        setErrorMessage("Please select a recording service package.");
        return;
      }
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };

  const prevStep = () => {
    setErrorMessage(null);
    setStep((s) => (s > 1 ? ((s - 1) as PodcastBookingStep) : 1));
  };

  const applyPromo = (code: string) => {
    setPromoError(null);
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setPromoError("Please enter a promo code.");
      return;
    }
    if (PODCAST_PROMO_CODES[trimmed]) {
      setAppliedPromo(trimmed);
      setContact((prev) => ({ ...prev, promoCode: trimmed }));
    } else {
      setPromoError("Invalid or expired promo code.");
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setContact((prev) => ({ ...prev, promoCode: "" }));
  };

  // Submission
  const submitBooking = async (initiatePayment = false) => {
    setErrorMessage(null);

    if (!contact.fullName.trim()) {
      setErrorMessage("Full name is required.");
      return;
    }
    if (!contact.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
      setErrorMessage("A valid email address is required.");
      return;
    }
    if (!contact.phone.trim()) {
      setErrorMessage("A phone or WhatsApp contact number is required.");
      return;
    }
    if (!isAgreedToTerms) {
      setErrorMessage("Please review and agree to the Terms and Conditions.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createPodcastBooking({
        sessions,
        fullName: contact.fullName.trim(),
        email: contact.email.trim(),
        phone: contact.phone.trim(),
        specialRequests: contact.specialRequests?.trim(),
        promoCode: appliedPromo || undefined,
        initiatePayment,
        paymentType: "full",
      });

      if (!res.success && !res.paymentFailed) {
        throw new Error(res.message || "Failed to process booking reservation.");
      }

      setConfirmedResult(res);

      if (res.success && res.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : "Unable to complete booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    setStep,
    nextStep,
    prevStep,
    sessions,
    activeSessionIndex,
    setActiveSessionIndex,
    currentSession,
    currentStudio,
    currentService,
    currentSessionBreakdown,
    subtotalAllSessions,
    promoDiscount,
    grandTotal,
    appliedPromo,
    promoError,
    contact,
    setContact,
    isAgreedToTerms,
    setIsAgreedToTerms,
    isSubmitting,
    errorMessage,
    confirmedResult,
    updateCurrentSession,
    setAddonQuantity,
    toggleAddon,
    addNewSession,
    removeSession,
    applyPromo,
    removePromo,
    submitBooking,
  };
}
