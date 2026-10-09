---
name: yaspro-craft
description: Design, motion, and visual identity standards for Yaspro. Enforces human-crafted cinematic studio aesthetics, tactile spring physics, and eliminates generic "AI template" tropes.
---

# Yaspro Human-Craft Design & Kinetic Motion System

## 1. Core Philosophy: Cinematic Production House vs. AI Template
Yaspro is a premier media production, virtual soundstage, gear rental, and creative talent ecosystem. It is NOT a generic B2B SaaS or crypto tool. 

The visual and motion experience must feel like **A24, Sony Cine, RED Digital Cinema, or an Apple Keynote**:
- **Authoritative, tactile, physical, and atmospheric.**
- **Human-crafted**: intentional asymmetric layouts, high-contrast editorial typography, real-world camera metadata, and natural spring physics.

---

## 2. Strictly Banned "AI Aesthetic" Tropes (DO NOT USE)
1. **NO "Cyber-Purple" / Neon Cyan Rainbows**:
   - ❌ BANNED: `bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-400` on headlines, borders, or buttons.
   - ❌ BANNED: Neon glowing radial backdrops (`blur-3xl bg-purple-600/30`).
2. **NO Magic Glitter / Sparkle Particles**:
   - ❌ BANNED: `<HeroSparkles />`, floating canvas stars, or twinkling particle dust.
   - Real film sets have directional key lights, anamorphic flares, and haze/smoke—not fairy dust.
3. **NO Synthetic Shimmer Borders & Border Beams**:
   - ❌ BANNED: Orbiting neon beams, `shimmer-slide`, and spinning rainbow borders around cards.
4. **NO Monotonous "Bento Box" Clones**:
   - ❌ BANNED: 6 identical rounded rectangles with `bg-card border-white/10` and an icon inside a pill.
5. **NO Lifeless Linear Fades**:
   - ❌ BANNED: CSS `transition: all 0.3s ease` or uniform `opacity: 0, y: 20` scroll reveals with identical timings.

---

## 3. The Color & Atmosphere Foundation
- **Base Surfaces**:
  - `bg-background`: Deep obsidian `#070709` (a rich, cinematic charcoal-black with real depth, not a synthetic flat `#000000`).
  - `bg-surface-raised`: Studio Slate `#111115` with subtle warm undertones.
  - `border-subtle`: Optical razor borders `rgba(255, 255, 255, 0.08)` to define structure cleanly without glowing.
- **Accents & Light (Studio Mauve & Deep Violet)**:
  - **Studio Mauve** (`#987ba5` / `rgba(152, 123, 165, ...)`): Primary brand accent for active indicators, border beams, pricing typography, badges, and focus rings.
  - **Rich Violet** (`#765086` / `rgba(118, 80, 134, ...)`): Mid-tone for atmospheric lighting and depth.
  - **Deep Violet** (`#542568` / `rgba(84, 37, 104, ...)`): Base shadow core for card glows and ambient key lights (`shadow-brand-violet`, `bg-brand-violet`).
  - **Lavender** (`#ddd3e1`): Subtle chrome text gradients and badge borders.
  - **NO Amber/Yellow Shadows**: All shadows, glows, border beams (`BorderBeam`), and soundstage atmospheric lights must use Mauve & Purple. Legacy amber (`#f59e0b`) shadows are strictly forbidden.
  - **Anamorphic Silver / Platinum** (`#e2e8f0` / `#ffffff`): Razor-sharp text and chrome hardware accents.
  - **Studio Red Tally** (`#ef4444`): Strictly reserved for live indicators, recording dots (`REC ●`), and urgent telemetry.
- **Analog Texture**:
  - Micro film-grain texture overlay (CSS SVG noise or fine grain) to eliminate flat digital banding and give screens physical paper/celluloid realism.

---

## 4. Typography & Studio Metadata
- **Editorial Headlines**:
  - High-impact scale contrast. Bold, confident, letter-spaced headers (`tracking-tight`, text-balance).
  - Clean white headers (`text-white` or `text-zinc-100`) without synthetic rainbow text fills.
- **Authentic Production Metadata**:
  - Ground the interface in real studio craft using clean monospace or condensed badges:
    `[REC ● 4K UHD 24FPS]`, `[STAGE 04 - CYC WALL]`, `[ISO 800 | 5600K]`, `[PRODUCTION BRIEF]`.

---

## 5. Kinetic Motion & Spring Physics (Framer Motion)
Everything interactive must obey laws of physical mass, inertia, and spring tension.

### Spring Presets
```ts
export const studioSprings = {
  // Snappy for buttons, micro-toggles, active tab sliders
  snappy: { type: "spring", stiffness: 450, damping: 28 },
  // Smooth & cinematic for drawers, hero cards, modals
  cinematic: { type: "spring", stiffness: 260, damping: 32 },
  // Heavy for large hero reveals, image expansions
  heavy: { type: "spring", stiffness: 180, damping: 26 },
};
```

### Motion Behaviors
1. **Tactile Button Press**:
   - Always depress on tap/click: `whileTap={{ scale: 0.97 }}`
   - Hover state: `whileHover={{ y: -2 }}` with subtle shadow elevation.
2. **Magnetic Cursor Attraction**:
   - Primary action buttons and play triggers subtly follow the cursor vector within their bounding box.
3. **Staggered Narrative Reveals**:
   - Content reveals sequentially with spring dynamics (e.g. Eyebrow -> Title -> Reel -> CTAs).

---

## 6. Components Standard
- **Buttons**:
  - Solid titanium/white pill with crisp dark typography (`bg-white text-black font-semibold hover:bg-zinc-200`) OR deep studio slate with subtle razor outline (`bg-zinc-900 border border-zinc-700/60 text-white hover:border-zinc-500`).
  - No purple neon glows.
- **Cards**:
  - Asymmetric heights, cinematic aspect ratios (16:9, 2.39:1, 4:5 vertical poster).
  - Real footage / photo focal points with directional vignette shadows.
- **RTL & Layout Invariance Rules (Strict)**:
  - **Full Arabic and English support**: Content and editorial body copy use bi-directional flow.
  - **Navbar & Footer Invariance**: Under NO circumstance should toggling languages flip or reverse `Navbar`, `Footer`, `MobileNavDrawer`, or `BrandLogo`. They must ALWAYS stay strictly anchored in physical `dir="ltr"` so branding, logos, and actions never mirror.
  - **Floating Action Buttons**: The floating action buttons (`UnifiedFloatingActions`, `FloatingCopilotButton`, WhatsApp concierge) MUST ALWAYS remain anchored at physical `right-4 sm:right-6` (`right-0` for flyouts) with `dir="ltr"`. Never use `end-4` or `end-6` on floating button shells, which would flip them to the left side in Arabic.
  - Strict WCAG 2.1 AA text contrast on all dark surfaces.
## 7. Brand Geometry & Loader / Favicon Standards
- **Wordmark `A` Delta Glyph**: The letter `A` in `YASPRO` is an authentic geometric delta triangle (`▲`) with rounded apex corners and horizontal base line (refer to Section 2.2 of brand guidelines and vector path in `src/components/ui/yasprVectorPath.ts`). Never replace it with generic font glyphs.
- **Global App Loader (`GlobalPageLoader.tsx`, `YasproAnimatedLoader.tsx`)**:
  - Uses pure CSS GPU keyframes (`animation-fill-mode: both`) for letter unmasking to eliminate SSR hydration lag and flash of unmasked text.
  - Entrance duration is calibrated to 2.2s on initial app initialize/refresh with subtle organic breathing before smooth exit easing (`0.38s`).
- **Loader Aperture `[O]` Shadow & Ambient Glow Standards**:
  - The rolling aperture `[O]` in `YasproAnimatedLoader.tsx` must cast a dual-layered kinetic **Studio Mauve & Violet** halo (`bg-brand-mauve/35 blur-xl` inner bloom and `bg-brand-violet/30 blur-2xl` outer aura).
  - Aperture inner core rings are rendered in Studio Mauve (`rgba(152, 123, 165, 0.4)` stroke, `rgba(152, 123, 165, 0.2)` fill).
  - Background ambient light must use Studio Mauve (`bg-brand-mauve/20 blur-[100px]`).
  - **NO Yellow / Amber Shadows**: Never cast yellow or amber drop-shadows or glows behind the `[O]`.
  - Only the single `#FFE900` accent blade on the iris is golden yellow as specified by authentic brand geometry.
- **Favicon & Brand Icon Suite (`[O]` Aperture)**:
  - Replicates the circular camera aperture `[O]` with dark obsidian blades, crisp seams, and glowing golden yellow blade (`#FFE900`).
  - Outside the aperture circle, the canvas MUST ALWAYS have true alpha transparency `RGBA(0, 0, 0, 0)` across all icon formats (`.ico`, `.svg`, `.png`). Never permit white corners or opaque bounding boxes.

