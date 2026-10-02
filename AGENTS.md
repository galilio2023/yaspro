<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Yas Pro Architecture & UI Layout Rules

## 1. Global Navigation & Footer Anchoring (Strict LTR - No Inversion)
- **Navbar** (`src/components/layout/Navbar.tsx`) and **Footer** (`src/components/layout/Footer.tsx`), including `MobileNavDrawer`, MUST ALWAYS be rendered with `dir="ltr"` and `direction: ltr`.
- Under NO circumstance should toggling between English and Arabic reverse or flip the Navbar or Footer layout.
- The **Brand Logo** (`BrandLogo.tsx`) and its subtitle `AI MEDIA HUB • DUBAI` must ALWAYS remain in physical Left-to-Right orientation on both EN and AR.
- Navigation actions and menus must never jump sides when changing languages.

## 2. Floating Action Button (Always Anchored to the Right)
- The **Floating Action Buttons** (`UnifiedFloatingActions.tsx`, `FloatingCopilotButton.tsx`, and any floating CTA/concierge triggers) MUST ALWAYS be pinned rigidly to the bottom-right corner using physical CSS properties: `right-4 sm:right-6` with `dir="ltr"` and `direction: ltr`.
- DO NOT use Tailwind logical properties like `end-4` or `end-6` on floating button parent containers, as they flip to the left in RTL mode.
- Floating menus, flyouts, and WhatsApp concierge dialogs must remain anchored at `right-0`, opening smoothly from the right side across all toggles and languages.

