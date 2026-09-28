"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquare, AlertCircle, ShoppingBag, X } from "lucide-react";
import { submitInquiry } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { ContactSuccess } from "./ContactSuccess";
import { ContactInquirySelector } from "./ContactInquirySelector";
import { GEAR_DATA } from "@/features/gear/data";
import { formatCurrency } from "@/lib/utils";

export function ContactForm() {
  const searchParams = useSearchParams();
  const service = searchParams.get("service");
  const itemsRaw = searchParams.get("items") || "";
  const daysRaw = searchParams.get("days") || "1";
  const delivery = searchParams.get("delivery") || "studio_delivery";
  const isGearRental = service === "gear-rental" && itemsRaw.length > 0;

  const initialGearData = useMemo(() => {
    if (!isGearRental) return null;
    const itemIds = itemsRaw.split(",").filter(Boolean);
    const days = parseInt(daysRaw, 10) || 1;
    const resolvedItems = GEAR_DATA.filter((g) => itemIds.includes(g.id));
    const itemNames = resolvedItems.map((g) => g.name);
    const dayRateSum = resolvedItems.reduce((acc, curr) => acc + curr.dailyRate, 0);
    const deliveryCost = delivery === "courier_dubai" ? 250 : 0;
    const totalEst = dayRateSum * days + deliveryCost;

    const autoMessage = [
      `[Equipment Rental Reservation Request]`,
      `• Equipment: ${itemNames.join(", ")}`,
      `• Rental Duration: ${days} day(s)`,
      `• Delivery Preference: ${delivery.replace("_", " ").toUpperCase()}`,
      `• Estimated Quote: ${formatCurrency(totalEst)}`,
      `\nPlease advise on equipment dispatch availability for our production schedule.`,
    ].join("\n");

    return {
      itemNames,
      days,
      delivery: delivery.replace("_", " ").toUpperCase(),
      totalEst,
      autoMessage,
    };
  }, [isGearRental, itemsRaw, daysRaw, delivery]);

  const [inquiryType, setInquiryType] = useState(() => (isGearRental ? "technical_support" : "general"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(() => initialGearData?.autoMessage || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gearBanner, setGearBanner] = useState<{
    itemNames: string[];
    days: number;
    delivery: string;
    totalEst: number;
  } | null>(() => (initialGearData ? {
    itemNames: initialGearData.itemNames,
    days: initialGearData.days,
    delivery: initialGearData.delivery,
    totalEst: initialGearData.totalEst,
  } : null));

  const resetForm = () => {
    setIsSuccess(false);
    setMessage("");
    setName("");
    setEmail("");
    setPhone("");
    setErrorMessage(null);
    setGearBanner(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await submitInquiry({
        name,
        email,
        phone,
        inquiryType,
        message,
      });
      if (res && !res.success) {
        setErrorMessage(res.message || "Failed to submit inquiry. Please review your input.");
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to send your message. Please try again or email us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return <ContactSuccess onReset={resetForm} />;
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 sm:p-10 shadow-2xl">
      <h2 className="text-white font-bold text-2xl mb-6 font-display">
        Send Us a Message
      </h2>

      {gearBanner && (
        <div className="mb-6 p-4 rounded-2xl bg-brand-purple/10 border border-brand-purple/30 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <ShoppingBag className="text-brand-purple-light shrink-0 mt-0.5" size={17} />
            <div>
              <span className="font-bold text-white block">Equipment Reservation Imported</span>
              <p className="text-slate-300 text-[11px] mt-0.5">
                {gearBanner.itemNames.join(", ")} &bull; {gearBanner.days} Day(s) &bull; {gearBanner.delivery}
              </p>
              <span className="text-brand-purple-light font-mono text-[11px] font-semibold mt-1 inline-block">
                Est: {formatCurrency(gearBanner.totalEst)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setGearBanner(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-400 text-xs">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <ContactInquirySelector
          selected={inquiryType}
          onChange={setInquiryType}
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Full Name" required>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </FormField>

          <FormField label="Email Address" required>
            <Input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </FormField>
        </div>

        <FormField label="Phone / WhatsApp">
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+971 50 000 0000"
          />
        </FormField>

        <FormField label="Project Description" required>
          <Textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us about your production goals, locations, or timeline..."
          />
        </FormField>

        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={isSubmitting}
          className="w-full rounded-2xl gap-2 font-semibold shadow-lg shadow-brand-purple/25"
        >
          {isSubmitting ? (
            <span>Sending Message...</span>
          ) : (
            <>
              <MessageSquare size={17} /> Send Message
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
