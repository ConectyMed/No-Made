# design.md — Nó Made Project (v2)

> Source of truth for the website's look, feel and behaviour. Rewritten on 2026-09-28 from the Stitch
> mockup (`docs/reference/stitch-accueil.png`, `docs/reference/stitch-accueil.html`). The previous
> brief is superseded and lives only in git history.
> Items in [BRACKETS] are placeholders. Nothing invented ships: production builds fail while any remain.

---

## 1. Project

**Nó Made Project**: small-group guided nature experiences in the PACA region (France). Guided walks,
screen-free half-days, and a "Reconnexion" parent / teen format. A partner qualified educator leads any
physical-exercise or mobility content and is named on the site.

**v1:** showcase + "request a session" flow. No public calendar, no online payment. Sessions are scheduled
case by case after contact. **Later:** dated sessions with capacity, live availability, Stripe Checkout.

**Language:** French only, informal "tu". i18n-ready.

## 2. Standing rules (from the project brief, unchanged)

- All copy in French, informal "tu".
- No invented statistics, testimonials, partner logos or credentials. Real facts only: duration, group size,
  price, area. Test prices are labelled as such.
- Sessions are presented as guided walks and nature / connection experiences. Mobility or physical exercise
  is described only when led by the partner educator, who is named: [NOM DU PARTENAIRE].
- Placeholders wherever information is missing: [SLOGAN], [NOM DU PARTENAIRE], [DIPLÔME],
  [NUMÉRO DE CARTE PROFESSIONNELLE], [ADRESSE EMAIL], [LIEN INSTAGRAM], photos.
- Main CTA label: **"Demander une session"** (there is no booking, so never "Réserver").

## 3. Visual direction (from the Stitch mockup)

Deep-green and lime on an off-white page. Photo-led, generous radii, thin borders, soft shadows.
Everything sits inside a centred 80rem container with rounded "frames".

### Colours (CSS variables in `src/styles/tokens.css`)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#f9f9f8` | page |
| `--surface-low` | `#f3f4f3` | tinted sections (Reconnexion frame, footer) |
| `--surface` | `#ffffff` | cards, nav pill, inputs |
| `--surface-high` | `#e8e8e7` | big faded step numbers |
| `--ink` | `#1a1c1c` | body text |
| `--ink-2` | `#424843` | secondary text |
| `--green-900` | `#082013` | headings, primary buttons |
| `--green-800` | `#1e3527` | nav CTA, price banner background |
| `--green-600` | `#4c6700` | eyebrow labels, small icons |
| `--lime` | `#c5f260` | accent: hero CTA, brand dot, badges |
| `--lime-dim` | `#aad547` | lime hover |
| `--line` | `rgba(194, 200, 193, 0.4)` | hairline borders |
| `--outline` | `#737973` | placeholders, disabled |

Contrast (AA): white on green-800 > 12:1, green-600 on bg 6.1:1, green-900 on lime > 14:1, ink-2 on white 8:1.

Tokens that never change with the theme: `--on-lime` (text on lime), `--deep` / `--deep-hover` (dark buttons,
nav CTA, price banner). Hairlines always use `--line` / `--line-strong`, never a literal rgba.

### Dark mode

Same brand (lime, deep green), page turns green-black. Only the semantic tokens change, in the
`[data-theme="dark"]` block of `tokens.css` (and a mirror under `prefers-color-scheme: dark` for no-JS):
bg `#0f1411`, surface-low `#151c17`, surface `#1a221c`, ink `#eceeea`, ink-2 `#b7bdb6`, headings `#e4efe4`,
eyebrows / links lime-dim, glass `rgba(18,26,21,.78)`, hairlines white at 8 % / 16 %.

- Default follows the system. A click on the toggle stores `nomade-theme` = `dark` | `light` in
  localStorage; a stored choice wins over the system.
- An inline script in `<head>` sets `data-theme` before first paint (no flash).
- Toggle: icon-only button (moon / sun, 2.5rem, no background) in the nav pill, before the CTA, on every
  breakpoint. Label "Passer en mode sombre" / "Passer en mode clair". Colours cross-fade 200 ms on click
  only, not under reduced motion.
- `theme-color` metas exist for both schemes and are updated on toggle. Photos and the hero video are
  left untouched.

### Typography

- One family: **Plus Jakarta Sans**, self-hosted variable woff2 (latin subset), weights 300–800.
- Scale (mobile → desktop): display 36/44 → 56/64, weight 700, tracking -0.03em · headline-xl 28/36 → 40/48,
  600 · headline-lg 28/36 · headline-md 22/30 · headline-sm 18/26 · body-lg 18/28 · body 15/24 ·
  body-sm 13/20 · label 14/20 600 · label-sm 12/16 600 · label-uppercase 12/16 700, tracking 0.12em.
- Fluid sizes with `clamp()`.

### Shape and spacing

- Frames and cards: radius 1.5rem. Icon boxes: 1rem. Buttons, pills, badges, inputs: fully rounded.
- Borders: 1px `--line`. Shadow: `0 10px 30px -10px rgba(30,53,39,.05)`.
- Container 80rem, side padding 1rem / 1.5rem / 3rem. Section padding 4rem mobile, 6rem desktop.
- Icons: inline SVG, 24px grid, stroke 1.8. No icon font.

## 4. Nav

Right side, in order: theme toggle (icon only, discreet), then the CTA. Mobile: toggle, mail icon, burger.

Floating pill fixed 1rem from the top, 92% wide, max 80rem, white at 80% with blur, hairline border.
Left: lime dot + "Nó Made Project". Centre (desktop): Accueil, Offres, À propos, Contact.
Right: CTA pill in green-800 with an arrow. Mobile: brand, CTA icon, burger opening a full-screen panel
with large links and the CTA. Escape closes, focus managed.

## 5. Hero

Rounded frame, min height 580px mobile / 660px desktop, content bottom-left.
- Media: the looping video (`src/components/HeroVideo.astro`). Poster `<img>` first (LCP element,
  carries the alt text), video attached after `load` with `preload="none"`, 1.2 s fade-in once frames
  render, native `loop` on a file whose 1 s crossfade is baked in, pause control, blurred poster backdrop
  for portrait screens. Poster only under reduced motion, Save-Data, 2G, or when playback is refused.
  Pauses when the tab is hidden or the hero is scrolled out.
- Gradient from green-900 at 90% at the bottom to transparent at the top, so white text reads.
- Tag pill (white, blurred, lime dot): "Région PACA · sessions en petit groupe".
- H1 in white: "Marcher. Respirer. Se retrouver dehors." (validated), editable in `src/i18n/fr.json`. Lead in white at 90%.
- Two CTAs: "Demander une session" (lime) and "Découvrir le format" (white glass, scrolls to the approach).
- Spec bar (white glass pill): Région PACA · 3 à 5 personnes · 100 % dehors.
- Portrait mobile: same frame, media covers, content stacks.

## 6. Home page sections, in order

1. **Hero** (above).
2. **L'approche** — uppercase label, headline-xl, four small cards (icon box, title, body-sm, footer
   "0n / word"): Terrain, Marche, Coopération, Groupe.
3. **Trois temps forts** — three image-top cards (image 16rem high, pill "Temps 0n", headline-md, body,
   footer row with a note and an icon): Marche · Mobilité with [NOM DU PARTENAIRE] · Respirer et parler.
4. **Reconnexion** — tinted frame, image left with a floating glass badge "Sans écran", label
   "Format parent / ado", headline-xl, lead, three check bullets, CTA + real price note.
5. **Déroulement** — centred label + headline, three cards with big faded numbers: Tu nous écris ·
   On cale une date · On se retrouve dehors.
6. **Prix** — green-800 banner: label "Prix de test", the entry offer, its price large in lime, CTA,
   link to /offres.
7. **Contact** — centred intro and the request form in a white card (see §8).
8. **Footer** — tinted, rounded top: brand + one line, link row (Offres, À propos, Contact, Mentions
   légales, CGV, Confidentialité, Instagram), copyright row.

Testimonials: none until real ones exist (`site.showTestimonials`).

## 7. Other pages

- **/offres** — one detailed card per offer (category pill, duration, group, prices, for whom, programme,
  what to bring, CTA), practical notes, contact teaser.
- **/a-propos** — the founder's story (10 years of autonomous travel, BJJ, climbing, boxing, physical
  preparation, 15 years in hospitality, a taste for passing things on), written as biography, never as
  session content. Partner educator block: [NOM DU PARTENAIRE], [DIPLÔME], [NUMÉRO DE CARTE PROFESSIONNELLE].
  One personal photo slot (Machu Picchu photo, provided later).
- **/contact** — intro, the form, FAQ (native details/summary).
- **/mentions-legales, /cgv, /confidentialite** — three routes on a shared legal layout; templates at M4.
- **404** in the same style.

## 8. Request form

Fields: prénom et nom, email, téléphone (optional), session souhaitée (select from the offers collection,
plus "je ne sais pas encore"), nombre de personnes, période souhaitée (free text), message, RGPD consent
linking to /confidentialite. Hidden: honeypot, timestamp. Posts to `/api/contact` (M3): validation,
honeypot + timing, email to the owner via Resend, short confirmation to the requester in French "tu".
Turnstile dormant behind env keys. No payment.

## 9. Motion

- Entrance on the home page only: media fade, hero content rise. Elsewhere a plain short fade.
- Scroll: once-only fade-rise reveals via IntersectionObserver. No parallax in v1.
- Hover: cards lift 4–6px, buttons scale 1.02 / 0.98.
- `prefers-reduced-motion: reduce`: no entrance, no reveals, poster instead of video. Transform and
  opacity only, never layout.

## 10. Imagery

- Real photos from the first outings replace everything as soon as they exist.
- Until then (approved 2026-09-28), the five AI-generated Stitch images are used as **provisional visuals**, each carrying a
  visible "[IMAGE PROVISOIRE]" badge that the placeholder gate catches. They never ship to production.
- Hero video received 2026-09-28. Source `assets/source/hero-source.mp4` is 1280×720, 24 fps, 8 s,
  no audio, so there is no 1080p encode (upscaling would add weight, not detail). Built files in
  `public/hero/`: `hero-720.mp4` (0.99 MB, desktop), `hero-540.mp4` (0.29 MB, phones),
  `hero-poster.webp` (83 KB), `hero-poster-640.webp` (35 KB), `hero-poster-blur.webp` (32 px backdrop).
  Loop: output = source[1 s → end] then a 1 s fade into source[0 → 1 s], so the last frame matches the
  first. Rebuild with `npm run video` (ffmpeg needed).

## 11. Tech (unchanged decisions)

Astro, static output, plain CSS tokens, no UI framework. Adapter: Vercel, swappable for Netlify or
Cloudflare Pages. Self-hosted font. No analytics, no cookies, no banner. Offers in Markdown with a
validated schema; prices in integer cents. `Session` type reserved for v2. Production build fails while
any [PLACEHOLDER] remains (override for previews).

## 12. Open items

- [x] Slogan validated (2026-09-28): "Marcher. Respirer. Se retrouver dehors."
- [x] The format is spelled "Reconnexion" (2026-09-28). "Reconnexion nature" is the 2h30 walk; the parent / ado half-day is presented as the Reconnexion parent / ado format.
- [ ] Partner educator: name, diploma, professional card number, separate business or not
- [x] Hero video received and encoded (2026-09-28)
- [ ] Real photos
- [x] Hosting: Vercel (Hobby during development, paid plan at the official launch). Public email during development: nomadeproject@outlook.fr; the domain, its `contact@` forward and DNS come later.
- [ ] Legal status, VAT regime, cancellation and weather policy
- [ ] Future languages
