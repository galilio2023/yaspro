# 🎬 YAS PRO — Sovereign AI Media Hub & Production Ecosystem
### Dubai, UAE • Next-Generation Virtual Production, Soundstage Fleet & Cinema Gear Engine

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Neon Database](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge&logo=drizzle)](https://orm.drizzle.team/)
[![Better-Auth](https://img.shields.io/badge/Better--Auth-Security-purple?style=for-the-badge)](https://better-auth.com/)
[![Ziina Payments](https://img.shields.io/badge/Ziina-UAE_Gateway-24C36C?style=for-the-badge)](https://ziina.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-117%20Passed-brightgreen?style=for-the-badge)](https://github.com/)

---

## 📌 Executive Overview

**Yas Pro** is an enterprise-grade digital production and media operations platform designed for high-profile cinema productions, sovereign government broadcasts, and commercial creator campaigns across the UAE and the greater GCC region.

Built from the ground up to replace legacy monolithic systems, Yas Pro delivers sub-millisecond response times, high-security serverless database resilience via **Neon PostgreSQL**, integrated **Ziina UAE payment processing**, and a streamlined dual-locale architecture supporting native **Arabic (RTL)** and **English (LTR)** workflows.

---

## 🏛️ System Architecture

```mermaid
flowchart TB
    subgraph ClientLayer [" Client Experience Layer "]
        Web["Web Client (Next.js 15 / React 19)"]
        Mobile["Mobile Web Experience (Responsive)"]
        Portal["Client Portal (/portal)"]
        Admin["Admin Operations Hub (/admin)"]
    end

    subgraph AppRouter [" Next.js App Router & Server Actions "]
        Middleware["i18n Locale & Security Proxy"]
        Actions["Server Actions (/lib/actions)"]
        API["REST & Webhook Handlers (/api)"]
        AuthModule["Better-Auth Engine (/lib/auth)"]
    end

    subgraph ServiceLayer [" Integration & Business Logic "]
        Mawthooq["Mawthooq UAE Ad Auditor"]
        ZiinaSvc["Ziina UAE Payment Gateway"]
        DialectEng["GCC Arabic Dialect AI Engine"]
        Scheduler["Conflict-Free Soundstage Scheduler"]
    end

    subgraph DataLayer [" Serverless Database (Neon PostgreSQL) "]
        Drizzle["Drizzle ORM HTTP Adapter"]
        NeonDB[("Neon Serverless PostgreSQL\n(ep-patient-dawn pooler)")]
    end

    Web --> Middleware
    Mobile --> Middleware
    Portal --> Middleware
    Admin --> Middleware

    Middleware --> Actions
    Middleware --> API
    Actions --> AuthModule

    Actions --> Mawthooq
    Actions --> ZiinaSvc
    Actions --> DialectEng
    Actions --> Scheduler

    Actions --> Drizzle
    API --> Drizzle
    Drizzle --> NeonDB
```

---

## 🗄️ Database Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o{ sessions : "has many"
    users ||--o{ accounts : "has many"
    users ||--o{ bookings : "places"
    users ||--o{ enterprise_rfps : "submits"
    studios ||--o{ bookings : "reserved for"

    users {
        text id PK
        text name
        text email UK
        boolean email_verified
        text role "admin | client"
        text phone
        text company
        timestamp created_at
        timestamp updated_at
    }

    accounts {
        text id PK
        text account_id
        text provider_id
        text user_id FK
        text password
    }

    sessions {
        text id PK
        text user_id FK
        text token UK
        text ip_address
        timestamp expires_at
    }

    studios {
        uuid id PK
        text slug UK
        text name
        text arabic_name
        decimal hourly_rate
        integer capacity
        jsonb amenities
        boolean is_active
    }

    equipment {
        uuid id PK
        text slug UK
        text name
        text arabic_name
        text category "cameras | lenses | audio | lighting | bundles"
        decimal daily_rate
        decimal security_deposit
        text description
        text arabic_description
        jsonb specs
        boolean is_available
        boolean is_kit
    }

    bookings {
        uuid id PK
        text reference_code UK
        text user_id FK
        uuid studio_id FK
        text session_type
        text status "pending | confirmed | cancelled | completed"
        decimal total_amount
        text currency "AED"
        text payment_status "unpaid | paid | refunded"
        timestamp scheduled_at
        integer duration_hours
        jsonb equipment_ids
    }

    enterprise_rfps {
        uuid id PK
        text reference_code UK
        text user_id FK
        text organization_name
        text contact_name
        text work_email
        text phone
        text project_scope
        text estimated_budget
        boolean requires_mawthooq_compliance
        boolean requires_ob_van
        text status
    }

    projects {
        uuid id PK
        text slug UK
        text title
        text arabic_title
        text category
        text client
        text video_url
        boolean is_featured
    }

    influencers {
        uuid id PK
        text slug UK
        text name
        text role
        text total_followers
        text instagram_handle
        boolean is_featured
    }

    inquiries {
        uuid id PK
        text name
        text email
        text phone
        text inquiry_type
        text message
        boolean is_resolved
    }
```

---

## 📊 Live Database Status vs. Legacy Migration Parity

The platform replaced a legacy 598MB WordPress MySQL installation with normalized, high-performance PostgreSQL tables hosted on **Neon Serverless**:

| Neon Entity | Live Records | WordPress Dump (`u363039021_yaspro.sql`) | Migration & Integrity Highlights |
| :--- | :---: | :---: | :--- |
| **`equipment`** | **173 items** | 327 product posts (160 unique + duplicate translation posts) | ✅ Cleaned 108 `-2` slug clones. Populated **158 Arabic technical descriptions** directly from legacy translations into `arabic_description`. |
| **`studios`** | **4 stages** | 3 rudimentary calendar plugins | ✅ Structured soundstage fleet (Main Stage, Cyclorama, Podcast, XR Virtual Production Stage). |
| **`users`** | **8 accounts** | 15 accounts (8 staff + 7 spam bots) | ✅ Zero external client accounts were lost; all 7 bot registrations purged; 5 core admins + 3 clients active. |
| **`bookings`** | **8 bookings** | 29 staff plugin test bookings | ✅ Normalized booking records with AED totals and reference codes. |
| **`projects`** | **9 films** | Elementor raw HTML metadata | ✅ Curated flagship portfolio films (UAE Flag Day, GITEX, DMX, etc.). |
| **`influencers`**| **8 creators**| Unstructured WP pages | ✅ Verified MENA creators (Abo Flah, Noor Stars, etc.) with metrics. |
| **`inquiries`**  | **1 active**  | Unformatted contact forms | ✅ Typed equipment rental lead pipeline with client notes. |
| **`enterprise_rfps`** | **Active Schema** | N/A | ✅ High-security sovereign enterprise RFP intake engine. |

---

## 🚀 Key Modules & Capabilities

### 1. 🎥 Cinema Equipment Fleet & Smart Rental Cart
* **173 Cataloged Items:** Cinema cameras (ARRI Alexa Mini LF, RED V-Raptor XL, Sony FX3/FX6/FX9), anamorphic glass, Astera Titan tubes, and Sennheiser audio.
* **Tiered Day Rates:** Real-time multi-day discounting algorithms (`1–2 days`, `3–6 days`, `7+ days`).
* **Instant Inquiries & Reservations:** Reservation requests auto-generate formatted inquiries with client details and kit requirements.

### 2. 🎙️ Soundstages & Virtual Production Booking
* **Conflict-Free Scheduling:** Real-time slot locking prevents double bookings for overlapping soundstage timeframes.
* **Add-On Amenities:** Production control room, lighting grid packages, green screen cyclorama prep, and XR tracking volume.

### 3. 💳 Ziina UAE Sovereign Payment Engine
* **Instant Card & Apple Pay:** Direct integration with Ziina's UAE payment gateway.
* **Bank Transfer Fallback:** Automated wire instruction generation for corporate clients.
* **Webhook Reconciler:** Idempotent payment completion handler at `/api/webhooks/production`.

### 4. 🛡️ Mawthooq Compliance & UAE Ad Disclosure
* **Regulatory Guardian:** AI engine analyzing marketing copy to guarantee compliance with UAE General Authority of Media Regulation (GAMR) Mawthooq licensing rules and `#إعلان` requirements.

### 5. ⚡ Admin Command Center (`/admin`)
* **Unified Fleet Management:** Full CRUD operations across gear, studios, influencers, projects, and bookings.
* **Safe Action Guards:** Interactive `AdminConfirmModal` dialogs replacing native browser `confirm()` / `alert()` popups.
* **Live Telemetry & Broadcast Metrics:** Real-time revenue summaries and reservation lead counters.

---

## 🎨 UI/UX Architecture & Layout Rules

As mandated in project rules:
1. **Global Navigation & Footer Anchoring (Strict LTR):**
   * The Navbar (`Navbar.tsx`), Footer (`Footer.tsx`), and `BrandLogo` (`AI MEDIA HUB • DUBAI`) are rigidly locked with `dir="ltr"` and `direction: ltr`.
   * Switching languages to Arabic (RTL) translates text without flipping or reversing the top navigation bar or footer layout.
2. **Floating Action Elements (Always Anchored Right):**
   * The Floating Concierge & Copilot actions (`UnifiedFloatingActions.tsx`, `FloatingCopilotButton.tsx`) are rigidly pinned to the bottom-right corner (`right-4 sm:right-6`).
   * No logical properties like `end-4` are used on floating containers, guaranteeing zero jumpiness when toggling between Arabic and English.

---

## 📂 Project Structure

```
yaspro/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (auth)/                  # Sign-in & Sign-up routes
│   │   ├── admin/                   # Administrative Operations Hub
│   │   │   ├── gear/                # Equipment management CRUD
│   │   │   ├── studios/             # Soundstages & scheduling
│   │   │   ├── inquiries/           # Client lead inbox
│   │   │   ├── influencers/         # Creator roster
│   │   │   └── projects/            # Portfolio showcases
│   │   ├── api/                     # REST endpoints & Ziina webhooks
│   │   ├── gear/                    # Public Cinema Fleet Catalog
│   │   ├── studios/                 # Studio detail & booking views
│   │   ├── portal/                  # Client Self-Service Dashboard
│   │   └── layout.tsx               # Root layout & providers
│   ├── components/
│   │   ├── admin/                   # Admin UI modals & confirm dialogs
│   │   ├── layout/                  # Navbar, Footer & Brand Logo
│   │   ├── shared/                  # Reusable badges, buttons & cards
│   │   └── ui/                      # Base primitives (Radix UI / Tailwind)
│   ├── db/                          # Neon PostgreSQL database layer
│   │   ├── index.ts                 # Serverless connection client
│   │   └── schema.ts                # Drizzle ORM schema definitions
│   ├── features/                    # Domain-driven feature packages
│   │   ├── gear/                    # Equipment pricing & cart logic
│   │   ├── booking/                 # Soundstage calendar scheduler
│   │   └── rfp/                     # Enterprise RFP multi-step wizard
│   └── lib/                         # Server actions & utilities
│       ├── actions/                 # Typed Server Actions (CRUD operations)
│       ├── ai/                      # Mawthooq & dialect analyzers
│       ├── auth.ts                  # Better-Auth server configuration
│       └── ziina.ts                 # Ziina UAE payment integration
├── public/                          # Optimized images, icons & reels
└── tests/                           # Unit & integration test suites
```

---

## 🛠️ Environment Variables (`.env.local`)

| Variable | Description | Example / Note |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon Serverless PostgreSQL connection URL | `postgresql://user:pass@ep-patient-dawn...neon.tech/neondb?sslmode=require` |
| `BETTER_AUTH_SECRET` | 32-character encryption key for Better-Auth | `w3Z...your-secret-key...` |
| `NEXT_PUBLIC_APP_URL` | Canonical application URL | `http://localhost:3000` or `https://yasproductions.com` |
| `ZIINA_API_KEY` | Ziina UAE Gateway Production/Sandbox API key | `sec_...` |
| `ZIINA_SIMULATE_PAYMENTS` | Allows sandbox mock transactions for testing | `true` in development, `false` in production |
| `ADMIN_SEED_PASSWORD` | Seed password for initial master admin accounts | Required for running database seed scripts |

---

## 💻 Getting Started

### 1. Prerequisites
* **Node.js**: `v20.x` or `v24.x`
* **Package Manager**: `npm`

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/yasproductions/yaspro.git
cd yaspro

# Install project dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Test Suite
The codebase includes a comprehensive 117-test suite verifying database isolation, payment intents, rate limits, cart pricing, and admin mutations:
```bash
npm test
```
```text
ℹ tests 117
ℹ suites 0
ℹ pass 117
ℹ fail 0
ℹ duration_ms ~9800ms
```

---

## 🚢 Deployment

### Vercel Production Deployment
1. Import the repository into your **Vercel** team account.
2. In **Project Settings ➔ Environment Variables**, configure all variables from `.env.local`.
3. Set the build command to `npm run build` and output directory to `.next`.
4. Deploy! Neon PostgreSQL automatically handles pooled connections via `@neondatabase/serverless`.

---

## 📄 License & Attribution

Copyright © 2026 **Yas Productions LLC (Dubai, UAE)**. All rights reserved.  
Unauthorized distribution, copying, or modification of this proprietary software is strictly prohibited.
