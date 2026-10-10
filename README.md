# 🎬 YAS PRO — Sovereign AI Media Hub & Production Ecosystem
### Dubai, UAE • Next-Generation Virtual Production, Soundstage Fleet & Cinema Gear Engine

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Neon Database](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge&logo=drizzle)](https://orm.drizzle.team/)
[![Better-Auth](https://img.shields.io/badge/Better--Auth-Security-purple?style=for-the-badge)](https://better-auth.com/)
[![Ziina Payments](https://img.shields.io/badge/Ziina-UAE_Gateway-24C36C?style=for-the-badge)](https://ziina.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-87%20Passed-brightgreen?style=for-the-badge)](https://github.com/)
[![Live Deployment](https://img.shields.io/badge/Vercel-Live_Staging-000000?style=for-the-badge&logo=vercel)](https://yaspro-tablawy.vercel.app/)

---

## 📌 Executive Overview

**Yas Pro** is an enterprise-grade digital production and sovereign media operations platform engineered for cinematic feature productions, government broadcasts, commercial creator campaigns, and virtual studio soundstages across the UAE and the greater GCC region.

Built from the ground up to replace legacy monolithic systems, Yas Pro delivers sub-millisecond response times, high-security serverless database resilience via **Neon PostgreSQL**, integrated **Ziina UAE payment processing**, dynamic **OpenGraph & Twitter media cards**, and a streamlined dual-locale architecture supporting native **Arabic (RTL)** and **English (LTR)** workflows.

🌐 **Live Deployed Staging:** [https://yaspro-tablawy.vercel.app](https://yaspro-tablawy.vercel.app)

---

## 🏛️ System Architecture

```mermaid
flowchart TB
    subgraph ClientLayer [" Client Experience Layer "]
        Web["Web Client (Next.js 16 / React 19)"]
        Mobile["Mobile Web Experience (Responsive)"]
        Portal["Client Portal (/account)"]
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
        MetadataSvc["Dynamic OpenGraph & SEO Engine"]
    end

    subgraph DataLayer [" Serverless Database (Neon PostgreSQL) "]
        Drizzle["Drizzle ORM HTTP Adapter"]
        NeonDB[("Neon Serverless PostgreSQL\n(Pooled Connection)")]
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
    Actions --> MetadataSvc

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

## 🚀 Key Modules & Capabilities

### 1. 🎥 Cinema Equipment Fleet & Rental Cart (`/shop`)
* **170+ Cataloged Items:** Cinema camera bodies (ARRI Alexa Mini LF, RED V-Raptor XL, Sony FX3/FX6/FX9), optical prime packages, Astera Titan sets, and wireless audio.
* **Tiered Rental Rates:** Real-time multi-day discounting algorithms (`1–2 days`, `3–6 days`, `7+ days`).
* **Instant Inquiries & Reservations:** Equipment reservation requests auto-generate formatted inquiries with client details and kit requirements.

### 2. 🎙️ Soundstages, Virtual Production & Podcast Studios
* **Certified Stages (`/studios`):** 270° Micro-LED virtual production soundstages, Neve & SSL tracking consoles, and infinite cycloramas.
* **Studio Booking Wizard (`/studio-booking`):** Interactive session type, crew selection, and post-production add-on configuration.
* **Podcast Suite Booking (`/podcast-booking`):** Luxury 4K multi-cam capture, Shure SM7B broadcast microphones, and live switching feeds.
* **Social Media Packages (`/social-media-packages`):** Turnkey 4K cinema reels, monthly content engines, and soundstage filming days in Business Bay, Dubai.

### 3. 🌐 Creator Network & Portfolio Showcases
* **Creator Hub (`/influencers`):** Top-tier MENA creators (AboFlah, Abir El Saghir, Noor Stars, Narins Beauty) with demographic metrics and portfolio highlights.
* **Flagship Portfolio (`/projects`):** National campaigns, UAE Flag Day, commercial broadcasts, and original digital productions.
* **Dynamic OpenGraph Previews:** Dedicated social cards displaying authentic creator avatars and high-resolution project posters on WhatsApp, LinkedIn, Twitter/X, and Facebook.

### 4. 💳 Ziina UAE Sovereign Payment Engine
* **Instant Card & Apple Pay:** Direct integration with Ziina's UAE payment gateway.
* **Bank Transfer Fallback:** Automated wire instruction generation for corporate production entities.
* **Webhook Reconciler:** Idempotent payment completion handler at `/api/webhooks/production`.

### 5. ⚡ Admin Command Center (`/admin`)
* **Unified Operations Fleet:** Full CRUD operations across gear, soundstages, bookings, broadcast units, inquiries, creators, and projects.
* **Safe Action Guards:** Interactive `AdminConfirmModal` dialogs replacing native browser popups.
* **Broadcast Fleet Telemetry:** Live reservation metrics, revenue tracking, and inquiry status management.

---

## 🎨 Design, Motion & UI Architecture Standards

As defined in the project architecture guidelines:

1. **Global Navigation & Footer Anchoring (Strict LTR):**
   * The Navbar (`Navbar.tsx`), Footer (`Footer.tsx`), and `BrandLogo` are rigidly locked with `dir="ltr"` and `direction: ltr`.
   * Switching between Arabic and English translates typography without flipping or inverting the physical layout.
2. **Floating Action Elements (Always Anchored Bottom-Right):**
   * Floating CTAs and Copilot buttons (`UnifiedFloatingActions.tsx`, `FloatingCopilotButton.tsx`) are pinned to `right-4 sm:right-6` using physical CSS properties.
   * No logical CSS properties like `end-4` are used, preventing jumps during RTL switching.
3. **Brand Identity & Geometry:**
   * Authentic geometric delta triangle (`▲`) with rounded apex corners for the letter `A` in `YASPRO` (`yasprVectorPath.ts`).
   * Circular camera aperture `[O]` with obsidian blades and `#FFE900` accent blade on 100% transparent backgrounds.
4. **Color Standards (Purple & Mauve Lighting):**
   * Studio Mauve (`#987ba5`), Rich Violet (`#765086`), Deep Violet (`#542568`), and Lavender (`#ddd3e1`).
   * Strictly no amber or yellow shadows anywhere across the application.
5. **SEO & Metadata Architecture:**
   * Centralized canonical domain via `SITE_URL` defaulting to `https://yaspro-tablawy.vercel.app`.
   * Automatic subpage title templating (`%s | Yas Pro`) with zero double suffixes.
   * Tailored OpenGraph 1200x630 dimensions on all public routes.
   * `robots: { index: false, follow: false }` protection on `/admin`, `/account`, `/login`, and `/register`.

---

## 📂 Project Structure

```
yaspro/
├── src/
│   ├── app/                         # Next.js App Router (v16)
│   │   ├── (admin)/                 # Protected Administrative Operations
│   │   │   └── admin/               # Gear, bookings, broadcast, CMS
│   │   ├── (public)/                # Public storefront & discovery routes
│   │   │   ├── about/               # Heritage & studio vision
│   │   │   ├── account/             # Client portal & active bookings
│   │   │   ├── contact/             # Operations & dispatch desk
│   │   │   ├── influencers/         # Creator roster & profile [slug]
│   │   │   ├── login/               # Secure client sign-in
│   │   │   ├── podcast-booking/     # 4K multi-cam podcast wizard
│   │   │   ├── privacy-policy/      # Privacy governance
│   │   │   ├── projects/            # Portfolio showcase & [slug]
│   │   │   ├── register/            # Creator & enterprise registration
│   │   │   ├── shop/                # Cinema gear rental catalog
│   │   │   ├── social-media-packages/ # Turnkey digital packages
│   │   │   ├── studio-booking/      # Soundstage reservation wizard
│   │   │   ├── studios/             # Soundstage fleet specifications
│   │   │   └── terms/               # Commercial terms of service
│   │   ├── api/                     # REST endpoints, auth, webhooks
│   │   ├── opengraph-image.tsx      # Dynamic brand vector OG generator
│   │   ├── robots.ts                # Search bot crawler rules
│   │   ├── sitemap.ts               # Dynamic XML sitemap generator
│   │   └── layout.tsx               # Root layout, fonts & metadata
│   ├── components/                  # UI components, layout & animations
│   ├── db/                          # Neon PostgreSQL & Drizzle schemas
│   ├── features/                    # Domain-driven feature packages
│   └── lib/                         # Server actions, Better-Auth, Ziina, constants
├── public/                          # Optimized brand assets, aperture icons, reels
└── tests/                           # 87-test automated unit & integration suite
```

---

## 🛠️ Environment Variables (`.env.local`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon Serverless PostgreSQL connection URL | `postgresql://user:pass@ep-...neon.tech/neondb?sslmode=require` |
| `BETTER_AUTH_SECRET` | Encryption key for Better-Auth sessions | `32+ character random secret` |
| `NEXT_PUBLIC_APP_URL` | Canonical application URL | `https://yaspro-tablawy.vercel.app` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Commercial concierge WhatsApp number | `971554010465` |
| `ZIINA_API_KEY` | Ziina UAE Gateway Production/Sandbox API key | `sec_...` |
| `ZIINA_SIMULATE_PAYMENTS` | Allows sandbox mock transactions for testing | `true` (dev) / `false` (prod) |
| `ADMIN_SEED_PASSWORD` | Seed password for initial master admin accounts | Required for running seed scripts |

---

## 💻 Getting Started

### 1. Prerequisites
* **Node.js**: `v20.x` or `v24.x`
* **Package Manager**: `npm`

### 2. Installation
```bash
git clone https://github.com/galilio2023/yaspro.git
cd yaspro
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Test Suite
The codebase includes an 87-test suite verifying database isolation, payment intents, rate limits, cart pricing, and admin mutations:
```bash
npm test
```
```text
ℹ tests 87
ℹ suites 0
ℹ pass 87
ℹ fail 0
```

### 5. Type Check & Production Build
```bash
npm run typecheck
npm run build
```

---

## 🚢 Deployment

The platform is deployed on **Vercel** with automatic deployment on commit to `main`:
1. Vercel automatically detects the Next.js 16 App Router configuration.
2. In **Project Settings ➔ Environment Variables**, configure all variables from `.env.local`.
3. Neon PostgreSQL handles serverless pooled connections through `@neondatabase/serverless`.

---

## 📄 License & Attribution

Copyright © 2026 **Yas Productions LLC (Dubai, UAE)**. All rights reserved.  
Unauthorized distribution, copying, or modification of this proprietary software is strictly prohibited.
