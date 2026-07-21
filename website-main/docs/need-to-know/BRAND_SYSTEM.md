# Ivori Digitals — Brand & Instagram Content Operating System

**Version:** 1.0 (extracted from production codebase)  
**Source of truth:** `app/globals.css`, `lib/fonts.ts`, `components/studio/*`, `app/admin/admin.css`  
**Last synced:** Production site (`main` branch)  
**Positioning:** Premium ecommerce growth + AI production studio · Cairo · Egypt & MENA  

---

## Brand north star

Ivori Digitals reads as a **cinematic editorial commerce studio** — not a SaaS agency, not a Canva template, not a startup landing page.

| We are | We are not |
|--------|------------|
| Restrained luxury | Loud gradients everywhere |
| Typography-led authority | Card grids & glassmorphism demos |
| Cinematic atmosphere | Fake portfolio / fake metrics |
| MENA-native commerce expertise | Generic “growth hacker” tone |
| One narrative: ad → store → checkout | Disconnected service silos |

**Tagline (site):** Creative technology for commerce.  
**Hero lead (site):** One studio from ad to checkout — built for MENA ecommerce.

---

## 1. Colors

All tokens live in `:root` (`app/globals.css`). **Never invent new hex in content** — map to these tokens.

### 1.1 Core palette

| Token | HEX | RGBA (where defined) | Role | Emotional purpose |
|-------|-----|----------------------|------|-------------------|
| `--void` | `#0a0a0a` | — | Deepest black | Cinematic void, film base |
| `--background` | `#0a0a0a` | — | Page background | Atmospheric black |
| `--surface` | `#0f0e0b` | — | Elevated panels | Warm black (brown undertone) |
| `--surface-elevated` | `#151210` | — | Cards / admin elevated | Subtle lift |
| `--surface-glass` | — | `rgba(15, 14, 11, 0.72)` | Nav on scroll | Frosted editorial bar |
| `--border` | `#1a1814` | — | Section dividers | Barely visible structure |
| `--border-subtle` | `#12100e` | — | Hairline | Ultra-quiet separation |
| `--border-strong` | `#2a2520` | — | Emphasis borders | Pill CTAs, rules |

### 1.2 Text hierarchy

| Token | HEX | Usage |
|-------|-----|--------|
| `--foreground` | `#f0ece4` | Headlines, primary UI |
| `--ivory` | `#f5f2ec` | Selection highlight text, admin ivory |
| `--text-body` | `#b0a8a0` | Body copy, leads |
| `--text-secondary` | `#7a7268` | Secondary copy |
| `--text-label` | `#5a5550` | Captions, chapter labels (muted tone) |
| `--text-dim` | `#4a4540` | Footer meta, scroll hints |
| `--text-faint` | `#3a3530` | Nav inactive |
| `--text-ghost` | `#2a2520` | Micro labels, placeholders |

### 1.3 Gold system (primary accent — use sparingly)

| Token | Value | Usage |
|-------|-------|--------|
| `--gold` | `#c9a96a` | Accent words, icons, underline CTAs, chapter labels (gold tone) |
| `--gold-bright` | `#dfc18a` | Hover states, gradient text highlights |
| `--gold-mid` | `#8a7450` | Border hover on pills |
| `--gold-dark` | `#3d3020` | Deep accent (rare) |
| `--gold-glow` | `rgba(201, 169, 106, 0.12)` | Subtle fills, pill hover bg |
| `--gold-glow-strong` | `rgba(201, 169, 106, 0.22)` | Hero radial blooms, orbs |

**Rule:** Gold = **authority + emphasis**, not decoration. One gold focal point per frame (Instagram) or per viewport section (web).

### 1.4 Atmospheric accents (hero only — never dominate IG static posts)

| Token | Value | Usage |
|-------|-------|--------|
| `--accent-violet` | `rgba(140, 80, 220, 0.55)` | Orb C (site atmosphere) |
| `--accent-blue` | `rgba(50, 100, 210, 0.5)` | Reserved |
| `--accent-amber` | `rgba(190, 150, 80, 0.5)` | Reserved |

### 1.5 Gradients & overlays

| Name | Definition | Usage |
|------|------------|--------|
| `--gradient-hero` | `radial-gradient(ellipse 80% 60% at 70% 35%, var(--gold-glow) 0%, transparent 65%)` | Global ambient |
| `--gradient-vignette` | `radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.65) 100%)` | Hero edge darkening |
| Hero image overlay | `linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 45%, var(--background) 100%)` | CinematicHero (image mode) |
| Abstract hero | `radial-gradient(ellipse 120% 80% at 30% 20%, var(--gold-glow-strong) 0%, transparent 50%), linear-gradient(180deg, #0a0a0a 0%, #0f0e0b 100%)` | AI production page |
| Gold side wash | `radial-gradient(ellipse 70% 55% at 12% 38%, var(--gold-glow-strong) 0%, transparent 52%)` | Hero image mode |
| Signature text gradient | `linear-gradient(180deg, #f0ece4 0%, #c9a96a 100%)` | SignatureGenesis scroll mask |
| Cinematic rule | `linear-gradient(90deg, transparent → border-strong → gold 40% mix → border-strong → transparent)` | Section dividers |
| Scan line | `linear-gradient(90deg, transparent, var(--gold), transparent)` | Decorative motion (site only) |

### 1.6 Shadows & depth

| Token | Value | Usage |
|-------|-------|--------|
| `--shadow-soft` | `0 24px 80px rgba(0, 0, 0, 0.45)` | Hover lift (rare on site) |
| `--shadow-glow` | `0 0 120px var(--gold-glow)` | Combined with soft shadow |
| Instagram equivalent | None / very soft black only | No heavy drop shadows on posts |

### 1.7 Selection & focus

- **Selection:** `color-mix(in srgb, var(--gold) 22%, transparent)` bg, `--ivory` text  
- **Focus ring:** `1px solid color-mix(in srgb, var(--gold) 50%, transparent)`, offset 3px  

### 1.8 Admin palette (`app/admin/admin.css`)

Operational console — same brand DNA, slightly cooler neutrals.

| Token | HEX | Role |
|-------|-----|------|
| `--admin-bg` | `#080808` | Panel background |
| `--admin-surface` | `#0f0f0f` | Cards |
| `--admin-elevated` | `#141414` | Inputs, rows |
| `--admin-border` | `#242220` | Borders |
| `--admin-ivory` | `#f5f2ec` | Primary text |
| `--admin-gold` | `#c9a96a` | Labels, active states |
| `--admin-gold-dim` | `#8a7450` | Secondary gold |
| `--admin-gold-glow` | `rgba(201, 169, 106, 0.12)` | Primary button fill |
| `--admin-muted` | `#6b6560` | Muted copy |
| `--admin-text` | `#c4bcb4` | Body in admin |

*Instagram content should not mimic admin UI — reference for internal “Studio OS” posts only.*

---

## 2. Typography system

### 2.1 Font families (`lib/fonts.ts`)

| Role | Family | CSS variable | Weights | Used for |
|------|--------|--------------|---------|----------|
| Display | **Cormorant Garamond** | `--font-display` | 300, 400, 500 + italic | Heroes, quotes, display headings |
| UI / body | **Inter** | `--font-sans` | 300–600 | Body, nav, labels, forms |
| Arabic | **Noto Sans Arabic** | `--font-arabic` | 300–600 | `/ar` pages, RTL |

**Instagram mapping:**
- **Headlines on posts:** Cormorant Garamond (or Canva closest: Cormorant / Playfair Display — prefer Cormorant)
- **Body / captions UI in graphics:** Inter (or Canva: Inter / Helvetica Now)
- **Arabic carousels:** Noto Sans Arabic

### 2.2 Editorial type scale (fluid)

| Level | CSS class | Size (clamp) | Leading | Tracking | Measure (ch) |
|-------|-----------|--------------|---------|----------|--------------|
| Hero | `.type-hero` | `4rem` → `9.75rem` (ultrawide up to `10.5rem`) | 0.9 | -0.032em | 11 |
| Display | `.type-display` | `2.125rem` → `3.625rem` | 1.02 | -0.022em | 18 |
| Section | `.type-section` | `1.75rem` → `2.625rem` | 1.08 | -0.018em | 22 |
| Title | `.type-title` | `1.3125rem` → `1.875rem` | 1.12 | -0.012em | — |
| Subtitle | `.type-subtitle` | `1.125rem` → `1.4375rem` | 1.2 | -0.008em | — |
| Lead | `.prose-lead` / `.hero-subline` | `1.0625rem` → `1.3125rem` (hero md+) | 1.58–1.62 | 0.012–0.014em | 36–42 |
| Body | `.prose-body` | `1.0625rem` fixed | 1.72 | — | 42 |
| Caption | `.type-caption` | `0.6875rem` (11px) | 1.5 | 0.28em wide, uppercase | — |
| Micro label | ChapterLabel | `0.625rem` (10px) | — | 0.38em (`--tracking-label`) | — |
| Nav / footer | — | `11px` | — | 0.28em / 0.22em | — |

### 2.3 Hierarchy rules (from `MotionHeading` + site usage)

1. **One hero per page** — `size="hero"` + `measure="hero"` (11ch, tight stacks, line breaks intentional).
2. **Chapter openers** — `size="display"` + `measure="display"` (18ch).
3. **In-section headlines** — `size="section"`.
4. **Service blocks / cards** — `type-title`.
5. **Gold emphasis** — `<em className="text-[var(--gold)]">` on one phrase per headline max.
6. **Italic** — ImmersiveQuote display lines; SignatureGenesis gold span.
7. **Balance** — `text-balance` on MotionHeading by default.

### 2.4 Vertical rhythm (`--stack-*`)

| Token | Size | Typical use |
|-------|------|-------------|
| `--stack-2xs` | 0.5rem | Tight label gaps |
| `--stack-xs` | 0.75rem | — |
| `--stack-sm` | 1.25rem | Label → headline |
| `--stack-md` | 2rem | Headline → lead, CTA blocks |
| `--stack-lg` | 3rem | Section internal |
| `--stack-xl` | 4.5rem | Major breaks |

### 2.5 Responsive typography logic

| Breakpoint | Behavior |
|------------|----------|
| `< 640px` | Reduced section spacing; legacy hero clamp fallback |
| `≥ 640px` | Increased gutters & section padding |
| `≥ 768px` | Hero subline scales up |
| `≥ 1280px` | Hero display larger clamp inside `.hero-cinematic` |
| `≥ 1536px` | Container 76rem, gutter 3rem, hero max 10.5rem |
| RTL | Arabic font, letter-spacing 0 on display |

---

## 3. Spacing system

### 3.1 Section padding (`SectionShell`)

| Size | Token | Mobile | ≥640px |
|------|-------|--------|--------|
| sm | `--space-section-sm` | 4.5rem | 5.5rem |
| md | `--space-section-md` | 5.5rem | 7.5rem |
| lg | `--space-section-lg` | 6.5rem | 9.5rem |
| xl | `--space-section-xl` | 7.5rem | 12rem |

**Editorial rhythm:** Large vertical breathing room between chapters. Homepage = chapter labels (01, 02…) + bridges + bordered section tops.

### 3.2 Layout widths

| Token | Value | Usage |
|-------|-------|--------|
| `--container-studio` | 72rem (76rem @1536px) | Default content |
| `--container-narrow` | 64rem | Quotes, philosophy |
| `--gutter` | 1.5rem → 2.5rem (sm) → 3rem (ultrawide) | Horizontal padding |
| `--header-height` | 4.5rem | Fixed nav offset |

### 3.3 Hero spacing

- Min height: `100svh` / `100dvh` (`.hero-cinematic`)
- Grid: 12-col @ lg — title cols 8/7, CTA cols 4/4 offset 9/8
- Safe areas: `env(safe-area-inset-bottom)` on hero footer & mobile CTAs
- Footer strip: `border-t border-white/[0.06]`, py 5–6

### 3.4 Instagram export sizes (for Canva)

| Format | Px | Safe margin |
|--------|-----|-------------|
| Feed square | 1080 × 1080 | 80px |
| Feed portrait | 1080 × 1350 | 80px sides, 100 top/bottom |
| Carousel slide | 1080 × 1350 | Same |
| Reel cover | 1080 × 1920 | 120 top/bottom (UI overlap) |
| Story | 1080 × 1920 | 120 top/bottom |

Use **gutter logic:** ~7.5% horizontal inset ≈ `--gutter` proportion on 1080px → **80px**.

---

## 4. Visual language

### 4.1 What defines Ivori visually

1. **Atmospheric black** — warm undertone (`#0f0e0b`), not pure OLED gray.
2. **Cinematic gold bloom** — soft radial light, never flat yellow.
3. **Film grain** — global `studio-grain` at opacity `0.045`, overlay blend.
4. **Editorial serif dominance** — display type carries emotion; sans carries explanation.
5. **Negative space** — sections breathe; no dense card grids on public site.
6. **Restrained motion** — fade-up, blur dissolve, slow Ken Burns on hero stills only.
7. **Typography-led AI production** — abstract gradients, no fake product campaigns.

### 4.2 Atmosphere layers (stack order)

1. Base background `#0a0a0a`
2. Optional cinematic still (opacity ~0.9, Ken Burns 24s)
3. Linear + radial overlays (darkening + gold wash)
4. `HeroAtmosphere` orbs (gold A/B, faint violet C)
5. Content (z-10)
6. Vignette on `.hero-cinematic::after` (opacity 0.4)
7. Global `Atmosphere` grain + fixed ambient orbs (low opacity)

### 4.3 Lighting rules

- **Key light:** Top-right or center-high gold radial (matches `--gradient-hero` at 70% 35%).
- **Fill:** Low opacity warm body on `#0f0e0b`.
- **No** harsh white spotlights or neon.
- **Image heroes:** 55% black overlay + gold side wash at 12% 38%.

### 4.4 Grain

- SVG fractal noise data-URI, `mix-blend-mode: overlay`, opacity `0.045`.
- **Instagram:** Optional 3–5% noise overlay in Canva — subtle.

### 4.5 Glow systems

- Orbs: `filter: blur(80px)`, `glow-drift` 12–18s infinite.
- Never sharp-edged glow circles in static posts.

### 4.6 Motion direction (website → reel translation)

| Site motion | Duration / easing | Reel / carousel translation |
|-------------|-------------------|-----------------------------|
| `fadeUp` + blur | 900–1100ms, `--ease-out-expo` | Slow title reveal (0.8–1.2s) |
| `heroKenBurns` | 24s alternate | Slow push-in on b-roll |
| `glow-drift` | 12–14s | Gentle light shift on gradient bg |
| `chapterPulse` | 12s opacity | Subtle pulse on bridge slide |
| Scroll reveal | 900ms | N/A — use slide transitions instead |
| Page view transition | 350–450ms blur fade | Hard cut or 0.3s crossfade between slides |

**Always honor:** `prefers-reduced-motion` → static frames for accessibility.

### 4.7 Composition patterns

| Pattern | Component | Description |
|---------|-----------|-------------|
| Cinematic hero | `CinematicHero` | Full viewport, 12-col grid, underline CTA |
| Chapter label | `ChapterLabel` | Micro chapter + gold/muted kicker |
| Chapter bridge | `ChapterBridge` | Border-y pause, ambient bg |
| Editorial contrast | `EditorialContrast` | Before/after, no bordered cards |
| Immersive quote | `ImmersiveQuote` | Display italic, prose-lead body |
| Signature scroll | `SignatureGenesis` | Pinned still + text clip reveal |
| Stat row | `StatRow` | 2×2 / 4-col, gold values, caption labels |
| Editorial atmosphere | `EditorialAtmosphere` | Typography-only production block |
| Service grid | `ServicePageLayout` | Spaced articles, no gap-px borders |

### 4.8 Editorial principles (from live copy)

- **One narrative:** Ad → landing → checkout must align (EditorialContrast).
- **Capability over proof:** No fake client grids; principles = discipline count, Cairo, in-house, conversion.
- **Ship work, not decks:** Philosophy quote tone.
- **MENA-native:** Payment clarity, mobile buyers, regional market — not generic “global brand” fluff.

---

## 5. Component language

### 5.1 CTAs

| Style | Class / component | Look | When |
|-------|-------------------|------|------|
| Primary underline | `.studio-cta-primary` | 14px medium, gold underline on hover | Hero main action |
| Ghost text | `.studio-cta-ghost` | 14px, body color → foreground hover | Secondary hero |
| Gold text link | `StudioCTA` text | 14px gold + arrow nudge | In-content links |
| Pill | `StudioCTA` pill | Rounded-full, border-strong, 11px tracked | Closing CTAs |

**Hover:** Arrow `translate` (-0.5px y, +0.5px x), color → `--gold-bright` or `--foreground`.  
**Touch:** Min height 44px on interactive elements.

### 5.2 Links

- `.studio-link` — gold underline scaleX animation from left.
- Footer/nav — opacity/color transition only, 11px tracked.

### 5.3 Transitions

| Token | Value |
|-------|-------|
| `--duration-fast` | 150ms |
| `--duration-ui` | 280ms |
| `--duration-reveal` | 900ms |
| `--duration-hero` | 1100ms |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--ease-in-out` | `cubic-bezier(0.45, 0, 0.55, 1)` |

### 5.4 Cards

**Public site:** No glass cards, no bordered grid cells (removed intentionally). Content sits on background with spacing only.

### 5.5 Section structure

```
SectionShell (padding + optional border-top)
  └ SectionContainer (max-width + gutter)
       └ ChapterLabel → MotionHeading → prose-lead / prose-body
```

### 5.6 Narrative flow (homepage model)

1. Hero (01) — promise  
2. Problem (02) — fracture  
3. Contrast — before/after  
4. Bridge — capabilities intro  
5. Systems — service groups  
6. Production — AI block  
7. Process — steps  
8. Signature — cinematic moment  
9. Philosophy — quote  
10. Close — CTA + email  

**Instagram series:** Mirror this arc across weekly themes, not every post.

---

## 6. Instagram translation rules

### 6.1 Post composition style

- **Background:** `#0a0a0a` or `#0f0e0b` — never white, rarely mid-gray.
- **Layout:** 60–70% negative space; text anchored left or bottom-left (RTL: mirror).
- **One focal hierarchy:** Micro label → display line → optional lead (max 2 lines body).
- **Gold:** One phrase or one thin rule — not full gold backgrounds.
- **No:** Stock “agency team”, fake logos wall, dashboard screenshots as hero art.

### 6.2 Typography hierarchy (feed)

| Level | Font | Size @1080 | Weight |
|-------|------|------------|--------|
| Kicker | Inter | 22–24px, uppercase, tracked | 600 |
| Headline | Cormorant | 72–120px depending on format | 400 |
| Gold accent | Cormorant italic | Same line | 400 italic, `#c9a96a` |
| Body | Inter | 32–36px | 300 |
| Footer / CTA | Inter | 24–28px tracked | 500 |

### 6.3 Carousel rhythm

1. **Slide 1:** Hook — display headline only + kicker.  
2. **Slides 2–4:** One idea per slide, `type-section` scale.  
3. **Slide 5:** Summary line + soft CTA (“Start a project” / “Link in bio”).  
4. **Transitions:** Same bg; animate gold rule or opacity — no slide templates with colorful shapes.

### 6.4 Reel visual direction

- Dark grade, warm shadows, gold light leak on edges (15% opacity max).
- Typography overlays: max 6 words on screen at once.
- B-roll: abstract gradients, screen recordings of *real* Shopify/UI (blurred if needed), Cairo texture — not fake Nike ads.
- Pace: Slow cuts (2.5–4s), not 0.5s hype cuts.

### 6.5 Caption tone

- **Voice:** Calm authority, editorial, direct. Cairo studio speaking to MENA founders.
- **Structure:** Hook line → 2–4 short paragraphs → one clear takeaway → soft CTA.
- **Avoid:** “🚀 scale your brand”, “game-changer”, “10x”, emoji chains, hashtag spam.
- **Prefer:** Complete sentences, commerce vocabulary (CRO, checkout, message match, SKU, MENA payments).
- **Languages:** English primary; Arabic posts mirror meaning, not word-for-word Google translate.

### 6.6 Visual pacing

- **Feed:** 3–4 high-quality posts/week max; silence > noise.
- **Stories:** Process, behind-the-scenes tools (Cursor, Canva), poll on commerce opinions — still dark UI.

### 6.7 Luxury rules

- Restraint beats decoration.
- Serif + space = premium; sans + density = startup.
- Never more than 2 font sizes in one slide (excluding kicker).

### 6.8 Negative space

- Minimum 40% empty frame on quote posts.
- Bottom 120px clear on Reels for captions UI.

### 6.9 Cinematic atmosphere (static)

- Radial gold at 30% 20% fading to black.
- Optional grain 4%.
- Vignette corners 65% black at edges.

---

## 7. Content pillars (15)

| # | Pillar | Objective | Tone | Visual direction | Type scale | Format | CTA |
|---|--------|-----------|------|------------------|------------|--------|-----|
| 1 | **Editorial quote** | Brand belief | Poetic, firm | Black + display italic + gold word | Display | Single / story | Link in bio |
| 2 | **Commerce insight** | Educate founders | Analytical, clear | Text-led, one stat max (real) | Section + body | Carousel | Save |
| 3 | **MENA ecommerce POV** | Regional authority | Local, specific | Map optional — abstract only | Display | Carousel / reel | DM |
| 4 | **CRO fracture** | Problem awareness | Sharp, empathetic | Before/after copy split (no fake UI) | Contrast layout | Carousel | Read caption |
| 5 | **Message match** | Ad → LP alignment | Direct | Two-line comparison | Caption labels | Carousel | — |
| 6 | **AI production infrastructure** | Service depth | Technical-creative | Abstract gradient, no product shots | Display | Reel / carousel | ai-production page |
| 7 | **Motion direction** | Show taste | Minimal | Screen cap of site motion, slow | — | Reel | Follow |
| 8 | **Studio process** | Trust via method | Calm | Numbered steps 01–04 | Micro + section | Carousel | Contact |
| 9 | **Operational systems** | Maturity signal | Operator voice | Checklist aesthetic, no SaaS UI | Title + body | Carousel | — |
| 10 | **Visual philosophy** | Brand depth | Manifesto | Full bleed type | Hero scale | Single | — |
| 11 | **Commerce psychology** | Thought leadership | Evidence-based | One insight per slide | Body forward | Carousel | Save |
| 12 | **Shopify / stack** | Service relevance | Practical | Code/shopify wordmark minimal | Title | Single / story | — |
| 13 | **Media buying discipline** | Performance creative | ROI-focused | Typographic “ad → store” | Display | Carousel | — |
| 14 | **Founder perspective** | Human trust | First person plural | Portrait optional — dark, high grain | Lead | Story / reel | — |
| 15 | **Quiet CTA** | Convert interest | Understated | “Start a project” + email | Pill style | Story / last slide | Contact |

---

## 8. Canva system (zero-cost production)

### 8.1 Brand kit setup (once)

**Colors (add as brand kit):**
- Void Black `#0A0A0A`
- Surface `#0F0E0B`
- Ivory `#F5F2EC`
- Foreground `#F0ECE4`
- Body Gray `#B0A8A0`
- Gold `#C9A96A`
- Gold Bright `#DFC18A`

**Fonts:**
- Cormorant Garamond — headings
- Inter — body / labels

### 8.2 Master templates (create 6)

| Template name | Size | Layers (bottom → top) |
|---------------|------|------------------------|
| IVORI — Quote Single | 1080×1350 | BG #0a0a0a → radial gold blob 30% opacity → grain → kicker → headline → optional rule |
| IVORI — Carousel Interior | 1080×1350 | Same BG → slide number micro → section headline → body |
| IVORI — Carousel Cover | 1080×1350 | Stronger gold bloom → hero-scale headline |
| IVORI — Reel Cover | 1080×1920 | Title upper third, safe zone bottom |
| IVORI — Story CTA | 1080×1920 | Pill button style border `#2a2520` |
| IVORI — Arabic RTL | 1080×1350 | Noto Sans Arabic, align right |

### 8.3 Fixed spacing in Canva

- Margins: 80px L/R (1080 canvas)
- Kicker → headline: 32px
- Headline → body: 48px
- Bottom CTA zone: 120px from bottom

### 8.4 Reusable gradient (Canva)

- Radial, gold `#C9A96A` at 20% opacity, position top-right, stretch 150%, blur 80px behind all text.

### 8.5 Export checklist

- PNG for carousels (sharp text)
- MP4 reels from Canva or CapCut (free)
- No Canva default colorful shadows or 3D text effects

---

## 9. AI prompt system

### 9.1 Master context block (paste into ChatGPT / Claude every session)

```
You are the content strategist for Ivori Digitals, a premium ecommerce growth and AI production studio in Cairo serving Egypt & MENA.

Brand voice: cinematic, editorial, restrained luxury. Never startup hype, fake case studies, or agency clichés.

Visual system: background #0A0A0A, text #F0ECE4, body #B0A8A0, accent gold #C9A96A only for emphasis. Display font Cormorant Garamond, body Inter. Generous negative space. No card grids, no glassmorphism, no emoji spam.

Services: CRO, AI production, Shopify, media buying — one narrative from ad to checkout.

Audience: MENA ecommerce founders and marketing leads who care about conversion, not vanity metrics.
```

### 9.2 Carousel copy prompt

```
Using the Ivori Digitals brand context, write a 5-slide Instagram carousel.

Pillar: [PILLAR NAME]
Topic: [TOPIC]
Slides: 
1) Hook headline only (max 8 words)
2-4) One insight per slide (headline + 1 sentence)
5) Closing line + soft CTA

Tone: editorial, calm authority. Include micro-label text for slide 1 (uppercase, tracked).
```

### 9.3 Caption prompt

```
Write an Instagram caption for Ivori Digitals.

Post type: [carousel / reel / single]
Topic: [TOPIC]
Length: 120–180 words
Structure: hook → insight → takeaway → CTA (link in bio / DM)
No hashtags except optional 3 at end: #ecommerce #MENA #CRO
```

### 9.4 Reel script prompt

```
Write a 30-second reel script for Ivori Digitals.

Visual notes: dark grade, slow cuts, typography overlays max 6 words on screen.
Sections: hook (0-3s) → problem (3-12s) → insight (12-24s) → CTA (24-30s)
No fake client names or results.
```

### 9.5 Hook bank prompt

```
Generate 10 Instagram hook lines for Ivori Digitals on [TOPIC].
Rules: max 8 words each, display-headline tone, no clichés, commerce-specific.
```

### 9.6 Image generation prompt (for AI image tools — abstract only)

```
Abstract cinematic background for luxury commerce studio, warm black #0a0a0a, soft gold radial light top right, subtle film grain, no products, no people, no text, editorial atmosphere, 4:5 aspect ratio
```

### 9.7 Canva assembly prompt (for Claude)

```
Given this carousel copy [PASTE], list exact text per slide with font role (kicker/headline/body), hex colors, and alignment for Canva template IVORI — Carousel.
```

---

## 10. Content operating system (zero-cost stack)

**Tools only:** ChatGPT · Claude · Cursor · Canva · (optional CapCut for reel trim)

### 10.1 Folder structure (Google Drive or local)

```
/content-system
  /ivori-brand-system.md     ← this file
  /calendar
    2026-Q2.md
  /drafts
    /carousel
    /reels
    /captions
  /exports
    /feed
    /reels
  /prompts
    master-context.txt
```

### 10.2 Weekly workflow

| Step | Tool | Action |
|------|------|--------|
| 1. Ideation | ChatGPT / Claude | Pick 2 pillars from §7; generate 5 hooks |
| 2. Selection | You | Choose 1 carousel + 1 single or reel |
| 3. Copy | Claude | Run carousel + caption prompts (§9) |
| 4. Visual direction | Claude | Output per-slide type hierarchy for Canva |
| 5. Design | Canva | Duplicate template; paste text; export PNG |
| 6. Reel (optional) | Canva + CapCut | Gradient bg + text overlays + site screen recording |
| 7. Caption polish | ChatGPT | Shorten to voice; add CTA |
| 8. Schedule | Instagram app | Manual post (no paid scheduler required) |
| 9. Archive | Drive | Save exports + final caption in `/drafts` |
| 10. Iterate | Cursor | Update `lib/content` or this doc if brand evolves |

### 10.3 Content calendar template

| Week | Mon | Wed | Fri | Pillar |
|------|-----|-----|-----|--------|
| W1 | Quote single | CRO carousel | Reel: process | 1, 4, 8 |
| W2 | MENA insight | AI production | Story CTA | 3, 6, 15 |
| W3 | Commerce psych | Shopify tip | Quote | 11, 12, 1 |

*Adjust frequency to sustainable — quality > volume.*

### 10.4 Quality gate (before publish)

- [ ] Background is void black family, not gray or white  
- [ ] Only one gold emphasis per slide  
- [ ] Cormorant + Inter only (or Arabic Noto on AR posts)  
- [ ] No fake clients, stats, or dashboards as hero  
- [ ] Caption sounds like site copy, not generic agency  
- [ ] CTA matches site: Start a project / link in bio / hello@ivoridigitals.com  
- [ ] 80px side margins on 1080 designs  

### 10.5 Cursor’s role

- Keep this document synced when `globals.css` or studio components change.
- Do **not** use Cursor to generate random posts — use it to diff brand tokens and update prompts.

---

## Appendix A — Component → Instagram map

| Site component | Instagram equivalent |
|----------------|---------------------|
| `CinematicHero` | Carousel cover / reel opening frame |
| `ChapterLabel` | Kicker line (10px uppercase gold) |
| `MotionHeading` hero | Slide 1 headline |
| `EditorialContrast` | Split carousel (before/after text) |
| `ImmersiveQuote` | Single quote post |
| `StatRow` | One number per slide (never fake %) |
| `StudioCTA` pill | Final story slide |
| `SignatureGenesis` | Reel b-roll + text reveal style |

## Appendix B — Code references

| Asset | Path |
|-------|------|
| Design tokens | `app/globals.css` |
| Fonts | `lib/fonts.ts` |
| Hero | `components/studio/CinematicHero.tsx` |
| Type component | `components/studio/MotionHeading.tsx` |
| Atmosphere | `components/studio/Atmosphere.tsx`, `HeroAtmosphere.tsx` |
| Admin tokens | `app/admin/admin.css` |
| Site config / voice | `lib/seo/site.ts` |
| Principles copy | `lib/content/studio-principles.ts` |

## Appendix C — Do not use (removed from site intentionally)

- Bento grids, glass cards, gap-px bordered service cells  
- Fake campaign imagery, showreel product shots  
- Portfolio walls, fabricated metrics  
- Infinite marquees, playful stickers, emoji icons in brand graphics  

---

*This document is the single source of truth for Ivori Digitals Instagram content until the next codebase brand sync.*
