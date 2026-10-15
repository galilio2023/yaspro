import { z } from "zod";

export const bookingSubmissionSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(60),
    lastName: z.string().trim().min(1, "Last name is required").max(60),
    email: z.string().trim().email("Invalid email address").max(120),
    phone: z.string().trim().min(5, "Valid phone number required").max(30),
    company: z.string().trim().max(100).optional().default(""),
    studioId: z.string().min(1, "Studio selection is required"),
    sessionType: z.enum([
      "podcast",
      "video_production",
      "virtual_production",
      "photography",
      "interview",
      "commercial",
      "music_video",
    ]),
    scheduledAt: z.string().min(1, "Scheduled date and time required"),
    durationHours: z.number().int().min(1).max(24).default(2),
    headcount: z.number().int().min(1).max(100).default(2),
    turnkeyPackageId: z.string().optional().default("none"),
    selectedGearPackage: z.string().optional().default("none"),
    hasTeleprompter: z.boolean().optional().default(false),
    extraMicsCount: z.number().int().min(0).max(10).optional().default(0),
    hasRushDelivery: z.boolean().optional().default(false),
    promoCode: z.string().trim().max(30).optional().default(""),
    selectedCrewEquipmentIds: z.array(z.string()).optional().default([]),
    selectedPropIds: z.array(z.string()).optional().default([]),
    selectedAddonIds: z.array(z.string()).optional().default([]),
    needsCrew: z.boolean().optional().default(false),
    needsEditing: z.boolean().optional().default(false),
    needsColorGrading: z.boolean().optional().default(false),
    needsSoundMastering: z.boolean().optional().default(false),
    needsAiAutoCut: z.boolean().optional().default(false),
    propsNotes: z.string().max(1000).optional().default(""),
    specialRequests: z.string().max(1000).optional().default(""),
    totalAmount: z.number().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    const match = data.scheduledAt?.match(/T(\d{2}):(\d{2})/);
    if (!match) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledAt"],
        message: "Studio bookings require a valid scheduled time",
      });
      return;
    }
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    if (isNaN(hours) || isNaN(minutes) || minutes < 0 || minutes > 59) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledAt"],
        message: "Invalid time specification",
      });
      return;
    }
    const startMinutes = hours * 60 + minutes;
    const duration = data.durationHours ?? 2;
    const endMinutes = startMinutes + duration * 60;

    // Start must be at or after 09:00 (540 min), and end must be at or before 21:00 (1260 min)
    if (startMinutes < 9 * 60 || endMinutes > 21 * 60) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledAt"],
        message: "Studio bookings are restricted to operating window 09:00 - 21:00",
      });
    }
  });

export type BookingSubmissionInput = z.infer<typeof bookingSubmissionSchema>;

export const inquirySubmissionSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Valid email address is required").max(120),
  phone: z.string().trim().max(30).optional().default(""),
  company: z.string().trim().max(100).optional().default(""),
  inquiryType: z.enum([
    "ob_van",
    "live_broadcast",
    "outdoor_filming",
    "studio_booking",
    "technical_support",
    "general",
  ]),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(3000),
});

export type InquirySubmissionInput = z.infer<typeof inquirySubmissionSchema>;


// ─── Real Email & Registration Validation ──────────────────────────────────────

export const DISPOSABLE_OR_FAKE_DOMAINS = new Set([
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "mailinator.com",
  "guerrillamail.com",
  "trashmail.com",
  "yopmail.com",
  "sharklasers.com",
  "getairmail.com",
  "throwawaymail.com",
  "fake.com",
  "fakemail.com",
  "test.com",
  "testing.com",
  "asdf.com",
  "xyz.com",
  "foo.com",
  "bar.com",
  "dummy.com",
  "sample.com",
  "nowhere.com",
  "invalid.com",
  "dispostable.com",
  "maildrop.cc",
  "inboxkitten.com",
  "mytemp.email",
]);

export function validateLegitimateEmail(email: string): { isValid: boolean; error?: string } {
  const trimmed = email.trim().toLowerCase();
  const basicRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!basicRegex.test(trimmed)) {
    return {
      isValid: false,
      error: "Please enter a properly formatted email address (e.g. name@gmail.com, name@outlook.com, or your business domain).",
    };
  }

  const parts = trimmed.split("@");
  if (parts.length !== 2) {
    return { isValid: false, error: "Invalid email format." };
  }

  const [localPart, domainPart] = parts;

  // Block disposable or hallucinated fake domains
  if (DISPOSABLE_OR_FAKE_DOMAINS.has(domainPart)) {
    return {
      isValid: false,
      error: `The email domain "${domainPart}" is not permitted. Please register with an actual personal email (Gmail, Outlook, Yahoo, etc.) or company domain.`,
    };
  }

  // Reject local parts that are obvious hallucinations
  if (["test", "testing", "asdf", "fake", "dummy", "null", "undefined"].includes(localPart)) {
    return {
      isValid: false,
      error: "Please enter an active email account rather than a placeholder address.",
    };
  }

  return { isValid: true };
}

export const legitimateEmailSchema = z
  .string()
  .trim()
  .email("Valid email address is required")
  .max(120)
  .refine((val) => validateLegitimateEmail(val).isValid, {
    message: "Disposable, test, or invalid domain emails are not accepted. Please use a real email address (e.g. Gmail, Outlook, or your company domain).",
  });

export const registerUserSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  email: legitimateEmailSchema,
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  phone: z.string().trim().min(6, "Valid direct phone number is required").max(30),
  company: z.string().trim().max(100).optional().default(""),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

