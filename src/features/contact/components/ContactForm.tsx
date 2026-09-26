"use client";

import { useState } from "react";
import { MessageSquare, AlertCircle } from "lucide-react";
import { submitInquiry } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { ContactSuccess } from "./ContactSuccess";
import { ContactInquirySelector } from "./ContactInquirySelector";

export function ContactForm() {
  const [inquiryType, setInquiryType] = useState("general");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setIsSuccess(false);
    setMessage("");
    setName("");
    setEmail("");
    setPhone("");
    setErrorMessage(null);
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
