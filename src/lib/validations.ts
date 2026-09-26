import { z } from "zod";

export const bookingSubmissionSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  email: z.string().trim().email("Invalid email address").max(120),
  phone: z.string().trim().min(5, "Valid phone number required").max(30),
  company: z.string().trim().max(100).optional().default(""),
  studioId: z.string().min(1, "Studio selection is required"),
  sessionType: z.enum([
    "podcast",
    "video_production",
    "photography",
    "interview",
    "commercial",
    "music_video",
  ]),
  scheduledAt: z.string().min(1, "Scheduled date and time required"),
  durationHours: z.number().int().min(1).max(24).default(2),
  headcount: z.number().int().min(1).max(100).default(2),
  selectedGearPackage: z.string().optional().default("none"),
  needsCrew: z.boolean().optional().default(false),
  needsEditing: z.boolean().optional().default(false),
  needsColorGrading: z.boolean().optional().default(false),
  needsSoundMastering: z.boolean().optional().default(false),
  needsAiAutoCut: z.boolean().optional().default(false),
  propsNotes: z.string().max(1000).optional().default(""),
  specialRequests: z.string().max(1000).optional().default(""),
  totalAmount: z.number().nonnegative().optional(),
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

export const campaignRequestSchema = z.object({
  creatorId: z.string().min(1, "Creator ID is required"),
  creatorName: z.string().min(1, "Creator name is required"),
  brandName: z.string().trim().min(1, "Brand or company name is required").max(100),
  contactName: z.string().trim().min(1, "Contact name is required").max(100),
  email: z.string().trim().email("Valid corporate email required").max(120),
  phone: z.string().trim().min(5, "Valid phone number required").max(30),
  campaignObjective: z.string().min(1, "Campaign objective is required"),
  budgetTier: z.string().min(1, "Budget tier selection is required"),
  targetStudio: z.string().optional().default(""),
  message: z.string().max(3000).optional().default(""),
});

export type CampaignRequestInput = z.infer<typeof campaignRequestSchema>;
