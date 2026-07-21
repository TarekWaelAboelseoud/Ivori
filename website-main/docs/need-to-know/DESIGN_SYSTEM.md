# Ivori Digitals — Studio Design System

Source: UI UX Pro Max (luxury ecommerce creative studio) + in-house cinematic tokens.

## Brand
- **Position:** Premium ecommerce growth + creative technology studio (Cairo / MENA)
- **Mood:** Editorial, cinematic, technological, restrained luxury
- **Avoid:** SaaS card grids, infinite marquees, playful colors, emoji icons

## Colors (CSS variables in `app/globals.css`)
| Token | Role |
|-------|------|
| `--void` / `--background` | Page base `#0a0a0a` |
| `--foreground` | Primary text `#f0ece4` |
| `--gold` | Accent / CTA only |
| `--text-body` | Body copy |
| `--text-label` | Section labels |
| `--border` | Dividers |

## Typography
- **Display:** Cormorant Garamond (`--font-display`) — heroes, quotes
- **UI:** Inter (`--font-sans`) — labels, body, nav
- **Arabic:** Noto Sans Arabic (`--font-arabic`) — RTL pages

## Spacing
- Section: `--space-section-sm` → `--space-section-xl`
- Container: `--container-studio` (72rem), `--container-narrow` (64rem)
- Gutter: `--gutter`

## Motion
- Easing: `--ease-out-expo` for reveals
- Duration: `--duration-ui` (280ms) micro, `--duration-reveal` (900ms) sections
- Always respect `prefers-reduced-motion`
- No decorative infinite animation (marquee removed)

## Components (`components/studio/`)
- `SectionShell`, `SectionContainer`, `EditorialHero`, `ChapterLabel`
- `MotionHeading`, `Reveal`, `BentoGallery`, `VisualTile`, `CompareSplit`
- `ImmersiveQuote`, `StudioCTA`, `CaseStudyCard`, `ServicePageLayout`

## Pre-ship checklist
- [ ] Contrast 4.5:1 on body text
- [ ] Focus states visible
- [ ] Hover on all clickables
- [ ] 375 / 768 / 1024 / 1440 tested
- [ ] Reduced motion fallback
- [ ] No raw hex in new code — use tokens
