"use client";

import { useSearchParams } from "next/navigation";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { OFFERS_AND_BUNDLES } from "../data";
import { AppliedOffersPromo, OffersBookingContact, OffersPricingBreakdown } from "../types";
import { getOffersDiscount } from "../pricing";
import { submitOffersBooking, validateOffersPromoCode, OffersBookingResult } from "../actions";

const INITIAL_CONTACT: OffersBookingContact = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  specialRequests: "",
};

export function useOffersBooking() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<number>(1);
  const [selectedOfferId, updateSelectedOfferId] = useState<string>("5-hour-bundles");
  const [date, setDate] = useState<string>("");
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [contact, setContact] = useState<OffersBookingContact>(INITIAL_CONTACT);

  // Promo code state
  const [promoCodeInput, setPromoCodeInput] = useState<string>("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedOffersPromo | null>(null);
  const promoRequest = useRef(0);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedResult, setConfirmedResult] = useState<OffersBookingResult | null>(null);

  const selectedOffer = useMemo(() => {
    return OFFERS_AND_BUNDLES.find((o) => o.id === selectedOfferId) || OFFERS_AND_BUNDLES[0];
  }, [selectedOfferId]);

  // Pricing calculations
  const breakdown: OffersPricingBreakdown = useMemo(() => {
    const basePrice = selectedOffer ? selectedOffer.price : 0;
    const discount = getOffersDiscount(basePrice, appliedPromo);
    const subtotal = Math.max(0, basePrice - discount);
    const vatRate = 0.05; // 5% UAE VAT
    const vatAmount = Math.round(subtotal * vatRate * 100) / 100;
    const grandTotal = Math.round((subtotal + vatAmount) * 100) / 100;

    return {
      basePrice,
      discount,
      subtotal,
      vatRate,
      vatAmount,
      grandTotal,
    };
  }, [selectedOffer, appliedPromo]);

  const setSelectedOfferId = useCallback((offerId: string) => {
    if (offerId === selectedOfferId) return;
    updateSelectedOfferId(offerId);
    setDate("");
    setTimeSlot("");
    promoRequest.current++;
    setAppliedPromo((promo) => promo?.eligibleOfferIds && !promo.eligibleOfferIds.includes(offerId) ? null : promo);
    setPromoError(null);
  }, [selectedOfferId]);

  const pkg = searchParams?.get("package") || searchParams?.get("offer") || searchParams?.get("id");
  useEffect(() => {
    if (pkg && OFFERS_AND_BUNDLES.some((o) => o.id === pkg)) {
      setSelectedOfferId(pkg);
    }
  }, [pkg, setSelectedOfferId]);

  const applyPromo = useCallback(async (code: string) => {
    const request = ++promoRequest.current;
    setPromoError(null);
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setPromoError("Please enter a coupon code.");
      return;
    }
    try {
      const result = await validateOffersPromoCode(cleanCode, selectedOfferId);
      if (request !== promoRequest.current) return;
      if (!result.success || !result.promo) {
        setPromoError(result.message || "Invalid promotional code.");
        return;
      }
      setAppliedPromo(result.promo);
    } catch {
      if (request === promoRequest.current) setPromoError("Unable to validate promotional code. Please try again.");
    }
  }, [selectedOfferId]);

  const removePromo = useCallback(() => {
    promoRequest.current++;
    setAppliedPromo(null);
    setPromoError(null);
    setPromoCodeInput("");
  }, []);

  const updateContact = useCallback((updates: Partial<OffersBookingContact>) => {
    setContact((prev) => ({ ...prev, ...updates }));
  }, []);

  // Validation checks
  const canProceedToStep2 = Boolean(selectedOfferId);
  const canProceedToStep3 = Boolean(date && timeSlot);

  const nextStep = useCallback(() => {
    setErrorMessage(null);
    if (step === 1) {
      if (!canProceedToStep2) {
        setErrorMessage("Please pick an offer or bundle to proceed.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!date || !timeSlot) {
        setErrorMessage("Please select both a date and time slot.");
        return;
      }
      setStep(3);
    }
  }, [step, canProceedToStep2, date, timeSlot]);

  const prevStep = useCallback(() => {
    setErrorMessage(null);
    if (step > 1) {
      setStep((s) => s - 1);
    }
  }, [step]);

  const goToStep = useCallback(
    (target: number) => {
      setErrorMessage(null);
      if (target === 1) setStep(1);
      else if (target === 2 && canProceedToStep2) setStep(2);
      else if (target === 3 && canProceedToStep2 && canProceedToStep3) setStep(3);
    },
    [canProceedToStep2, canProceedToStep3]
  );

  // Submit action
  const submitBooking = useCallback(
    async (withZiinaPayment: boolean) => {
      setErrorMessage(null);

      // Simple client-side form validation
      if (!contact.firstName.trim() || !contact.lastName.trim()) {
        setErrorMessage("Please enter your full name.");
        return;
      }
      if (!contact.email.trim() || !contact.email.includes("@")) {
        setErrorMessage("Please enter a valid email address.");
        return;
      }
      if (!contact.phone.trim() || contact.phone.trim().length < 6) {
        setErrorMessage("Please enter a valid phone number.");
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await submitOffersBooking({
          offerId: selectedOfferId,
          date,
          timeSlot,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          specialRequests: contact.specialRequests,
          promoCode: appliedPromo?.code,
          initiatePayment: withZiinaPayment,
        });

        if (!result.success) {
          setErrorMessage(result.message || "Failed to submit booking.");
          setIsSubmitting(false);
          return;
        }

        setConfirmedResult(result);

        if (withZiinaPayment && result.paymentUrl) {
          window.location.href = result.paymentUrl;
        }
      } catch (err) {
        console.error("Error submitting offer booking:", err);
        setErrorMessage("A network error occurred. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [contact, selectedOfferId, date, timeSlot, appliedPromo]
  );

  return {
    step,
    setStep: goToStep,
    nextStep,
    prevStep,
    selectedOfferId,
    setSelectedOfferId,
    selectedOffer,
    date,
    setDate,
    timeSlot,
    setTimeSlot,
    contact,
    updateContact,
    promoCodeInput,
    setPromoCodeInput,
    appliedPromo: appliedPromo?.code || null,
    promoError,
    applyPromo,
    removePromo,
    breakdown,
    isSubmitting,
    errorMessage,
    confirmedResult,
    submitBooking,
    canProceedToStep2,
    canProceedToStep3,
  };
}
