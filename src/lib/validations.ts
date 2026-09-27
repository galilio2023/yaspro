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

export const enterpriseRfpSchema = z.object({
  organizationName: z.string().trim().min(2, "Organization name is required").max(120),
  organizationType: z.enum([
    "government_ministry",
    "giga_project",
    "multinational_brand",
    "telecom_operator",
    "advertising_agency",
    "sports_league",
  ]),
  contactName: z.string().trim().min(2, "Primary contact name is required").max(100),
  contactTitle: z.string().trim().max(100).optional().default(""),
  workEmail: z.string().trim().email("Valid corporate/government email required").max(120),
  phone: z.string().trim().min(6, "Valid direct phone number required").max(30),
  country: z.enum(["UAE", "Saudi Arabia", "Egypt", "Jordan", "Qatar", "Kuwait", "International"]),
  projectScope: z.enum([
    "virtual_production_xr",
    "ob_van_live_broadcast",
    "national_campaign_film",
    "mawthooq_creator_syndication",
    "turnkey_enterprise_retainer",
  ]),
  targetLocations: z.array(z.string()).default([]),
  estimatedBudget: z.enum([
    "under_50k",
    "50k_to_150k",
    "150k_to_500k",
    "500k_plus",
    "custom_annual_retainer",
  ]),
  requiresMawthooqCompliance: z.boolean().default(false),
  requiresObVan: z.boolean().default(false),
  projectTimeline: z.string().max(100).optional().default(""),
  selectedCreators: z.array(z.string()).default([]),
  digitalTwinEnvironment: z.string().optional().default(""),
  notes: z.string().max(5000).optional().default(""),
});

export type EnterpriseRfpInput = z.infer<typeof enterpriseRfpSchema>;

