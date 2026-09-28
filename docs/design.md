# design.md — Nó Made Project

> Source of truth for the website's look, feel and behavior. Build from this file.
> Items in [BRACKETS] are placeholders to be replaced when the final visual identity arrives.
> Hex values are estimated by eye from the reference screenshot, not sampled. Replace with the real identity later.

---

## 1. Project

**Nó Made Project**: small-group guided nature experiences in the PACA region (France). Walks, screen-free half-days, and "Reconnex" parent/teen formats. A partner qualified educator leads any physical-exercise or mobility content.

**Site goal (v1):** showcase + "request a session" flow. No public calendar and no online payment yet. Sessions are scheduled case by case after contact.
**Later (keep the architecture ready):** dated sessions with capacity, live availability, Stripe Checkout.

**Language:** French only for now, informal "tu" everywhere. i18n-ready.

---

## 2. Voice and copy

- Informal "tu", short sentences, warm and direct.
- No wellness jargon ("énergie", "alignement", "lâcher-prise" and similar). Concrete words: marcher, respirer, poser son téléphone, parler.
- Present sessions as guided walks and nature/connection experiences.
- Mobility or physical exercise may only be described as part of a session when it is led by the qualified partner educator, who is named on the site.
- No invented numbers, no fake testimonials, no "trusted by" logos. Use real facts only (duration, group size, price, area).
- Main CTA label: **"Demander une session"**.

---

## 3. Visual direction

**Reference:** the attached green nature-NGO homepage screenshot. Recreate its style, not its content (no name, logo, photos or copy).

- Light, airy, modern. Off-white page, white cards with hairline borders, very large rounded corners.
- Photo/video-led. Lots of whitespace. One highlighted word per headline.
- Calm and minimal, warm and human. No terracotta for now.

### Colors (CSS variables, all swappable)

| Token | Value (estimate) | Use |
|---|---|---|
| `--bg` | `#F7F6F2` | page background |
| `--surface` | `#FFFFFF` | cards |
| `--ink` | `#141414` | headlines, main text |
| `--muted` | `#6F6F6F` | secondary text |
| `--moss` | `#4F6B3A` | primary buttons, highlighted headline word, icons |
| `--moss-dark` | `#3A5229` | hover/pressed |
| `--lime` | `#D6EC6E` | single accent: top-right nav CTA, one highlight card |
| `--line` | `rgba(20,20,20,.08)` | hairline borders |

Check WCAG AA contrast, especially white text on moss and dark text on lime.

### Typography

- Headlines: **Instrument Serif**, regular weight, large, tight line-height (~1.05), slight negative letter-spacing. One word highlighted in `--moss`.
- Body/UI: **Inter** (400/500/600).
- Small pill "eyebrow" labels above section titles.
- Fluid sizes with `clamp()`.

### Shape and spacing

- Cards: radius 24–32px, white, 1px `--line` border, very soft shadow at most.
- Buttons and pills: fully rounded.
- Generous vertical rhythm. Max content width ~1200px, side padding `clamp(1.25rem, 4vw, 3.6rem)`.

---

## 4. Hero (most important part)

Full-viewport hero with a **looping background video** and minimal overlaid text.

**Composition**
- Video: a still, locked-off Mediterranean hillside at dawn (cork oak, umbrella pines, cistus, broom, an empty trail, morning mist). Pale off-white sky in the top ~40% so the headline sits on clean space.
- Headline (Instrument Serif, centered, top-anchored, not vertically centered): [SLOGAN] with one word in `--moss`.
- Subtitle: one or two lines.
- One primary button: "Demander une session".
- Below the fold of the hero: 4 fact tiles (real facts only), e.g. `2h30` / `3 à 5 personnes` / `dès 30 €` / `PACA`.
- Nav in normal flow above the headline, z-index above any mobile menu overlay.

**Video assets**
- `hero.mp4`: 1080p, 16:9, ~8 s, H.264, **no audio**, compressed to about 2–4 MB.
- `hero-poster.webp`: first frame, used as the instant first paint and as the blurred backdrop on portrait mobile.
- The clip does not loop natively. Loop it with a ~1 s crossfade (two stacked video elements, or fade opacity near the end). No visible jump.
- Video starts at opacity 0 and fades in (~1.2 s) once it has frames, so the poster carries the first paint.
- `autoplay muted loop playsinline preload="auto"`, `aria-hidden="true"`. Poster `<img>` carries the alt text.
- The pale sky must blend into `--bg`: add a soft off-white gradient overlay at the top and at the bottom of the hero.

**Mobile**
- Portrait: bottom-anchor the media at ~64svh with a feathered top edge over a blurred poster backdrop, so the open-sky composition survives.
- Simpler effects than desktop, never the same effects 1:1.

---

## 5. Motion

Principle: calm, purposeful, cheap. One idea per screen. Never hide content behind an animation.

**Entrance (on load)**
- Media plate: slow fade-in with slight scale/blur settle.
- Nav items: staggered rise (small translateY, ~0.95 s, ease-out expo-like).
- Headline lines: rise out of a mask (`overflow:hidden` line wrapper), second line slightly later.
- Button and fact tiles: soft fade-rise after the headline.

**Scroll**
- Hero only, one light effect: gentle parallax of the media (small translate/scale) plus fade of the hero content as the user scrolls. Desktop: full. Mobile: reduced or off if it costs performance.
- Below the hero: simple fade-rise reveals via IntersectionObserver, once per element.
- No pinned sections, no scrollytelling, no heavy scroll libraries.

**Rules**
- `prefers-reduced-motion: reduce`: no entrance animation, no parallax, poster image only (no video), all content visible.
- Animate `transform` and `opacity` only. No layout-shifting animation.
- Keyboard navigation and screen readers must never depend on scroll-triggered visibility.

---

## 6. Components

- **Nav:** logo wordmark left ("Nó Made", keep the ó accent), links centered on desktop (Accueil, Offres, À propos, Contact), pill CTA on the right in `--lime`. Mobile: burger opening a full-screen overlay with large serif links and the CTA.
- **Photo cards:** tall, very rounded, image with dark gradient at the bottom, small round icon, title, one line of text.
- **Offer cards:** category pill, duration, group size, price, who it's for, what to bring, "Demander cette session" button.
- **Highlight card:** lime card used once, teasing the contact form (no newsletter).
- **Fact tiles:** small white cards, big number/word, small label.
- **Buttons:** primary = `--moss` bg, white text. Secondary = white with hairline border. Hover: slight lift.
- **Footer:** 4 columns (Explorer, Infos pratiques, Légal, Suivre), tiny copyright.

---

## 7. Pages

1. **Accueil:** hero, the two offers, how it works, 3 pillar photo cards (marche en nature, coopération, Reconnex parents/ados), highlight card, testimonials placeholder (commented out until real ones exist).
2. **Offres:** one card per session with all practical info.
3. **À propos:** my story (10 years of autonomous travel, BJJ, climbing, boxing, physical preparation, 15 years in hospitality, taste for transmission) plus the partner educator: [NAME], [DIPLOMA], [PROFESSIONAL CARD NUMBER].
4. **Contact / Demande de session:** form (name, email, phone, offer of interest, group size, preferred dates/availability, message) that notifies me by email. FAQ. Area: PACA.
5. **Légal:** mentions légales, CGV (cancellation/refund), politique de confidentialité (RGPD).

---

## 8. Offers (test phase, prices may change)

- **Reconnex nature:** 2h30, 3 to 5 people, €30 per person.
- **Demi-journée hors écran:** 3h outdoors, walking + cooperation exercises + mobility + exchange. €60 for a father/son pair, €80 for 4 people.

---

## 9. Imagery

- Real photos from the first outings replace all placeholders as soon as they exist. Style: natural light, real people from a distance or from behind, no stock-photo clichés, no posed smiles.
- Until then: clearly marked image slots with alt text, and the hero video.
- The first-person Machu Picchu / Huayna Picchu photo is for the "À propos" page only, never the hero.

---

## 10. Do / Don't

**Do:** keep it light and calm, real facts only, big type, lots of air, mobile first, fast, WCAG AA, one accent color used sparingly.
**Don't:** fake stats, "trusted by" strips, wellness clichés, saturated postcard colors, autoplaying audio, heavy scroll effects, dark overlays that dull the video, text over busy image areas.

---

## 11. Tech

- Simple, maintainable stack with minimal dependencies (built with AI-assisted coding). Fast hosting.
- Semantic HTML, accessible names, visible focus states.
- Form handling with email notification; spam protection.
- Data model ready for a future `session` entity (date, capacity, price) without a rebuild.

---

## 12. Open items

- [ ] Slogan and the highlighted word
- [ ] Final visual identity: logo, palette, photos (being worked on separately)
- [ ] Final offer names and prices
- [ ] Partner educator: name, diploma, professional card number
- [ ] Domain name and email address
- [ ] Real testimonials (later)
