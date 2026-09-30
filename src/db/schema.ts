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
    userId: text("user_id").references(() => users.id),
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

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("bookings_studio_schedule_idx").on(table.studioId, table.status, table.scheduledAt),
    index("bookings_user_id_idx").on(table.userId),
    index("bookings_created_at_idx").on(table.createdAt),
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

// ─── Enterprise RFPs & Sovereign Operations ──────────────────────────────────

export const enterpriseRfps = pgTable(
  "enterprise_rfps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => users.id),
    referenceCode: text("reference_code").notNull().unique(),
    organizationName: text("organization_name").notNull(),
    organizationType: text("organization_type").notNull().default("enterprise"),
    contactName: text("contact_name").notNull(),
    contactTitle: text("contact_title"),
    workEmail: text("work_email").notNull(),
    phone: text("phone").notNull(),
    country: text("country").notNull().default("UAE"),
    projectScope: text("project_scope").notNull(),
    targetLocations: jsonb("target_locations").$type<string[]>().default([]),
    estimatedBudget: text("estimated_budget").notNull(),
    requiresMawthooqCompliance: boolean("requires_mawthooq_compliance").notNull().default(false),
    requiresObVan: boolean("requires_ob_van").notNull().default(false),
    projectTimeline: text("project_timeline"),
    selectedCreators: jsonb("selected_creators").$type<string[]>().default([]),
    digitalTwinEnvironment: text("digital_twin_environment"),
    notes: text("notes"),
    status: text("status").notNull().default("pending_review"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("rfps_created_at_idx").on(table.createdAt),
    index("rfps_status_idx").on(table.status, table.createdAt.desc()),
  ]
);

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
export type EnterpriseRfp = typeof enterpriseRfps.$inferSelect;
export type NewEnterpriseRfp = typeof enterpriseRfps.$inferInsert;
export type SessionType = (typeof sessionTypeEnum.enumValues)[number];
export type InquiryType = (typeof inquiryTypeEnum.enumValues)[number];

