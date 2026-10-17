# 🎬 YAS PRO — Sovereign AI Media Hub & Production Ecosystem
### Dubai, UAE • Next-Generation Virtual Production, Soundstage Fleet, Podcast Suites & Cinema Gear Engine

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Neon Database](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM_0.45-C5F74F?style=for-the-badge&logo=drizzle)](https://orm.drizzle.team/)
[![Better-Auth](https://img.shields.io/badge/Better--Auth-1.7.6-purple?style=for-the-badge)](https://better-auth.com/)
[![Ziina Payments](https://img.shields.io/badge/Ziina-UAE_Gateway-24C36C?style=for-the-badge)](https://ziina.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-179%20Passed-brightgreen?style=for-the-badge)](https://github.com/galilio2023/yaspro)
[![Live Deployment](https://img.shields.io/badge/Vercel-Live_Staging-000000?style=for-the-badge&logo=vercel)](https://yaspro-tablawy.vercel.app/)

---

## 📌 Executive Overview

**Yas Pro** is an enterprise-grade digital production, soundstage reservation, and sovereign media operations platform engineered for cinematic feature productions, government broadcasts, luxury podcasting, commercial creator campaigns, and cinema gear rentals across Dubai, the UAE, and the greater GCC region.

Built on **Next.js 16 (App Router)** and **React 19**, Yas Pro unifies public discovery, multi-step interactive booking wizards, real-time conflict-free scheduling, **Ziina UAE payment processing** (with server-verified deposit/balance quotes and HMAC-SHA256 webhook reconciliation), a **12-module Admin Command Center**, and a bi-directional **English (`LTR`) & Arabic (`RTL`)** interface.

🌐 **Live Deployed Staging:** [https://yaspro-tablawy.vercel.app](https://yaspro-tablawy.vercel.app)

---

## 🏛️ Multi-Layer System Architecture

Yas Pro is architected across **six distinct, strictly decoupled layers** to guarantee type safety, fail-closed security, and sub-second response times:

```mermaid
flowchart TB
    subgraph L1 ["1. Client & Presentation Layer (React 19 / Tailwind v4 / Framer Motion)"]
        Storefront["Public Storefront & Showcases\n(/, /studios, /projects, /influencers, /services, /about, /contact)"]
        Wizards["Interactive Booking & Checkout Wizards\n(/studio-booking, /podcast-booking, /offers, /social-media-packages, /shop)"]
        ClientPortal["Authenticated Client Portal\n(/account — Bookings, Payments, Profile)"]
        AdminUI["Admin Command Center\n(/admin — 12 Operational CRUD & Telemetry Modules)"]
    end

    subgraph L2 ["2. Edge Routing, i18n & Security Proxy Layer (Next.js 16)"]
        Proxy["Next.js 16 Proxy (src/proxy.ts)\n• /en & /ar Locale Rewrites & NEXT_LOCALE Cookie\n• Legacy /portal ➔ /account Redirects\n• Optimistic Cookie Guard for /admin & /account"]
        I18n["Bi-Directional Localization Engine\n(next-intl + LanguageProvider + RTL/LTR Mirroring)"]
        Metadata["Dynamic SEO & OpenGraph Engine\n(src/lib/metadata.ts, JsonLd, Sitemap, Dynamic OG Cards)"]
    end

    subgraph L3 ["3. Application & Server Actions Layer (src/lib/actions & Feature Actions)"]
        RateLimiter["IP Rate Limiter & Idempotency Guard\n(src/lib/rate-limit.ts)"]
        BookingActions["Booking & Availability Engines\n(Studio Wizard, Podcast Multi-Session, Turnkey Offers)"]
        PaymentActions["Payment Quote & Intent Engine\n(src/lib/ziina.ts & src/lib/payment-actions.ts)"]
        CMSActions["Admin CMS & Telemetry Operations\n(18 Modular Server Action Files in src/lib/actions/*)"]
        Capability["Guest Payment Capability Signer\n(HMAC-SHA256 HttpOnly Cookie — src/lib/booking-payment-capability.ts)"]
    end

    subgraph L4 ["4. Domain Business Logic & Caching Layer"]
        Pricing["Canonical Server-Side Pricing & Promo Engine\n(Tiered Gear Rates, Multi-Session Discounts, DB/Static Promos)"]
        Scheduler["Conflict-Free Scheduler & Turnaround Engine\n(Overlap Detection, 2h Stale Hold Expiry, Blackout Lockouts)"]
        Cache["Next.js Tagged Data Cache\n(src/lib/cached-queries.ts — unstable_cache + updateTag)"]
    end

    subgraph L5 ["5. External Integrations & Infrastructure Services"]
        BetterAuth["Better-Auth v1.7 Engine\n(Session Auth, RBAC, Admin/Client Roles)"]
        ZiinaGW["Ziina UAE Payment Gateway\n(AED Fils Intents + HMAC-SHA256 Webhook Reconciler)"]
        Storage["Multi-Driver Media Storage\n(Cloudinary CDN / AWS S3 / Local Disk)"]
        Notifications["Resend Transactional Email Engine\n(HTML Call Sheets & Lead Alerts with Log Fallback)"]
    end

    subgraph L6 ["6. Persistence & Serverless Data Layer (Neon PostgreSQL + Drizzle ORM)"]
        DrizzleHTTP["Drizzle HTTP Adapter\n(Fast Stateless Queries)"]
        DrizzleTx["Drizzle WebSocket Pool Adapter\n(Atomic Multi-Session Transactions)"]
        NeonDB[("Neon Serverless PostgreSQL\n14 Tables • 4 Enums • 13 Migrations")]
    end

    L1 --> L2
    L2 --> L3
    L3 --> L4
    L3 --> L5
    L4 --> L6
    L5 --> L6
    DrizzleHTTP --> NeonDB
    DrizzleTx --> NeonDB
```

---

## 🔍 Layer-by-Layer Technical Breakdown

### Layer 1: Client & Presentation Layer (`src/app`, `src/components`, `src/features`)
* **App Router Route Groups**: Clean separation between `(public)` client-facing routes and `(admin)` operations routes, each with dedicated layouts, error boundaries (`error.tsx`, `global-error.tsx`), and streaming skeletons (`src/components/ui/skeletons/*`).
* **Interactive State & Providers**:
  * [`LanguageProvider.tsx`](file:///C:/Users/PC/Desktop/yaspro/src/components/providers/LanguageProvider.tsx): Manages live switching between English (`en`, `dir="ltr"`) and Arabic (`ar`, `dir="rtl"`) with persistent cookies and dictionary synchronization.
  * [`CartProvider.tsx`](file:///C:/Users/PC/Desktop/yaspro/src/components/providers/CartProvider.tsx): Manages cinema equipment rental cart state, rental date ranges, and `localStorage` persistence across sessions.
  * [`SmoothScrollProvider.tsx`](file:///C:/Users/PC/Desktop/yaspro/src/components/providers/SmoothScrollProvider.tsx): Coordinates smooth page transitions and scroll restoration.
* **Custom Motion & Brand Geometry**:
  * Pure CSS GPU keyframe entrance loaders ([`GlobalPageLoader.tsx`](file:///C:/Users/PC/Desktop/yaspro/src/components/layout/GlobalPageLoader.tsx), [`YasproAnimatedLoader.tsx`](file:///C:/Users/PC/Desktop/yaspro/src/components/ui/YasproAnimatedLoader.tsx)) that eliminate SSR hydration flashes.
  * Vector path geometry ([`yasprVectorPath.ts`](file:///C:/Users/PC/Desktop/yaspro/src/components/ui/yasprVectorPath.ts), [`YasproEmblem.tsx`](file:///C:/Users/PC/Desktop/yaspro/src/components/ui/YasproEmblem.tsx)) preserving the signature `YASPRO` delta-triangle `A` (`▲`) and circular camera aperture `[O]`.

### Layer 2: Edge Routing, i18n & Security Proxy Layer (`src/proxy.ts`, `src/i18n`)
* **Next.js 16 Proxy ([`src/proxy.ts`](file:///C:/Users/PC/Desktop/yaspro/src/proxy.ts))**:
  * **Locale Prefix Rewriting**: Intercepts `/ar/*` and `/en/*` URLs, rewrites them transparently to canonical App Router paths, injects `x-next-intl-locale` request/response headers, and persists the `NEXT_LOCALE` cookie.
  * **Legacy Route Normalization**: Automatically redirects legacy `/portal/*` URLs to `/account` with corresponding tab query parameters (`?tab=bookings`, `?tab=profile`).
  * **Optimistic Auth Guard**: Checks for `better-auth.session_token` or `__Secure-better-auth.session_token` cookies on `/admin` and `/account` routes (across both `/en` and `/ar` prefixes) and redirects unauthenticated visitors to `/login?callbackUrl=...` before rendering.

### Layer 3: Application, Validation & Server Actions Layer (`src/lib`, `src/features/*/actions.ts`)
* **Strict Schema Validation ([`src/lib/validations.ts`](file:///C:/Users/PC/Desktop/yaspro/src/lib/validations.ts))**: Every server action validates raw untrusted payloads through **Zod v4** schemas (`bookingSubmissionSchema`, `inquirySubmissionSchema`, CMS form schemas) before executing business logic.
* **Rate Limiting & Idempotency ([`src/lib/rate-limit.ts`](file:///C:/Users/PC/Desktop/yaspro/src/lib/rate-limit.ts))**:
  * Sliding-window IP rate limiting (e.g., max 5 bookings or inquiries per 10 minutes per client IP).
  * 60-second idempotency locks keyed by normalized payload hashes (`booking:{email}:{studio}:{scheduledAt}`, `inquiry:{email}:{type}:{messagePrefix}`) to prevent accidental double submissions.
* **Cryptographic Guest Payment Capability ([`src/lib/booking-payment-capability.ts`](file:///C:/Users/PC/Desktop/yaspro/src/lib/booking-payment-capability.ts))**:
  * When a guest (unauthenticated user) creates a studio, podcast, or offer booking, the server issues a booking-bound, 24-hour `HttpOnly`, `SameSite=Strict` cookie signed via `HMAC-SHA256` using `BETTER_AUTH_SECRET` and verified with `crypto.timingSafeEqual`.
  * Allows guests to securely fetch payment quotes and initiate Ziina payments for their own reservation without exposing unauthenticated bookings to enumeration or cross-user tampering.
* **Deployment Environment Guard ([`src/lib/deployment-environment.ts`](file:///C:/Users/PC/Desktop/yaspro/src/lib/deployment-environment.ts))**:
  * Isolates Vercel preview deployments from production credentials (`PREVIEW_DATABASE_URL`, `PREVIEW_BETTER_AUTH_SECRET`) and fails closed if production secrets are missing.

### Layer 4: Domain Business Logic, Scheduling & Caching Layer
* **Conflict-Free Soundstage Scheduler ([`src/lib/actions/availability-operations.ts`](file:///C:/Users/PC/Desktop/yaspro/src/lib/actions/availability-operations.ts), [`src/lib/actions.ts`](file:///C:/Users/PC/Desktop/yaspro/src/lib/actions.ts))**:
  * Evaluates requested time windows against all active `confirmed` and `pending` reservations in `booking_sessions` and `bookings`.
  * Automatically applies configurable **stage reset turnaround buffers** (`turnaroundBufferMinutes`, e.g., 30 mins) between consecutive sessions.
  * Enforces **2-hour TTL expiration on unpaid pending holds** (`HOLD_TTL_MS = 2 hours`) so abandoned checkouts cannot indefinitely lock studio calendars.
  * Cross-checks requested slots against studio-specific and facility-wide maintenance windows in `studio_blackouts`.
  * Converts Dubai local calendar dates and time slots (`UTC+4`) deterministically across server timezones.
* **Server-Authoritative Pricing & Promo Engine**:
  * Client UI quotes are never trusted for charging. The server recalculates all totals from database studio rates, CMS wizard catalog overrides (`studio_wizard_catalog`), podcast set/add-on tables, and validated promo codes (`promo_codes` table + static fallback rules).
  * Enforces promo code active flags, expiration timestamps, `eligibleOfferIds` restrictions, and `maxUses` redemptions.
* **Next.js Tagged Query Cache ([`src/lib/cached-queries.ts`](file:///C:/Users/PC/Desktop/yaspro/src/lib/cached-queries.ts))**:
  * Wraps frequent read queries (`studios`, `equipment`, `projects`, `influencers`, `offers`, `podcast_sets`, `podcast_addons`) in `unstable_cache` with granular cache tags (`studios`, `equipment`, `projects`, `influencers`, `offers`, `podcast`).
  * Admin mutations and webhook reconciliations immediately purge stale cache entries via `updateTag(...)` and `revalidatePath(...)`.

### Layer 5: External Integrations & Infrastructure Services
* **Authentication ([`src/lib/auth.ts`](file:///C:/Users/PC/Desktop/yaspro/src/lib/auth.ts), [`src/lib/auth-client.ts`](file:///C:/Users/PC/Desktop/yaspro/src/lib/auth-client.ts))**:
  * Powered by **Better-Auth** with Drizzle adapter (`pg`), supporting email/password authentication, custom user fields (`role`, `phone`, `company`), 7-day sessions with 5-minute cookie caching, and dynamic trusted origins across Vercel preview/production URLs.
* **Ziina UAE Payment Gateway ([`src/lib/ziina.ts`](file:///C:/Users/PC/Desktop/yaspro/src/lib/ziina.ts)) & Webhook Reconciler ([`src/app/api/webhooks/production/route.ts`](file:///C:/Users/PC/Desktop/yaspro/src/app/api/webhooks/production/route.ts))**:
  * Generates server-verified payment quotes supporting **configurable Deposit %** (e.g., 50% deposit) or **100% Full Payment**, plus **Remaining Balance** settlement for `deposit_paid` bookings (preserving the original deposit percentage stored in `booking.paymentIntent` even if platform settings change later).
  * Dispatches idempotent `POST https://api-v2.ziina.com/api/payment_intent` requests in **AED fils** (`1 AED = 100 fils`).
  * Verifies Ziina webhook callbacks (`payment_intent.status.updated`) using `X-Hmac-Signature` (`HMAC-SHA256` with `crypto.timingSafeEqual`), validates exact paid amounts in fils and currency (`AED`) before transitioning bookings to `confirmed` and `deposit_paid` / `paid`.
  * Includes a non-production sandbox simulation mode (`ZIINA_SIMULATE=true`) that is strictly hard-blocked when `NODE_ENV === "production"`.
* **Multi-Driver Asset Storage ([`src/lib/storage.ts`](file:///C:/Users/PC/Desktop/yaspro/src/lib/storage.ts) & [`src/app/api/upload/route.ts`](file:///C:/Users/PC/Desktop/yaspro/src/app/api/upload/route.ts))**:
  * Admin-authenticated media upload pipeline (`/api/upload`) with strict MIME-type whitelist (`jpeg`, `png`, `webp`, `gif`, `svg`, `mp4`, `webm`), 15 MB size limit, and **magic-byte binary header verification** to prevent spoofed file extensions.
  * Automatically selects between **Cloudinary Global CDN** (`CloudinaryStorageProvider`), **S3-Compatible Object Storage** (`S3CompatibleStorageProvider` for AWS S3 / Cloudflare R2), or **Local Disk** (`LocalDiskStorageProvider`).
* **Transactional Email & Call Sheet Engine ([`src/lib/notifications.ts`](file:///C:/Users/PC/Desktop/yaspro/src/lib/notifications.ts))**:
  * Sends HTML-escaped **Stage Call Sheets** to clients upon booking creation/confirmation and **Inbound Lead Alerts** to studio operations (`INQUIRY_NOTIFICATION_EMAIL`) via the **Resend API** (`RESEND_API_KEY`), with graceful structured log fallback in local/staging environments.

### Layer 6: Persistence & Serverless Data Layer (`src/db/index.ts`, `src/db/schema.ts`)
* **Dual-Mode Neon Serverless Driver ([`src/db/index.ts`](file:///C:/Users/PC/Desktop/yaspro/src/db/index.ts))**:
  * Uses `@neondatabase/serverless` HTTP adapter (`drizzle-orm/neon-http`) for zero-latency single queries.
  * Automatically upgrades to a pooled WebSocket connection (`Pool` + `drizzle-orm/neon-serverless`) whenever `db.transaction(...)` is invoked (such as atomic multi-session podcast or offer bundle reservations), ensuring full ACID rollback on schedule conflicts and cleanly closing the pool afterward.

---

## 🗄️ Database Entity-Relationship Diagram (ERD)

The PostgreSQL schema ([`src/db/schema.ts`](file:///C:/Users/PC/Desktop/yaspro/src/db/schema.ts)) consists of **14 tables** and **4 PostgreSQL enums** managed across **14 Drizzle migrations** (`0000` through `0013`):

```mermaid
erDiagram
    users ||--o{ sessions : "has many"
    users ||--o{ accounts : "has many"
    users ||--o{ bookings : "places"
    studios ||--o{ bookings : "primary stage"
    studios ||--o{ booking_sessions : "reserved in"
    studios ||--o{ offers : "linked stage"
    studios ||--o{ studio_blackouts : "locked by"
    bookings ||--|{ booking_sessions : "contains sessions"

    users {
        text id PK
        text name
        text email UK
        boolean email_verified
        text image
        text role "admin | client"
        text phone
        text company
        timestamp created_at
        timestamp updated_at
    }

    sessions {
        text id PK
        text user_id FK
        text token UK
        text ip_address
        text user_agent
        timestamp expires_at
    }

    accounts {
        text id PK
        text account_id
        text provider_id
        text user_id FK
        text password
    }

    verifications {
        text id PK
        text identifier
        text value
        timestamp expires_at
    }

    studios {
        uuid id PK
        text slug UK
        text name
        text arabic_name
        integer capacity
        decimal hourly_rate
        decimal half_day_rate
        decimal full_day_rate
        integer area_sqm
        text dimensions
        text ceiling_height
        text power
        text sound_isolation
        text category
        text badge
        text image_url
        jsonb gallery
        jsonb amenities
        boolean is_active
    }

    bookings {
        uuid id PK
        text reference_code UK
        text user_id FK
        uuid studio_id FK
        enum session_type "podcast | video_production | virtual_production | photography | interview | commercial | music_video"
        enum status "pending | confirmed | cancelled | completed"
        timestamp scheduled_at
        integer duration_hours
        integer headcount
        jsonb equipment_ids
        text props_notes
        text crew_notes
        text special_requests
        boolean needs_editing
        boolean needs_color_grading
        boolean needs_sound_mastering
        decimal total_amount
        text currency "AED"
        text payment_status "unpaid | deposit_paid | paid | refunded"
        text payment_reference
        jsonb payment_intent "amountFils | depositPercent | targetStatus"
        text promo_code
        timestamp created_at
        timestamp updated_at
    }

    booking_sessions {
        uuid id PK
        uuid booking_id FK
        integer position
        uuid studio_id FK
        timestamp scheduled_at
        integer duration_hours
        integer headcount
        enum status "pending | confirmed | cancelled | completed"
    }

    offers {
        text id PK "slug"
        text category "bundle | offer"
        text name
        text name_ar
        decimal price
        decimal original_price
        integer hours
        jsonb features
        jsonb features_ar
        jsonb restricted_days
        jsonb restricted_hours
        uuid studio_id FK
        boolean is_active
        integer sort_order
    }

    promo_codes {
        uuid id PK
        text code UK
        text label
        integer discount_percent
        decimal discount_amount
        jsonb eligible_offer_ids
        timestamp expires_at
        integer max_uses
        boolean is_active
    }

    podcast_sets {
        text id PK "slug"
        text name
        text name_ar
        integer seats
        text location
        text image
        boolean is_available
        integer sort_order
    }

    podcast_addons {
        text id PK "slug"
        text title
        text title_ar
        integer price_num
        text price_display
        text unit
        text vimeo_embed
        boolean is_active
        integer sort_order
    }

    studio_blackouts {
        uuid id PK
        uuid studio_id FK "nullable (null = facility-wide)"
        text podcast_set_id
        text title
        text reason
        timestamp start_time
        timestamp end_time
        boolean all_day
    }

    equipment {
        uuid id PK
        text slug UK
        text name
        text arabic_name
        text category "cameras | lenses | audio | lighting | grip | accessories | bundles"
        decimal daily_rate
        decimal security_deposit
        integer total_quantity
        jsonb specs
        boolean is_popular
        boolean is_kit
        jsonb included_in_kit
        boolean is_available
    }

    projects {
        uuid id PK
        text slug UK
        text title
        text arabic_title
        enum category "government | commercial | influencer | event | documentary | shows"
        text client
        text cover_image_url
        text video_url
        jsonb deliverables
        jsonb tech_stack
        boolean is_featured
    }

    influencers {
        uuid id PK
        text slug UK
        text name
        text role
        text arabic_role
        text nationality
        text total_followers
        integer raw_followers
        text instagram_handle
        text youtube_handle
        text tiktok_handle
        jsonb collaborations
        jsonb signature_productions
        jsonb demographics
        boolean is_featured
    }

    inquiries {
        uuid id PK
        text name
        text email
        text phone
        text company
        enum inquiry_type "ob_van | live_broadcast | outdoor_filming | studio_booking | technical_support | general"
        text message
        text internal_notes
        boolean is_resolved
    }

    platform_settings {
        text key PK "payment_config | studio_wizard_catalog"
        jsonb value
        timestamp updated_at
    }
```

---

## 🚀 Complete Feature & Module Catalog

### 1. 🎙️ Soundstages & 7-Step Studio Booking Wizard (`/studios`, `/studio-booking`)
* **Certified Soundstage Fleet (`/studios`)**: Showcases Virtual Production stages (270° Micro-LED volumes), Commercial Cycloramas, Audio/Scoring stages, and Broadcast suites with full technical specifications (dimensions, ceiling height, power load, acoustic isolation ratings, and amenities).
* **Interactive 7-Step Reservation Wizard (`/studio-booking`)**:
  1. **Studio Selection (`StepStudio`)**: Choose soundstage with live hourly/half-day/full-day rates and headcount validation against stage capacity.
  2. **Session Format (`StepSessionType`)**: Select production format (`podcast`, `video_production`, `virtual_production`, `photography`, `interview`, `commercial`, `music_video`).
  3. **Date & Time Schedule (`StepDatetime`)**: Interactive calendar and duration selector with real-time slot conflict detection, turnaround buffer checks, and blackout filtering.
  4. **Crew & Cinema Gear (`StepCrewEquipment`)**: Add camera operators, lighting gaffers, sound engineers, and cinema gear packages.
  5. **Set Props & Scenery (`StepProps`)**: Configure modular furniture, greenery, teleprompters, and custom set dressing notes.
  6. **Post-Production (`StepPostProduction`)**: Add multi-cam editing, DaVinci Resolve color grading, sound mastering, and custom deliverables.
  7. **Contact, Promo & Checkout (`StepContact`)**: Apply promo codes, review itemized quote in `StudioQuoteRail`, create reservation, and launch `BookingPaymentModal` (Ziina Online Deposit/Full Payment or Corporate Bank Wire).

### 2. 🎧 Luxury 5-Step Podcast Booking Wizard (`/podcast-booking`)
* **Multi-Session & Multi-Set Architecture**: Supports single sessions or multi-session bundle checkouts where each session reserves its own date, time, headcount, and podcast set (`booking_sessions`) under a single atomic financial checkout.
* **5-Step Configuration Flow**:
  1. **Date, Time & Duration (`Step1DateTime`)**: Real-time availability check across all sessions in the package.
  2. **Podcast Set Selection (`Step2Setup`)**: Choose from curated Business Bay sets (*Nature Grid*, *Dark Walnut*, *Modern Minimal*, *Executive Lounge*, etc.) with seat capacity enforcement.
  3. **Service Tier (`Step3Service`)**: Select Raw Recording, Live Switched Multi-Cam, or Full Turnkey Production.
  4. **Viral Reels & Add-ons (`Step4Addons`)**: Add short-form vertical reels, YouTube thumbnails, intro animations, and Vimeo sample previews (`podcast_addons`).
  5. **Review, Promo & Checkout (`Step5ReviewCheckout`)**: Validates all session schedules atomically inside a PostgreSQL transaction before issuing payment intents.

### 3. 🎁 Turnkey Studio Offers & Multi-Session Bundles (`/offers`)
* **Curated Production Packages**: Supports both **Multi-Session Bundles** (e.g., *5-Hour Multi-Session Bundle* split across multiple filming days) and **Time-Restricted Special Offers** (e.g., *Morning Creator Special*, *Full-Day Lockout*).
* **Smart Schedule Restriction Enforcement**: Automatically validates `restrictedDays` (e.g., weekdays only) and `restrictedHours` (e.g., `09:00–14:00`) both in the client calendar (`Step2Schedule`) and on the server (`createOfferBooking`).
* **Offer-Scoped Promo Codes**: Supports promo codes restricted to specific `eligibleOfferIds` as well as global studio promo codes.

### 4. 📱 Social Media Production Packages (`/social-media-packages`)
* **Retainer & Campaign Engines**: Tiered monthly content engines (*Starter*, *Growth*, *Enterprise Sovereign*) with monthly vs. quarterly billing toggles (`BillingToggle`), side-by-side deliverable comparison tables (`PackageComparisonTable`), interactive deliverable showcases, FAQ accordions, and direct package order modals (`PackageOrderModal`).

### 5. 🎥 Cinema Equipment Fleet & Rental Cart (`/shop`)
* **170+ Cataloged Cinema Assets**: Camera bodies (ARRI Alexa Mini LF, RED V-Raptor XL, Sony Burano/FX9/FX6/FX3), anamorphic & prime lenses, Astera Titan & Aputure lighting, wireless audio, grip, drones, and turnkey production kits.
* **Dynamic Tiered Multi-Day Pricing ([`cart-pricing.ts`](file:///C:/Users/PC/Desktop/yaspro/src/features/gear/lib/cart-pricing.ts))**: Automatically applies multi-day rental discounting tiers (`1–2 days`, `3–6 days`, `7+ days`) and calculates refundable security deposits.
* **Persistent Slide-Over Cart & Checkout (`GearCartDrawer`, `GearCheckoutModal`)**: Date-range validation (`RentalDateSelector`) and instant reservation dispatch into the Studio Operations inquiry queue.

### 6. 🌟 Creator Network & Flagship Portfolio (`/influencers`, `/projects`)
* **MENA Creator Roster (`/influencers` & `/influencers/[slug]`)**: Filterable directory of flagship creators with follower metrics, audience demographics cards (`InfluencerAudienceCard`), social platform links, brand collaborations, and signature productions.
* **Cinematic Portfolio (`/projects` & `/projects/[slug]`)**: Filterable showcase across `government`, `commercial`, `influencer`, `event`, `documentary`, and `shows` categories with cinema video modals (`CinemaVideoModal`), deliverable breakdowns (`ProjectDeliverables`), and camera/lighting tech stacks (`ProjectTechStack`).
* **Dynamic Route OpenGraph Images**: Dedicated `opengraph-image.tsx` generators on `/`, `/influencers/[slug]`, and `/projects/[slug]` for rich social previews on WhatsApp, LinkedIn, and X.

### 7. 📡 Production Services, About & Dispatch Desk (`/services`, `/about`, `/contact`)
* **Production Services (`/services`)**: End-to-end capabilities showcase (Virtual Production, OB Van & Live Broadcast, Commercial Production, Post-Production & VFX, Sonic Branding) with an accessible, race-condition-safe service inquiry modal.
* **Heritage & Yas Group Ecosystem (`/about`)**: Studio vision, milestones, founder spotlight (`FounderSpotlight`), and the **Yas Group** subsidiary showcase (`YasGroupShowcase`).
* **Dispatch & Operations Desk (`/contact`)**: Specialized inquiry routing (`ob_van`, `live_broadcast`, `outdoor_filming`, `studio_booking`, `technical_support`, `general`) and Dubai studio location directory (`LocationsList`).

### 8. 👤 Client Portal (`/account`)
* **Unified Account Dashboard (`AccountDashboard`)**:
  * View all active, upcoming, and past studio/podcast/offer reservations (`ClientBookingCard`).
  * Complete outstanding deposits or settle remaining balances via **Ziina Instant Pay** or request **Corporate Bank Transfer** wire instructions directly from any unpaid or `deposit_paid` booking card.
  * Update profile details (`name`, `phone`, `company`) via `syncUserProfile` while preserving role integrity.

### 9. ⚡ 12-Module Admin Command Center (`/admin`)
Protected by both edge proxy cookie checks and server-side RBAC verification (`role === "admin"`):
1. **Command Overview (`/admin`)**: Real-time KPI telemetry, revenue metrics, booking conversion stats, and active queue counts (`metrics-overview.ts`).
2. **Bookings & Call Sheets (`/admin/bookings`)**: Full reservation lifecycle management, status transitions, online/wire payment recording, multi-session schedule inspector, and printable **Stage Call Sheet Modal** (`BookingCallSheetModal`).
3. **Soundstages Fleet (`/admin/studios`)**: Create, edit, toggle availability, and manage gallery/amenities for all physical and virtual soundstages.
4. **Podcast Catalog (`/admin/podcast`)**: Manage **Podcast Sets** (seats, location, images, availability) and **Podcast Add-ons** (pricing, units, Vimeo embeds).
5. **Turnkey Offers & Promo Codes (`/admin/offers`)**: Manage **Turnkey Bundles & Offers** (pricing, hours, day/hour restrictions) and **Promo Codes** (percentage/flat discounts, max uses, expiry, offer eligibility), plus **Studio Wizard Catalog** overrides (session types, crew, props, add-ons).
6. **Maintenance Blackouts (`/admin/blackouts`)**: Schedule studio-specific, podcast-set-specific, or facility-wide maintenance lockouts (`BlackoutManager`).
7. **Cinema Gear Inventory (`/admin/gear`)**: Manage 170+ rental items, daily rates, security deposits, kit inclusions, and stock quantities.
8. **Portfolio Projects (`/admin/projects`)**: Publish and curate flagship case studies, video reels, deliverables, and tech stacks.
9. **Creator Roster (`/admin/influencers`)**: Manage talent profiles, follower counts, social handles, and demographic metrics.
10. **Inquiries & Leads Desk (`/admin/inquiries`)**: Triage inbound service RFPs, OB van requests, and gear rental orders with internal operator notes and resolution tracking.
11. **Broadcast & OB Fleet (`/admin/broadcast`)**: Telemetry dispatcher and operational status board for Outside Broadcast (OB) vans and live satellite units (`BroadcastManager`).
12. **Users & Platform Settings (`/admin/users`, `/admin/settings`)**: Manage user accounts/roles (`UsersManager`) and configure corporate wire details (Beneficiary, IBAN, SWIFT), default Deposit %, UAE VAT %, Concierge contact info, and Stage Turnaround Buffer minutes (`SettingsManager`).

---

## 💳 Payment & Webhook Lifecycle Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client / Guest
    participant UI as Booking Wizard / Account
    participant Action as Server Action (createBooking)
    participant ZiinaSvc as Ziina Engine (src/lib/ziina.ts)
    participant ZiinaAPI as Ziina UAE Gateway
    participant Webhook as /api/webhooks/production
    participant DB as Neon PostgreSQL

    Client->>UI: Submits Studio / Podcast / Offer Booking
    UI->>Action: Validated Payload + Promo Code
    Action->>DB: Verify No Schedule/Blackout Overlap + Insert Booking (status: pending, payment: unpaid)
    alt Guest User (Not Logged In)
        Action-->>Client: Set Signed HttpOnly Cookie (booking-payment-{id})
    end
    Action-->>UI: Return bookingId & referenceCode (YAS-XXXXXX)

    UI->>ZiinaSvc: getBookingPaymentQuote(bookingId, referenceCode)
    ZiinaSvc->>DB: Verify Session Owner OR Guest Capability Cookie + Load Platform Settings
    ZiinaSvc-->>UI: Return Authoritative Quote (Deposit % Option & Full Balance Option)

    Client->>UI: Selects Deposit or Full Payment
    UI->>ZiinaSvc: createZiinaPaymentIntent(bookingId, expectedPayment, paymentType)
    ZiinaSvc->>ZiinaAPI: POST /api/payment_intent (Amount in Fils, Idempotency-Key)
    ZiinaAPI-->>ZiinaSvc: Return intentId & redirect_url
    ZiinaSvc->>DB: Persist paymentReference = intentId & paymentIntent terms
    ZiinaSvc-->>UI: Redirect Client to Ziina Checkout

    Client->>ZiinaAPI: Completes Apple Pay / Card Payment
    ZiinaAPI->>Webhook: POST payment_intent.status.updated + X-Hmac-Signature
    Webhook->>Webhook: Verify HMAC-SHA256 Signature & Timing-Safe Equality
    Webhook->>DB: Lookup Booking by paymentReference == intentId
    Webhook->>Webhook: Verify Paid Fils == Stored paymentIntent.amountFils & Currency == AED
    Webhook->>DB: Update status = 'confirmed', paymentStatus = 'deposit_paid' | 'paid'
    Webhook->>Client: Dispatch HTML Stage Call Sheet via Resend
```

---

## 🎨 Design, Motion & UI Architecture Standards

In accordance with the project's architectural rules ([`AGENTS.md`](file:///C:/Users/PC/Desktop/yaspro/AGENTS.md)):

1. **Bi-Directional Layouts (`EN` LTR & `AR` RTL):**
   * [`Navbar.tsx`](file:///C:/Users/PC/Desktop/yaspro/src/components/layout/Navbar.tsx), [`HeroSection.tsx`](file:///C:/Users/PC/Desktop/yaspro/src/components/sections/HeroSection.tsx), [`Footer.tsx`](file:///C:/Users/PC/Desktop/yaspro/src/components/layout/Footer.tsx), and [`MobileNavDrawer.tsx`](file:///C:/Users/PC/Desktop/yaspro/src/components/layout/MobileNavDrawer.tsx) dynamically adapt to `dir="ltr"` in English and `dir="rtl"` in Arabic.
   * In English, the brand logo is on the left, navigation flows left-to-right, and `MobileNavDrawer` opens from the right. In Arabic, the brand logo is on the right, navigation flows right-to-left, and `MobileNavDrawer` opens from the left.
2. **Brand Identity & Vector Geometry Integrity:**
   * The letter `A` in `YASPRO` always uses the authentic geometric delta triangle (`▲`) defined in [`yasprVectorPath.ts`](file:///C:/Users/PC/Desktop/yaspro/src/components/ui/yasprVectorPath.ts).
   * All app icons and favicons represent the circular camera aperture `[O]` with obsidian blades and a single `#FFE900` golden accent blade on a 100% transparent background.
3. **Color Palette & Atmospheric Lighting (Purple / Mauve — Strictly No Amber Shadows):**
   * Official lighting and accent colors: **Studio Mauve** (`#987ba5`), **Rich Violet** (`#765086`), **Deep Violet** (`#542568`), and **Lavender** (`#ddd3e1`).
   * All ambient glows, card shadows, and loader halos use Studio Mauve & Rich Violet. Amber or yellow shadows/glows are strictly prohibited.
4. **Global App Loader Architecture:**
   * [`GlobalPageLoader.tsx`](file:///C:/Users/PC/Desktop/yaspro/src/components/layout/GlobalPageLoader.tsx) and [`YasproAnimatedLoader.tsx`](file:///C:/Users/PC/Desktop/yaspro/src/components/ui/YasproAnimatedLoader.tsx) use pure CSS GPU keyframes (`animation-fill-mode: both`) with a 2.2s first-load entrance cycle to prevent SSR hydration flashes.
5. **SEO & Metadata Architecture ([`src/lib/metadata.ts`](file:///C:/Users/PC/Desktop/yaspro/src/lib/metadata.ts)):**
   * Canonical URLs resolved via `SITE_URL` (`https://yaspro-tablawy.vercel.app`), automatic `%s | Yas Pro` title templating, structured JSON-LD schema ([`JsonLd.tsx`](file:///C:/Users/PC/Desktop/yaspro/src/components/seo/JsonLd.tsx)), dynamic [`sitemap.ts`](file:///C:/Users/PC/Desktop/yaspro/src/app/sitemap.ts), and `robots: { index: false, follow: false }` protection on `/admin`, `/account`, `/login`, and `/register`.

---

## 📂 Comprehensive Project Structure

```text
yaspro/
├── src/
│   ├── app/                                  # Next.js 16 App Router
│   │   ├── (admin)/admin/                    # Protected Admin Command Center (12 Modules)
│   │   │   ├── blackouts/page.tsx            # Studio & podcast maintenance lockouts
│   │   │   ├── bookings/page.tsx             # Reservations, payments & Call Sheet generator
│   │   │   ├── broadcast/page.tsx            # OB van & live broadcast fleet telemetry
│   │   │   ├── gear/page.tsx                 # Cinema equipment & kit inventory CRUD
│   │   │   ├── influencers/page.tsx          # Creator roster & demographics CRUD
│   │   │   ├── inquiries/page.tsx            # Inbound leads, RFPs & gear cart requests
│   │   │   ├── offers/page.tsx               # Turnkey bundles, promos & wizard catalog CMS
│   │   │   ├── podcast/page.tsx              # Podcast sets & add-ons catalog CRUD
│   │   │   ├── projects/page.tsx             # Portfolio case studies & video reels CRUD
│   │   │   ├── settings/page.tsx             # Payment, wire, VAT & turnaround buffer config
│   │   │   ├── studios/page.tsx              # Soundstage fleet specifications CRUD
│   │   │   ├── users/page.tsx                # User directory & role management
│   │   │   ├── layout.tsx                    # Admin sidebar, RBAC session guard & shell
│   │   │   └── page.tsx                      # Executive dashboard & KPI telemetry
│   │   ├── (public)/                         # Public Storefront & Client Experience
│   │   │   ├── about/page.tsx                # Studio heritage, founder & Yas Group ecosystem
│   │   │   ├── account/page.tsx              # Authenticated client portal & payment center
│   │   │   ├── contact/page.tsx              # Operations dispatch desk & studio locations
│   │   │   ├── influencers/                  # Creator directory & [slug] profile + dynamic OG
│   │   │   ├── login/                        # Client & admin sign-in
│   │   │   ├── offers/                       # Turnkey studio offers & bundle booking wizard
│   │   │   ├── podcast-booking/page.tsx      # 5-step multi-session podcast booking wizard
│   │   │   ├── privacy-policy/page.tsx       # Privacy governance
│   │   │   ├── projects/                     # Flagship portfolio & [slug] showcase + dynamic OG
│   │   │   ├── register/                     # Client account registration
│   │   │   ├── services/                     # Production services & inquiry modal
│   │   │   ├── shop/                         # Cinema gear catalog, cart drawer & checkout
│   │   │   ├── social-media-packages/        # Retainer tiers, comparison table & order modal
│   │   │   ├── studio-booking/               # 7-step soundstage reservation wizard
│   │   │   ├── studios/                      # Soundstage fleet showcase & technical specs
│   │   │   ├── terms/page.tsx                # Commercial terms of service
│   │   │   └── page.tsx                      # Landing page (Hero, Orbit, Virtual Studio, Marquee)
│   │   ├── api/                              # REST & Webhook Route Handlers
│   │   │   ├── auth/[...all]/route.ts        # Better-Auth authentication endpoints
│   │   │   ├── gear/route.ts                 # Equipment catalog JSON API
│   │   │   ├── upload/route.ts               # Admin media upload with magic-byte validation
│   │   │   └── webhooks/production/route.ts  # Ziina HMAC-SHA256 payment webhook reconciler
│   │   ├── opengraph-image.tsx               # Root brand vector OpenGraph generator
│   │   ├── robots.ts                         # Search crawler governance
│   │   ├── sitemap.ts                        # Dynamic XML sitemap generator
│   │   └── layout.tsx                        # Root layout, providers, fonts & global loader
│   ├── components/                           # Shared UI, Layout, Admin Forms & Motion
│   │   ├── admin/                            # AdminSidebar, AdminMobileNav & 12 FormModals
│   │   ├── animations/                       # Framer Motion wrappers
│   │   ├── common/                           # CinemaVideoModal, GlobalAmbientGlow
│   │   ├── layout/                           # Navbar, Footer, MobileNavDrawer, GlobalPageLoader
│   │   ├── magicui/                          # BorderBeam, Marquee
│   │   ├── providers/                        # LanguageProvider, CartProvider, SmoothScroll
│   │   ├── sections/                         # HeroSection, HeroMediaOrbit, VirtualStudio, etc.
│   │   ├── seo/                              # JsonLd structured data
│   │   └── ui/                               # Primitives, skeletons & YASPRO vector geometry
│   ├── db/                                   # Database Layer
│   │   ├── migrations/                       # 14 SQL migrations (0000 to 0013) & meta journal
│   │   ├── index.ts                          # Dual HTTP + WebSocket transactional Drizzle proxy
│   │   ├── schema.ts                         # 14 PostgreSQL tables, 4 enums & relations
│   │   └── seed.ts                           # Idempotent production & admin seed script
│   ├── features/                             # Domain-Driven Feature Modules (14 Domains)
│   │   ├── about/                            # Milestones, overview, founder spotlight
│   │   ├── account/                          # AccountDashboard, ClientBookingCard
│   │   ├── admin/                            # 12 Admin Manager views & CRUD/filter hooks
│   │   ├── booking/                          # 7-step Studio Booking Wizard, pricing & quote rail
│   │   ├── contact/                          # Contact form, inquiry selector & locations
│   │   ├── gear/                             # 170+ gear inventory, tiered pricing, cart & checkout
│   │   ├── group/                            # Yas Group subsidiary showcase
│   │   ├── influencers/                      # Creator explorer, filters, demographics & bio
│   │   ├── offers/                           # 3-step Offers Wizard, promo engine & DB actions
│   │   ├── partners/                         # Partner brand logos & data
│   │   ├── podcast-booking/                  # 5-step Podcast Wizard, multi-session tx & quote rail
│   │   ├── projects/                         # Portfolio explorer, hero stage, tech stack
│   │   ├── social-media-packages/            # Retainer cards, billing toggle, comparison & modal
│   │   └── studios/                          # Soundstage data & specifications
│   ├── hooks/                                # Reusable React hooks (useCrud, useFocusTrap, etc.)
│   ├── i18n/                                 # next-intl request config & EN/AR dictionaries
│   ├── lib/                                  # Core Server Libraries & 18 Modular Action Files
│   │   ├── actions/                          # Granular server actions (availability, blackouts,
│   │   │                                     # bookings, broadcast, gear, influencers, inquiries,
│   │   │                                     # metrics, offers, platform-settings, podcast,
│   │   │                                     # projects, social-packages, studios, users, wizard)
│   │   ├── queries/                          # Shared DB query helpers (studio-promo-rules)
│   │   ├── types/                            # PlatformPaymentSettings & shared types
│   │   ├── actions.ts                        # Public booking, inquiry & profile server actions
│   │   ├── auth.ts & auth-client.ts          # Better-Auth server & client instances
│   │   ├── booking-payment-capability.ts     # HMAC-SHA256 guest payment cookie signer
│   │   ├── cached-queries.ts                 # Tagged unstable_cache query layer
│   │   ├── deployment-environment.ts         # Vercel preview vs. production credential isolation
│   │   ├── metadata.ts                       # Canonical SEO & OpenGraph builder
│   │   ├── notifications.ts                  # Resend email dispatcher (Call Sheets & Lead Alerts)
│   │   ├── payment-actions.ts                # Admin online payment & client wire transfer actions
│   │   ├── rate-limit.ts                     # Sliding-window IP rate limiter & idempotency guard
│   │   ├── storage.ts                        # Cloudinary / S3 / Local Disk upload abstraction
│   │   ├── validations.ts                    # Zod v4 schemas
│   │   └── ziina.ts                          # Ziina payment quote & intent engine
│   └── proxy.ts                              # Next.js 16 Edge Proxy (i18n rewrites & auth guard)
├── public/                                   # Brand assets, aperture icons, studio & creator media
└── tests/                                    # 179-test automated suite across 15 test files
```

---

## 🛠️ Environment Variables (`.env.local`)

| Variable | Required | Description | Example / Default |
| :--- | :---: | :--- | :--- |
| **Database & Core** | | | |
| `DATABASE_URL` | ✅ | Neon Serverless PostgreSQL connection string | `postgresql://user:pass@ep-...neon.tech/neondb?sslmode=require` |
| `PREVIEW_DATABASE_URL` | Optional | Isolated database URL automatically used on Vercel Preview deployments | `postgresql://...` |
| `NEXT_PUBLIC_APP_URL` | ✅ | Canonical application URL used for SEO, callbacks, and Ziina redirects | `https://yaspro-tablawy.vercel.app` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional | Commercial concierge WhatsApp number | `971554010465` |
| **Authentication & Security** | | | |
| `BETTER_AUTH_SECRET` | ✅ | 32+ character secret for Better-Auth sessions & guest payment HMAC cookies | `32+ char random hex/base64` |
| `PREVIEW_BETTER_AUTH_SECRET` | Optional | Isolated auth secret for Vercel Preview deployments | `32+ char random secret` |
| `INITIAL_ADMIN_PASSWORD` | Seed Only | Explicit password for seeding initial admin accounts (`ADMIN_SEED_PASSWORD` also supported) | Required when running `src/db/seed.ts` |
| **Payments & Webhooks (Ziina)** | | | |
| `ZIINA_API_KEY` | Prod ✅ | Ziina UAE Gateway live/sandbox Bearer API token | `sec_...` |
| `ZIINA_SIMULATE` | Dev Only | Enables instant simulated Ziina payments outside production (`NODE_ENV !== "production"`) | `true` (dev) / `false` (prod) |
| `WEBHOOK_SECRET` | Prod ✅ | HMAC-SHA256 secret used to verify `X-Hmac-Signature` on `/api/webhooks/production` | `whsec_...` |
| `ALLOW_UNSIGNED_WEBHOOKS` | Test Only | Permits unsigned webhook requests in isolated local/test runners | `false` |
| **Media Storage (Cloudinary / S3)** | | | |
| `STORAGE_DRIVER` | Optional | Active upload driver: `cloudinary`, `s3`, or `local` (auto-detects Cloudinary if keys set) | `cloudinary` |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary cloud name for `/api/upload` media DAM | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API key | `1234567890` |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API secret | `your_api_secret` |
| `CLOUDINARY_FOLDER` | Optional | Target folder in Cloudinary | `yaspro` |
| `AWS_ACCESS_KEY_ID` | Optional | S3 / Cloudflare R2 access key (when `STORAGE_DRIVER=s3`) | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | Optional | S3 / Cloudflare R2 secret key | `...` |
| `AWS_REGION` | Optional | S3 bucket region | `us-east-1` |
| `S3_BUCKET` | Optional | S3 bucket name | `yaspro-uploads` |
| `S3_ENDPOINT` | Optional | Custom S3-compatible endpoint (e.g., Cloudflare R2) | `https://<id>.r2.cloudflarestorage.com` |
| **Notifications (Resend)** | | | |
| `RESEND_API_KEY` | Optional | Resend API key for live HTML Call Sheet & Lead Alert emails (falls back to log if omitted) | `re_...` |
| `INQUIRY_NOTIFICATION_EMAIL` | Optional | Operations inbox receiving inbound service & gear inquiries | `production@yaspro.ae` |

---

## 💻 Getting Started & Development Commands

### 1. Prerequisites
* **Node.js**: `v20.x` or `v24.x`
* **Package Manager**: `npm`
* **Database**: A Neon Serverless PostgreSQL instance (or local PostgreSQL for development)

### 2. Installation
```bash
git clone https://github.com/galilio2023/yaspro.git
cd yaspro
npm install
```

### 3. Database Schema & Migrations
```bash
# Generate new Drizzle SQL migrations from src/db/schema.ts
npm run db:generate

# Run pending migrations
npm run db:migrate

# Push schema directly to development database
npm run db:push

# Launch Drizzle Studio GUI to inspect tables
npm run db:studio
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Switch between English (`/en`) and Arabic (`/ar`) using the language toggle in the navigation bar.

### 5. Run Automated Test Suite (179 Tests)
The repository includes **179 automated unit and integration tests** across **15 test suites** (`tests/*.test.mjs`) verifying:
* Admin CMS CRUD actions, RBAC guards, and regression fixes (`admin-cms-actions.test.mjs`, `admin-review-regressions.test.mjs`)
* Studio, Podcast, and Offer booking wizards, multi-session transactions, capacity limits, and blackout/overlap conflict prevention (`booking-and-inquiry.test.mjs`, `booking-catalog-integrity.test.mjs`, `booking-review-fixes.test.mjs`, `podcast-booking.test.mjs`, `offers-booking.test.mjs`)
* Ziina payment quotes, deposit/balance calculations, guest HMAC capabilities, corporate bank transfer state protection, and HMAC-SHA256 webhook reconciliation (`ziina-payment.test.mjs`, `payment-actions.test.mjs`, `payment-webhook.test.mjs`)
* Cinema gear cart persistence, tiered pricing, and checkout inquiries (`gear-checkout.test.mjs`, `services-inquiry.test.mjs`)
* Rate limiting, idempotency, HTML escaping, fail-closed production auth, preview credential isolation, and seed credential precedence (`rate-limit-and-conflict.test.mjs`, `security-reliability.test.mjs`, `seed-credentials.test.mjs`)

```bash
npm test
```
```text
ℹ tests 179
ℹ suites 0
ℹ pass 179
ℹ fail 0
```

### 6. Type Check, Lint & Production Build
```bash
npm run typecheck
npm run lint
npm run build
```

---

## 🚢 Deployment

The platform is deployed on **Vercel** with continuous deployment from `main`:
1. Vercel automatically builds the Next.js 16 App Router application (`npm run build`).
2. Configure production environment variables in **Vercel Project Settings ➔ Environment Variables** (and optional `PREVIEW_DATABASE_URL` / `PREVIEW_BETTER_AUTH_SECRET` for isolated preview branch deployments).
3. Configure Ziina webhooks to point to `https://<your-domain>/api/webhooks/production` with `WEBHOOK_SECRET` matching the signing secret.

---

## 📄 License & Attribution

Copyright © 2026 **Yas Productions LLC (Dubai, UAE)**. All rights reserved.  
Unauthorized distribution, copying, or modification of this proprietary software is strictly prohibited.
