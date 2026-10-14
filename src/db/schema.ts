import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  decimal,
  pgEnum,
  uuid,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const inquiryTypeEnum = pgEnum("inquiry_type", [
  "ob_van",
  "live_broadcast",
  "outdoor_filming",
  "studio_booking",
  "technical_support",
  "general",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

export const sessionTypeEnum = pgEnum("session_type", [
  "podcast",
  "video_production",
  "photography",
  "interview",
  "commercial",
  "music_video",
]);

export const projectCategoryEnum = pgEnum("project_category", [
  "government",
  "commercial",
  "influencer",
  "event",
  "documentary",
  "shows",
]);

export const orderTypeEnum = pgEnum("order_type", [
  "studio_booking",
  "podcast_booking",
  "offer_claim",
  "gear_rental",
]);

export const inquiryPillarEnum = pgEnum("inquiry_pillar", [
  "general",
  "studios",
  "podcast",
  "production",
  "influencers",
  "social_media",
  "equipment_rental",
  "outdoor_broadcast",
]);

// ─── Better Auth & Users ──────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("client"), // "admin" | "client"
  phone: text("phone"),
  company: text("company"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
  ]
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("accounts_user_id_idx").on(table.userId),
  ]
);

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Studios ─────────────────────────────────────────────────────────────────

export const studios = pgTable("studios", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  arabicName: text("arabic_name"),
  description: text("description"),
  arabicDescription: text("arabic_description"),
  capacity: integer("capacity").notNull().default(10),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  amenities: jsonb("amenities").$type<string[]>().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Equipment ────────────────────────────────────────────────────────────────

export const equipment = pgTable("equipment", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  arabicName: text("arabic_name"),
  description: text("description"),
  arabicDescription: text("arabic_description"),
  category: text("category").notNull(),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }).notNull(),
  securityDeposit: decimal("security_deposit", { precision: 10, scale: 2 }).default("0"),
  imageUrl: text("image_url"),
  specs: jsonb("specs").$type<string[]>().default([]),
  isPopular: boolean("is_popular").notNull().default(false),
  isKit: boolean("is_kit").notNull().default(false),
  includedInKit: jsonb("included_in_kit").$type<string[]>().default([]),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
},
(table) => [
  index("equipment_category_avail_idx").on(table.category, table.isAvailable),
]);

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    referenceCode: text("reference_code").notNull().unique(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    studioId: uuid("studio_id").references(() => studios.id),
    sessionType: sessionTypeEnum("session_type").notNull(),
    status: bookingStatusEnum("status").notNull().default("pending"),

    // Schedule
    scheduledAt: timestamp("scheduled_at").notNull(),
    durationHours: integer("duration_hours").notNull().default(1),
    headcount: integer("headcount").notNull().default(1),

    // Extras
    equipmentIds: jsonb("equipment_ids").$type<string[]>().default([]),
    propsNotes: text("props_notes"),
    crewNotes: text("crew_notes"),
    specialRequests: text("special_requests"),

    // Post-production
    needsEditing: boolean("needs_editing").default(false),
    needsColorGrading: boolean("needs_color_grading").default(false),
    needsSoundMastering: boolean("needs_sound_mastering").default(false),

    // Payment
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("AED"),
    paymentStatus: text("payment_status").notNull().default("unpaid"),
    paymentReference: text("payment_reference"),
    promoCode: text("promo_code"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("bookings_studio_schedule_idx").on(table.studioId, table.status, table.scheduledAt),
    index("bookings_user_id_idx").on(table.userId),
    index("bookings_created_at_idx").on(table.createdAt),
    index("bookings_promo_code_idx").on(table.promoCode),
  ]
);

// One checkout retains its aggregate price/payment; each session reserves a studio.
// The migration's triggers mirror the primary schedule and booking status here.
export const bookingSessions = pgTable("booking_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  studioId: uuid("studio_id").notNull().references(() => studios.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationHours: integer("duration_hours").notNull(),
  headcount: integer("headcount").notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
}, (table) => [
  uniqueIndex("booking_sessions_booking_position_idx").on(table.bookingId, table.position),
  index("booking_sessions_studio_schedule_idx").on(table.studioId, table.status, table.scheduledAt),
]);

// ─── Inquiries ────────────────────────────────────────────────────────────────

export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    company: text("company"),
    inquiryType: inquiryTypeEnum("inquiry_type").notNull().default("general"),
    message: text("message").notNull(),
    isResolved: boolean("is_resolved").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("inquiries_created_at_idx").on(table.createdAt),
    index("inquiries_resolved_idx").on(table.createdAt).where(sql`${table.isResolved} = false`),
  ]
);

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  arabicTitle: text("arabic_title"),
  description: text("description"),
  category: projectCategoryEnum("category").notNull(),
  client: text("client"),
  coverImageUrl: text("cover_image_url"),
  videoUrl: text("video_url"),
  tag: text("tag"),
  views: text("views"),
  year: text("year"),
  deliverables: jsonb("deliverables").$type<string[]>().default([]),
  techStack: jsonb("tech_stack").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  isFeatured: boolean("is_featured").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
},
(table) => [
  index("projects_category_idx").on(table.category, table.isFeatured),
]);

// ─── Influencers ──────────────────────────────────────────────────────────────

export const influencers = pgTable("influencers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  role: text("role"),
  arabicRole: text("arabic_role"),
  nationality: text("nationality"),
  flag: text("flag"),
  bio: text("bio"),
  arabicBio: text("arabic_bio"),
  imageUrl: text("image_url"),
  totalFollowers: text("total_followers"),
  rawFollowers: integer("raw_followers"),
  instagramHandle: text("instagram_handle"),
  youtubeHandle: text("youtube_handle"),
  tiktokHandle: text("tiktok_handle"),
  collaborations: jsonb("collaborations").$type<string[]>().default([]),
  signatureProductions: jsonb("signature_productions").$type<string[]>().default([]),
  demographics: jsonb("demographics").$type<Record<string, unknown>>().default({}),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Promo Codes Engine ───────────────────────────────────────────────────────

export const promoCodes = pgTable(
  "promo_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    discountType: text("discount_type").notNull().default("percentage"), // "percentage" | "fixed"
    discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
    minSpend: decimal("min_spend", { precision: 10, scale: 2 }).default("0"),
    applicableTypes: jsonb("applicable_types").$type<string[]>().default(["all"]), // ["all", "studio_booking", "podcast_booking", "offer_claim", "gear_rental"]
    maxUses: integer("max_uses"),
    usedCount: integer("used_count").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("promo_codes_code_active_idx").on(table.code, table.isActive),
  ]
);

// ─── Promo Code Usages ───────────────────────────────────────────────────────

export const promoUsages = pgTable(
  "promo_usages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    promoCodeId: uuid("promo_code_id").references(() => promoCodes.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    userEmail: text("user_email").notNull(),
    orderReference: text("order_reference").notNull(),
    discountApplied: decimal("discount_applied", { precision: 10, scale: 2 }).notNull(),
    usedAt: timestamp("used_at").defaultNow().notNull(),
  },
  (table) => [
    index("promo_usages_code_email_idx").on(table.code, table.userEmail),
    index("promo_usages_order_ref_idx").on(table.orderReference),
  ]
);

// ─── Podcast Bookings ─────────────────────────────────────────────────────────

export const podcastBookings = pgTable(
  "podcast_bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    referenceCode: text("reference_code").notNull().unique(),
    packageId: text("package_id").notNull(),
    packageName: text("package_name").notNull(),
    sessionsCount: integer("sessions_count").notNull().default(1),
    includeVideo: boolean("include_video").notNull().default(false),
    needsEditing: boolean("needs_editing").notNull().default(false),
    needsSocialClips: boolean("needs_social_clips").notNull().default(false),
    
    // Contact & Session info
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    company: text("company"),
    preferredDate: text("preferred_date").notNull(),
    preferredTime: text("preferred_time").notNull(),
    specialRequests: text("special_requests"),
    
    // Financials
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("AED"),
    discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
    promoCode: text("promo_code"),
    status: bookingStatusEnum("status").notNull().default("pending"),
    paymentStatus: text("payment_status").notNull().default("unpaid"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("podcast_bookings_ref_idx").on(table.referenceCode),
    index("podcast_bookings_email_idx").on(table.email),
    index("podcast_bookings_created_at_idx").on(table.createdAt),
  ]
);

// ─── Offer Claims & Bookings ─────────────────────────────────────────────────

export const offerClaims = pgTable(
  "offer_claims",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    referenceCode: text("reference_code").notNull().unique(),
    offerId: text("offer_id").notNull(),
    offerTitle: text("offer_title").notNull(),
    offerCategory: text("offer_category").notNull(), // "bundle" | "special"
    sessionsCount: integer("sessions_count").notNull().default(1),
    sessionsSchedule: jsonb("sessions_schedule").$type<Array<{ position: number; date: string; timeSlot: string; studioId: string; notes?: string }>>().default([]),
    
    // Contact
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    company: text("company"),
    notes: text("notes"),

    // Financials
    originalPrice: decimal("original_price", { precision: 10, scale: 2 }).notNull(),
    discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("AED"),
    promoCode: text("promo_code"),
    status: bookingStatusEnum("status").notNull().default("pending"),
    paymentStatus: text("payment_status").notNull().default("unpaid"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("offer_claims_ref_idx").on(table.referenceCode),
    index("offer_claims_email_idx").on(table.email),
    index("offer_claims_offer_id_idx").on(table.offerId),
  ]
);

// ─── Gear Rental Orders ───────────────────────────────────────────────────────

export const gearOrders = pgTable(
  "gear_orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    referenceCode: text("reference_code").notNull().unique(),
    items: jsonb("items").$type<Array<{ gearId: string; slug: string; name: string; quantity: number; dailyRate: number; days: number; lineTotal: number }>>().notNull(),
    startDate: text("start_date").notNull(),
    endDate: text("end_date").notNull(),
    rentalDays: integer("rental_days").notNull().default(1),
    
    // Contact
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    company: text("company"),
    deliveryOption: text("delivery_option").notNull().default("pickup"), // "pickup" | "delivery"
    deliveryAddress: text("delivery_address"),
    notes: text("notes"),

    // Financials
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    securityDeposit: decimal("security_deposit", { precision: 10, scale: 2 }).default("0"),
    discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("AED"),
    promoCode: text("promo_code"),
    status: bookingStatusEnum("status").notNull().default("pending"),
    paymentStatus: text("payment_status").notNull().default("unpaid"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("gear_orders_ref_idx").on(table.referenceCode),
    index("gear_orders_email_idx").on(table.email),
    index("gear_orders_created_at_idx").on(table.createdAt),
  ]
);

// ─── Campaign & Service Inquiries ─────────────────────────────────────────────

export const campaignInquiries = pgTable(
  "campaign_inquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pillar: inquiryPillarEnum("pillar").notNull().default("general"),
    targetId: text("target_id"), // e.g. influencer slug / package slug / service slug
    targetName: text("target_name"), // e.g. "Abir Saghir" / "Full Social Engine"
    
    // Contact
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    company: text("company"),
    
    // Campaign details
    budgetRange: text("budget_range"),
    timeline: text("timeline"),
    goals: jsonb("goals").$type<string[]>().default([]),
    message: text("message").notNull(),
    status: text("status").notNull().default("new"), // "new" | "contacted" | "in_progress" | "closed"
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("campaign_inquiries_pillar_idx").on(table.pillar),
    index("campaign_inquiries_email_idx").on(table.email),
    index("campaign_inquiries_created_at_idx").on(table.createdAt),
  ]
);

// ─── Blackout & Blocked Schedules ─────────────────────────────────────────────

export const blockedSchedules = pgTable(
  "blocked_schedules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studioId: text("studio_id"), // null = all soundstages / entire facility
    startDate: text("start_date").notNull(), // YYYY-MM-DD
    endDate: text("end_date").notNull(), // YYYY-MM-DD
    startTime: text("start_time"), // e.g. "09:00", null = all day
    endTime: text("end_time"), // e.g. "18:00", null = all day
    reason: text("reason").notNull(), // e.g. "Maintenance", "Private VIP Shoot", "National Holiday"
    scope: text("scope").notNull().default("all"), // "all" | "studio_booking" | "podcast_booking" | "gear_rental"
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("blocked_schedules_dates_idx").on(table.startDate, table.endDate),
    index("blocked_schedules_studio_idx").on(table.studioId),
  ]
);

// ─── Booking Assets & Add-ons (Crew, Equipment, Props, Post) ───────────────────

export const bookingAddons = pgTable(
  "booking_addons",
  {
    id: text("id").primaryKey(), // slug or unique identifier
    category: text("category").notNull(), // "crew" | "equipment" | "props" | "post_production"
    name: text("name").notNull(),
    arabicName: text("arabic_name"),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0.00"),
    priceUnit: text("price_unit").notNull().default("session"), // "session" | "hour" | "day"
    imageUrl: text("image_url"),
    isActive: boolean("is_active").notNull().default(true),
    isPopular: boolean("is_popular").notNull().default(false),
    propCategory: text("prop_category"), // e.g. "Furniture", "Lighting Props", "Backdrops"
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("booking_addons_category_idx").on(table.category),
    index("booking_addons_active_idx").on(table.isActive),
  ]
);

// ─── Service Packages (Podcast, Offers, Social Media) ─────────────────────────

export const servicePackages = pgTable(
  "service_packages",
  {
    id: text("id").primaryKey(), // e.g. "starter", "video_pro", "half-day-cinema"
    pillar: text("pillar").notNull(), // "podcast" | "offers" | "social_media" | "production"
    title: text("title").notNull(),
    arabicTitle: text("arabic_title"),
    subtitle: text("subtitle"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("AED"),
    badge: text("badge"),
    hours: integer("hours"),
    episodesCount: integer("episodes_count"),
    deliverables: jsonb("deliverables").$type<string[]>().notNull().default([]),
    arabicDeliverables: jsonb("arabic_deliverables").$type<string[]>().default([]),
    imageUrl: text("image_url"),
    isActive: boolean("is_active").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("service_packages_pillar_idx").on(table.pillar),
    index("service_packages_active_idx").on(table.isActive),
  ]
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  studio: one(studios, { fields: [bookings.studioId], references: [studios.id] }),
}));

export const promoUsagesRelations = relations(promoUsages, ({ one }) => ({
  promoCode: one(promoCodes, { fields: [promoUsages.promoCodeId], references: [promoCodes.id] }),
}));

export const promoCodesRelations = relations(promoCodes, ({ many }) => ({
  usages: many(promoUsages),
}));

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

export const studiosRelations = relations(studios, ({ many }) => ({
  bookings: many(bookings),
}));

export const blockedSchedulesRelations = relations(blockedSchedules, ({ one }) => ({
  studio: one(studios, { fields: [blockedSchedules.studioId], references: [studios.id] }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Studio = typeof studios.$inferSelect;
export type NewStudio = typeof studios.$inferInsert;
export type Equipment = typeof equipment.$inferSelect;
export type NewEquipment = typeof equipment.$inferInsert;
export type Inquiry = typeof inquiries.$inferSelect;
export type NewInquiry = typeof inquiries.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Influencer = typeof influencers.$inferSelect;
export type NewInfluencer = typeof influencers.$inferInsert;
export type PromoCode = typeof promoCodes.$inferSelect;
export type NewPromoCode = typeof promoCodes.$inferInsert;
export type PromoUsage = typeof promoUsages.$inferSelect;
export type NewPromoUsage = typeof promoUsages.$inferInsert;
export type PodcastBooking = typeof podcastBookings.$inferSelect;
export type NewPodcastBooking = typeof podcastBookings.$inferInsert;
export type OfferClaim = typeof offerClaims.$inferSelect;
export type NewOfferClaim = typeof offerClaims.$inferInsert;
export type GearOrder = typeof gearOrders.$inferSelect;
export type NewGearOrder = typeof gearOrders.$inferInsert;
export type CampaignInquiry = typeof campaignInquiries.$inferSelect;
export type NewCampaignInquiry = typeof campaignInquiries.$inferInsert;
export type BlockedSchedule = typeof blockedSchedules.$inferSelect;
export type NewBlockedSchedule = typeof blockedSchedules.$inferInsert;
export type BookingAddon = typeof bookingAddons.$inferSelect;
export type NewBookingAddon = typeof bookingAddons.$inferInsert;
export type ServicePackage = typeof servicePackages.$inferSelect;
export type NewServicePackage = typeof servicePackages.$inferInsert;

export type SessionType = (typeof sessionTypeEnum.enumValues)[number];
export type InquiryType = (typeof inquiryTypeEnum.enumValues)[number];
export type OrderType = (typeof orderTypeEnum.enumValues)[number];
export type InquiryPillar = (typeof inquiryPillarEnum.enumValues)[number];


