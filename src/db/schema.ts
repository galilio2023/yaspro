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
  halfDayRate: decimal("half_day_rate", { precision: 10, scale: 2 }),
  fullDayRate: decimal("full_day_rate", { precision: 10, scale: 2 }),
  areaSqm: integer("area_sqm"),
  dimensions: text("dimensions"),
  ceilingHeight: text("ceiling_height"),
  power: text("power"),
  soundIsolation: text("sound_isolation"),
  category: text("category"),
  badge: text("badge"),
  imageUrl: text("image_url"),
  gallery: jsonb("gallery").$type<string[]>().default([]),
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

// ─── Promo Codes ──────────────────────────────────────────────────────────────

export const promoCodes = pgTable("promo_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  label: text("label"),
  discountPercent: integer("discount_percent"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }),
  eligibleOfferIds: jsonb("eligible_offer_ids").$type<string[]>(),
  expiresAt: timestamp("expires_at"),
  maxUses: integer("max_uses"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Turnkey Offers & Bundles ─────────────────────────────────────────────────

export const offers = pgTable("offers", {
  id: text("id").primaryKey(), // slug like "5-hour-bundles", "full-day-lockout"
  category: text("category").notNull().default("bundle"), // "bundle" | "offer"
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  tagline: text("tagline"),
  taglineAr: text("tagline_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  savings: text("savings"),
  savingsAr: text("savings_ar"),
  hours: integer("hours").notNull().default(1),
  badge: text("badge"),
  badgeAr: text("badge_ar"),
  image: text("image"),
  features: jsonb("features").$type<string[]>().default([]),
  featuresAr: jsonb("features_ar").$type<string[]>().default([]),
  restrictedDays: jsonb("restricted_days").$type<number[]>(),
  restrictionNoteEn: text("restriction_note_en"),
  restrictionNoteAr: text("restriction_note_ar"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Platform & Payment Settings ──────────────────────────────────────────────

export const platformSettings = pgTable("platform_settings", {
  key: text("key").primaryKey(), // e.g. "payment_config", "concierge_contact"
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Podcast Studios Catalog ──────────────────────────────────────────────────

export const podcastSets = pgTable("podcast_sets", {
  id: text("id").primaryKey(), // slug like "nature-grid", "dark-walnut"
  name: text("name").notNull(),
  seats: integer("seats").notNull().default(2),
  location: text("location").notNull().default("Iris Bay - Business Bay, Dubai"),
  image: text("image"),
  gradient: text("gradient"),
  description: text("description"),
  isAvailable: boolean("is_available").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Podcast Addons Catalog ───────────────────────────────────────────────────

export const podcastAddons = pgTable("podcast_addons", {
  id: text("id").primaryKey(), // slug like "standard-reel", "youtube-thumbnail"
  title: text("title").notNull(),
  desc: text("desc"),
  priceNum: integer("price_num").notNull(),
  priceDisplay: text("price_display").notNull(),
  unit: text("unit").notNull().default("per asset"),
  gradient: text("gradient"),
  vimeoEmbed: text("vimeo_embed"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Studio Blackouts & Maintenance Lockouts ──────────────────────────────────

export const studioBlackouts = pgTable(
  "studio_blackouts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studioId: uuid("studio_id").references(() => studios.id, { onDelete: "cascade" }), // null means all studios / studio-wide lockout
    podcastSetId: text("podcast_set_id"), // optional link to podcast set id
    title: text("title").notNull(),
    reason: text("reason"),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    allDay: boolean("all_day").notNull().default(false),
    createdById: text("created_by_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("studio_blackouts_time_idx").on(table.startTime, table.endTime),
    index("studio_blackouts_studio_idx").on(table.studioId),
  ]
);

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
    internalNotes: text("internal_notes"),
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

// ─── Relations ────────────────────────────────────────────────────────────────

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  studio: one(studios, { fields: [bookings.studioId], references: [studios.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

export const studiosRelations = relations(studios, ({ many }) => ({
  bookings: many(bookings),
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
export type SessionType = (typeof sessionTypeEnum.enumValues)[number];
export type InquiryType = (typeof inquiryTypeEnum.enumValues)[number];
export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;
export type PromoCode = typeof promoCodes.$inferSelect;
export type NewPromoCode = typeof promoCodes.$inferInsert;
export type PlatformSetting = typeof platformSettings.$inferSelect;
export type NewPlatformSetting = typeof platformSettings.$inferInsert;
export type PodcastSet = typeof podcastSets.$inferSelect;
export type NewPodcastSet = typeof podcastSets.$inferInsert;
export type PodcastAddonEntity = typeof podcastAddons.$inferSelect;
export type NewPodcastAddonEntity = typeof podcastAddons.$inferInsert;
export type StudioBlackout = typeof studioBlackouts.$inferSelect;
export type NewStudioBlackout = typeof studioBlackouts.$inferInsert;

