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
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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
]);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  company: text("company"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Studios ─────────────────────────────────────────────────────────────────

export const studios = pgTable("studios", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
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
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  referenceCode: text("reference_code").notNull().unique(),
  userId: uuid("user_id").references(() => users.id),
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
});

// ─── Inquiries ────────────────────────────────────────────────────────────────

export const inquiries = pgTable("inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  inquiryType: inquiryTypeEnum("inquiry_type").notNull().default("general"),
  message: text("message").notNull(),
  isResolved: boolean("is_resolved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  category: projectCategoryEnum("category").notNull(),
  client: text("client"),
  coverImageUrl: text("cover_image_url"),
  videoUrl: text("video_url"),
  tags: jsonb("tags").$type<string[]>().default([]),
  isFeatured: boolean("is_featured").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Influencers ──────────────────────────────────────────────────────────────

export const influencers = pgTable("influencers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  nationality: text("nationality"),
  bio: text("bio"),
  imageUrl: text("image_url"),
  totalFollowers: integer("total_followers"),
  instagramHandle: text("instagram_handle"),
  youtubeHandle: text("youtube_handle"),
  tiktokHandle: text("tiktok_handle"),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Enterprise RFPs & Sovereign Operations ──────────────────────────────────

export const enterpriseRfps = pgTable("enterprise_rfps", {
  id: uuid("id").primaryKey().defaultRandom(),
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
export type Equipment = typeof equipment.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type NewInquiry = typeof inquiries.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type Influencer = typeof influencers.$inferSelect;
export type EnterpriseRfp = typeof enterpriseRfps.$inferSelect;
export type NewEnterpriseRfp = typeof enterpriseRfps.$inferInsert;
export type SessionType = (typeof sessionTypeEnum.enumValues)[number];
export type InquiryType = (typeof inquiryTypeEnum.enumValues)[number];

