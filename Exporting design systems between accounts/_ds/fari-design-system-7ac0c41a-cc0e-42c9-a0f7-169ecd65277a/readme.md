# FARI Design System

**FARI — AI for the Common Good Institute, Brussels.**

This repository is the design system for FARI: the brand foundations (color, type, spacing), reusable React UI primitives, foundation specimen cards, and a website UI kit — everything needed to design and build on-brand FARI interfaces and assets.

---

## 1. About FARI

FARI is an **independent research institute on AI, data and robotics focused on the Common Good**. It is jointly initiated by two Brussels universities — **VUB (Vrije Universiteit Brussel)** and **ULB (Université libre de Bruxelles)** — uniting interdisciplinary expertise across **10 research groups** spanning AI, data, robotics, social sciences, ethics and law.

FARI does research and builds bridges with **public administrations, industry and citizens**, promoting sustainable AI with a focus on urban and public-priority domains: **health, mobility, climate & energy, and participatory / inclusive society**. As a Brussels-based institute it is closely tied to the city's urban, institutional and European dimension. FARI has secured **ERDF funding** (European Regional Development Fund) and the Brussels Capital-Region, which carries specific communication/attribution requirements (see §6).

**At its core, FARI stands for purposeful, responsible innovation** — advancing AI, data and robotics for societal benefit, combining scientific rigour with real-world social impact.

### Sources used to build this system
- `uploads/FARI Brand Book.pdf` — the official FARI Brand Guidelines (Introduction, Tone of Voice, Logo, Typography, Colors, Iconography, Imagery). **Primary source for everything here.**
- `uploads/fari logo Fari-AI-for-the-Common-Good-Logo-CMYK-POS (1).jpg` — the full-color primary logo lockup.

> No codebase, Figma file, or live website was provided. The website UI kit is therefore an **interpretation** built from the brand book's foundations and tone, not a recreation of an existing build. Treat its layouts as a faithful starting point, not a pixel match. If a FARI codebase or Figma exists, re-attach it and the kit can be aligned exactly.

---

## 2. Content fundamentals (voice & copy)

FARI's tone of voice **combines accessibility with authority**: clear and approachable, while reflecting its role as a trusted leader in AI, data and robotics research. The voice is **forward-thinking and optimistic, but always grounded in scientific expertise, responsibility and real-world impact.**

**Three registers** (use the one that fits the context; they can blend):
- **Academic** — *"We aim at developing, understanding, and using state-of-the-art technologies."*
- **Ethical** — *"We ensure ethical applicability, acceptability, and relevance of our projects."*
- **Civic** — *"We strive on bridging a gap between the technologies and society."*

**Mechanics & house style:**
- **Person:** Speaks as **"we"** (the institute). Addresses partners/citizens directly as **"you"** in calls to action ("Get involved", "Partner with FARI"). Avoids hype and first-person-singular.
- **Casing:** **Sentence case** for headings and UI labels. The phrase **"Common Good"** is title-cased as a proper concept. Acronyms (AI, VUB, ULB, ERDF) are uppercase.
- **Tone words:** trustworthy, responsible, human-centred, inclusive, rigorous, optimistic, collaborative. Anchor claims in evidence and outcomes.
- **Emoji:** **None.** Not part of the brand. Do not use emoji in FARI communications or UI.
- **Spelling:** British/European English (e.g. *"human-centred", "rigour", "modelling", "programme"*) — FARI is Brussels-based.
- **Signature line:** *"We put the Common Good at the heart of AI, data, and robotics research."*
- **Funding attribution** is mandatory on communications — see §6.

**Vibe:** confident public-interest science. Plain language that a city official, a researcher and a citizen can all follow — never salesy, never academic to the point of exclusion.

---

## 3. Visual foundations

A focused, **trust-forward** system: deep institutional blues, a fresh teal "Lighthouse" accent, clean geometric type, and generous whitespace. (All values live in `tokens/` and ship via `styles.css`.)

### Color
- **Primary:** FARI Blue `#183E91` (deep, institutional), FARI Web Blue `#2E4FBF` (brighter digital blue), FARI Lighthouse Blue `#64D8BF` (teal accent).
- **Secondary:** FARI White `#FFFFFF`, FARI Black `#181716` (warm near-black).
- **Accent:** FARI Purple `#8161CC` — a strategic extension of the blue–green identity. **Reserved for precise moments of emphasis** (CTAs, icons, highlights). Never a default.
- **Status (DEMO ONLY):** Success `#1DA587`, Info/Gathering `#43B7DE`, Error/Not-OK `#B32A2D`. **Never** in official documents (business cards, flyers, certificates) — interface demos only.
- **Gradients:** four brand gradients abstracted from the logos (teal→deep-blue, pale→teal, teal→white, grey-blue→navy) for overlays, backgrounds and fills; two purple **accent** gradients for small emphasis only.
- **Pairing rule:** brand colors are used as **standalone elements** or as **background fields with white typography**. **Do not** cross-combine brand colors as text on a brand-color background — it harms accessibility and coherence.
- **Vibe:** cool, clean, confident. Imagery is bright, warm and human (see §5) — a deliberate counterpoint to the cool UI palette.

### Typography
- **Primary — Montserrat** (geometric sans). Friendly yet professional; used for branding, titles, headings and body. Weights 400–900; headings 700–800, eyebrows 600.
- **Secondary — Open Sans** (demo / long-form only). Comfortable for longer reading in demo materials; not for official brand comms outside demo contexts.
- **Certificate display — "Amsterdam Four"** (bold, urban). Used sparingly for certificates / special deliverables. **Not freely licensable → substituted with _Anton_ here** (`--font-display`). Flag for the user; swap in the real font for production certificates.
- **Scale:** a **1.200 (minor-third) modular ladder** — `41.5 / 28.8 / 24 / 20 / 16.7 / 13.9 / 11.6 px`. Line-height 1.12 for display, 1.5 for body. Tight tracking on large display, wide tracking on all-caps eyebrows.

### Spacing, radii, elevation
- **Spacing:** 4px base unit (4 → 128).
- **Radii:** geometric and gently rounded — 4 / 6 / 10 / 16 / 24 / 32px and a pill (999). Cards use `lg` (16px), buttons use pill.
- **Borders:** 1px hairlines in ink-200/300; 1.5px for interactive fields and outlined controls; 2.5px underline for active tabs.
- **Shadows:** soft and **cool-tinted** — built from FARI Blue at low alpha (`rgba(24,62,145, …)`), never neutral grey or harsh black. Five steps (xs→xl) plus a focus ring.
- **Cards:** white surface, 1px subtle border, `shadow-sm` at rest, `shadow-lg` + 2px lift on hover when interactive; optional 4px gradient top keyline (`accent`).

### Motion & interaction
- **Calm and confident — no bounce.** Standard ease `cubic-bezier(0.4,0,0.2,1)`; durations 120 / 200 / 320ms.
- **Hover:** buttons darken to the next blue and lift 1px; cards lift with deeper shadow; nav items get a blue-50 pill.
- **Press/active:** settle to the darkest blue (`blue-700`); no shrink.
- **Focus:** 2px Web Blue outline / 3px translucent focus ring on fields. Always visible for accessibility.
- **Transparency & blur:** used sparingly — the sticky header uses a translucent white with `backdrop-filter: blur`. Otherwise surfaces are solid.

### Backgrounds & layout
- Predominantly **white / very-light** (`ink-50`) surfaces with **full-bleed brand-gradient panels** for heroes, media and CTAs. No noise, grain or busy textures.
- Generous gutters (40px page padding), max content width ~1280px, 3–4 column grids built with CSS grid + `gap`.
- The brand's **"i" person motif** (teal circle over a rounded stem, from the logo) can be echoed as a simple decorative element in gradient panels.

---

## 4. Iconography

FARI's icon system is **clear, consistent and intuitive** — simple shapes, balanced proportions, neutral and functional, supporting navigation, actions and feedback. The brand book defines a web-icon set: **User, Settings, Search, Notification, File, Image, Link, Eye, Grid, List, Expand, Collapse, Drag, Left/Right/Up/Down/Back, Menu, Info, Warning, Error**, plus a family of **demo weather illustrations** (Sun, Moon, Cloud, Rain, Snow, Frost, etc.) and an **AI Agent** glyph used in demos.

- **Style:** thin, even-stroke **outline** icons (≈2px), geometric, rounded joins — a modern functional set.
- **The actual FARI icon binaries were not provided.** This system substitutes **[Lucide](https://lucide.dev)** (CDN, pinned `0.460.0`) — the closest match in stroke weight and geometric outline style. **Flagged substitution:** replace with FARI's own icon files when available.
- **Usage:** render at 16–24px in `currentColor` (typically FARI Blue or a muted ink); 2px stroke. Load via `<script src="https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js">` then `lucide.createIcons()` (call again after React re-renders). See `guidelines/cards/brand-iconography.html` for the mapping from FARI names → Lucide names.
- **Emoji / unicode as icons:** not used. Stick to the icon set. (A few specimen cards use ▲/▼/✕ as typographic marks — acceptable in dense data UI, not as primary iconography.)

---

## 5. Imagery

FARI's photography captures the institute as a place where **research, technology and society meet** — **bright, modern and human**, favouring **real, documentary moments** over staged scenes. It reflects a community of experts working collaboratively, and treats **Brussels** as an active subject (its diversity, public spaces and European dimension), not just a backdrop. Visuals balance **clarity and warmth**: clean compositions, natural light, people interacting with technology and the city.

Image libraries referenced by the brand: **FARI AI Academy**, **FARI T&EC**, **FARI Services**, **FARI CAVE**. Image rights: © Thierry Geenen / FARI.

> No photography ships with this system. In UI kits and specimens, photo areas use **brand gradient panels** with an explicit "Image placeholder" label. **Ask the user for real FARI photography** to drop in.

---

## 6. Logo & funding compliance

- **Primary logo:** `assets/logos/fari-logo-full-color.jpg` (original CMYK positive). Processed transparent versions: `assets/logos/fari-logo-color.png` (color, for light backgrounds) and `assets/logos/fari-logo-white.png` (reversed, for dark / brand-color backgrounds).
- **Clear space:** keep a minimum margin around the logo (≈ the height of the "i" symbol) free of text/graphics.
- **Don't:** resize parts, rotate, recolor, outline, reverse the lockup, or stretch the logo.
- **Partners:** the FARI logo is placed **side by side with the VUB–ULB logo**. The standalone symbol may be used only at small sizes (favicons, social avatars).
- **ERDF funding attribution** (mandatory on presentations, flyers, posters, website) — include one of:
  - 🇬🇧 "Funded by the ERDF and the Brussels Capital-Region"
  - 🇫🇷 "Financé par le FEDER et la Région de Bruxelles-Capitale."
  - 🇳🇱 "Gefinancierd door het EFRO en het Brussels Hoofdstedelijk Gewest."
  - …with a link to the ERDF website. Include the mandatory logos from the FARI communication kit.

---

## 7. Index / manifest

### Foundations
- `styles.css` — **global entry point** (consumers link this). `@import`s only.
- `tokens/fonts.css` — `@font-face` (Montserrat, Open Sans, Anton→FARI Display). Self-hosted in `assets/fonts/`.
- `tokens/colors.css` — palette, scales, semantic aliases, gradients.
- `tokens/typography.css` — families, weights, modular scale, roles.
- `tokens/spacing.css` — spacing, radii, borders, shadows, motion, layout.
- `tokens/base.css` — light element defaults (body, headings, links, focus).

### Components (`window.FARIDesignSystem_7ac0c4`)
- **Buttons** — `Button`, `IconButton`
- **Forms** — `Input`, `Select`, `Checkbox`, `Switch`
- **Data display** — `Badge`, `Tag`, `Avatar`, `Card`, `Stat`
- **Feedback** — `Alert`
- **Navigation** — `Tabs`

Each component dir holds `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md`, and a `@dsCard` demo HTML.

### UI kit
- `ui_kits/website/` — FARI institute marketing site (Home, Projects, Project detail). See its `README.md`.

### Specimen cards
- `guidelines/cards/*.html` — Colors, Type, Spacing and Brand cards rendered in the Design System tab.

### Assets
- `assets/logos/` — full-color, transparent color, and white-knockout logos.
- `assets/fonts/` — Montserrat, Open Sans, Anton (woff2).

---

## 8. Caveats / substitutions (please review)
1. **Fonts** — Montserrat & Open Sans are exact (Google Fonts). **Amsterdam Four** (certificate display) is **substituted with Anton** — provide the real font for production.
2. **Icons** — FARI's custom icon set is **substituted with Lucide** — provide the real icon files to swap in.
3. **Imagery** — no photography included; gradient placeholders stand in. Provide FARI photos.
4. **Website UI kit** — interpreted from the brand book (no codebase/Figma supplied). Re-attach source to align exactly.
