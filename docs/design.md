# design.md — Nó Made Project (v2)

> Source of truth for the website's look, feel and behaviour. Rewritten on 2026-09-28 from the Stitch
> mockup (`docs/reference/stitch-accueil.png`, `docs/reference/stitch-accueil.html`). The previous
> brief is superseded and lives only in git history.
> Items in [BRACKETS] are placeholders. Nothing invented ships: production builds fail while any remain.

---

## 1. Project

**Nó Made Project**: outdoor "body / adventure" experiences in the PACA region (France), solo or in a small
group, plus a "Reconnexion" parent / child format. Each session mixes walking or hiking, functional bodyweight
preparation, mobility (yoga and animal-movement inspired), and breathing / concentration techniques, adapted to
each profile. The problems it answers, in the owner's words: get body and mind moving again, regain a good
physical condition, step out of the "routine" comfort zone, rediscover the nature around us. Audience: adults,
mostly 30–50, and parent / child duos.

**Voice (decided 2026-09-28):** the site belongs to the one person who leads every session. It speaks in the
first person ("je"), addresses the visitor as "tu". Nobody else appears: no founder, no partner, no team.
The person behind the project's setup stays invisible everywhere, including legal pages. No professional
title ("éducateur", diploma, card number) is displayed anywhere, by decision of the owner.

**v1:** showcase + "request a session" flow. No public calendar, no online payment. Sessions are scheduled
case by case after contact. **Later:** dated sessions with capacity, live availability, Stripe Checkout.

**Language:** French only, informal "tu". i18n-ready.

## 2. Standing rules (from the project brief, unchanged)

- All copy in French, informal "tu", first person "je" (one voice: the person who leads the sessions).
- No invented statistics, testimonials, logos or credentials. Real facts only: duration, group size,
  price, area. Test prices are labelled as such. A price that is not known yet is a placeholder, never a guess.
- Sessions describe what the owner actually does (walk, bodyweight work, mobility, breathing) and never make
  a medical or therapeutic claim: no "réhabilitation", "thérapie", "soigne". The training method behind the
  bodyweight work is not named.
- Placeholders wherever information is missing: [PRÉNOM], [PARCOURS…], [TARIF SOLO], [LIEN GOOGLE AGENDA],
  [LIEN INSTAGRAM], photos, legal identity.
- Main CTA label: **"Demander une session"** (no session booking, so never "Réserver une session").
  Secondary CTA: **"Réserver un créneau visio"**, a free 20-minute video call before deciding.

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

Right side, in order: theme toggle (icon only, discreet), then the CTA. Mobile: short brand under 26em, toggle, a labelled « Demander » pill (not a mail icon), burger.

Floating pill fixed 1rem from the top, 92% wide, max 80rem, white at 80% with blur, hairline border.
Left: lime dot + "Nó Made Project". Centre (desktop): Accueil, Offres, À propos, Contact.
Right: CTA pill in green-800 with an arrow. Mobile: brand, « Demander » pill, burger opening a full-screen panel
with large links and the CTA. Escape closes, focus managed.

## 5. Hero

Split layout (v3, 2026-09-28), on a light frame: text left, media right, floating cards, a row of facts.
- Frame: rounded, `--surface` background, border, soft shadow. Desktop ≥ 64em: two columns (7/5), min
  height 84svh capped at 720px, plus a full-width facts row. Tablet and mobile: one column (text, media,
  cards, facts).
- Media: the looping video (`src/components/HeroVideo.astro`). Poster `<img>` first (LCP element,
  carries the alt text), video attached after `load` with `preload="none"`, 1.2 s fade-in once frames
  render, native `loop` on a file whose 1 s crossfade is baked in, pause control (top right), blurred
  poster backdrop. Poster only under reduced motion, Save-Data, 2G, or when playback is refused. Pauses
  when the tab is hidden or the hero is scrolled out. On desktop it covers the right 62% of the frame,
  full height, and fades into the frame surface on its left edge and at the bottom (two gradients in
  `--surface`, so both themes work). On mobile it is a 4:3 block (16:9 on tablet) fading at the bottom.
- Tag pill (lime-soft, leaf icon, uppercase): "Région PACA · en solo ou en petit groupe".
- H1 in green-900, larger than the display size (2.5 → 4.25rem), last line "Se retrouver." in green-600.
  Editable in `src/i18n/fr.json` (the last `\n` line is the accented one). Lead in ink-2, 34rem max.
- Two CTAs: "Demander une session" (lime) and "Découvrir l'approche" (outline, scrolls to the approach).
  Under them, one line: "Tu préfères en parler d'abord ? 20 minutes en visio, gratuites et sans
  engagement." linking to the visio block. No fake avatars, no "join N people".
- Floating cards (right column, staggered horizontally, `.glass`): Marcher · Bouger · Respirer, each a
  56px real-photo thumbnail (stairs, crouched silhouette on rocks, altitude lake) and one line; they link
  to the "Trois temps forts" section. Thumbnails are decorative (`alt=""`), too small to carry the "Pérou"
  caption; the full cards below keep it. On mobile the three cards overlap the bottom of the media.
- Facts row (4 tiles, `.glass`, the last one lime-soft): 2h30 session corps / aventure · 3h Reconnexion ·
  20 min de visio · 0 écran. Values come from the offers' `duration` and `site.visio.duration`, never
  typed numbers: the reference layout's "520K+ trees" style counters are exactly what this site does not do.

## 6. Home page sections, in order

1. **Hero** (above).
2. **Pourquoi sortir** — uppercase label, headline-xl, four small cards (icon box, title, body-sm, footer
   "0n / word"): Condition, Routine, Esprit, Nature (the four problems the owner answers).
3. **Trois temps forts** — three image-top cards (image 16rem high, pill "Temps 0n", headline-md, body,
   footer row with a note and an icon): Marcher, randonner · Bouger (bodyweight + mobility) · Respirer, se
   concentrer.
4. **Reconnexion** — tinted frame, image left with a floating glass badge "Sans écran", label
   "Format parent / enfant", headline-xl, lead, three check bullets, CTA + real price note.
5. **Déroulement** — centred label + headline, three cards with big faded numbers: Tu m'écris ·
   On cale une date · On se retrouve dehors.
6. **Prix** — deep-green banner: label "Tarif de lancement", the entry offer, its group price large in lime, the
   solo price as a placeholder until known, CTA, link to /offres, link to the visio block.
7. **Contact** — centred intro and the request form in a white card (see §8).
8. **Footer** — tinted, rounded top: brand + one line, link row (Offres, À propos, Contact, Mentions
   légales, CGV, Confidentialité, Instagram), copyright row.

Quotes are not a section but **pull quotes** (`Quote.astro`) woven into the page: a public-domain author
quote after the three moments (Saint-Exupéry, *Le Petit Prince*, dedication, original punctuation with the parenthesis, chosen by the representative 2026-09-28; short quotation with attribution),
one participant quote under the Reconnexion image (parent / child), one after the steps, before the price
banner. A lime hairline on the left, the text large, the attribution small; no card, no stars.
Shown when `site.showTestimonials` is true and the entry exists in `src/content/testimonials/fr/`. A real entry requires `consent: true`. Since
2026-09-28, at the representative's request, two **provisional, invented** reviews (`provisional: true`,
Karim B. and Léa D.) stand in for previews; each carries a visually-hidden "[AVIS PROVISOIRE]" marker that the
placeholder gate catches, so production stays blocked until the three real reviews replace them.
First name + initial, month, offer; no stars, no ratings.

## 7. Other pages

- **/offres** — one detailed card per offer (category pill, duration, group, prices, for whom, programme,
  what to bring, CTA + "Échanger en visio d'abord" link), practical notes, visio teaser.
  Offers: `experience-corps-aventure` (2h30, solo or 3–5, 30 € per person in a group, solo price [TARIF SOLO])
  and `reconnexion-parent-enfant` (3h, duo 60 € or four people 80 €).
- **/a-propos** — the owner in the first person: "Moi, c'est Anthony", his story in his own facts (10 years
  of autonomous travel, knowledge of the terrain, BJJ / climbing / boxing / physical prep, FR EN ES, a taste
  for passing things on; his 15 years behind a bar are NOT mentioned, by his request), why Nó Made exists,
  a four-item facts list, his portrait (travel photo, captioned Pérou), a Montaigne pull quote (*Essais*, III, 3,
  public domain, chosen by the representative 2026-09-28) as the bridge, then "Ma façon de faire" (walk / bodyweight / mobility / breathing). No title, no diploma, no other person.
- **/contact** — intro, the form, the **visio block** (`VisioBooking.astro`, anchor `#visio`): a booking
  page (Cal.com recommended since the owner has no Google account; Calendly and Google Calendar also
  recognised) loaded in an iframe only after a click (no third-party request before), fallback link in a new
  tab; placeholder [LIEN DE RÉSERVATION VISIO] until the owner provides the URL. Then the FAQ.
- **/mentions-legales, /cgv, /confidentialite** — three routes on a shared legal layout; templates at M4.
- **404** in the same style.

## 8. Request form

Fields: prénom et nom, email, téléphone (optional), session souhaitée (select from the offers collection,
plus "je ne sais pas encore"), nombre de personnes, période souhaitée (free text), message, RGPD consent
linking to /confidentialite. Hidden: honeypot, timestamp. Posts to `/api/contact` (M3): validation,
honeypot + timing, email to the owner via Resend, short confirmation to the requester in French "tu".
Turnstile dormant behind env keys. No payment.

## 9. Motion

- Entrance on the home page only: media fade, hero content rise, then the three floating cards rise one
  after the other (360 ms + 90 ms each). Elsewhere a plain short fade.
- Scroll: once-only fade-rise reveals via IntersectionObserver. No parallax in v1.
- Hover: cards lift 4–6px, buttons scale 1.02 / 0.98.
- `prefers-reduced-motion: reduce`: no entrance, no reveals, poster instead of video. Transform and
  opacity only, never layout.

## 10. Imagery

- Real photos from the first outings replace everything as soon as they exist.
- First real photos received 2026-09-28: Anthony's own photos, re-encoded with `sharp` (auto-rotated,
  EXIF and GPS stripped, 1500×2000, JPEG 86) into `src/assets/photos/`, served through `Photo.astro`
  (Astro `<Image>`, webp, responsive widths, `object-fit: cover`, optional `position` and `caption`).
  Travel photos carry a small "Pérou" caption (bottom left) so nobody mistakes them for the region.
  Placement: steep stone stairway (Peru) → home "Marcher, randonner"; crouched silhouette on sea rocks at
  sunset (location to confirm, no caption) → home "Respirer, se concentrer"; glacier lake (Peru) → home
  Reconnexion frame (mood image until a parent / child photo exists); Anthony seated on a summit rock
  (Peru) → À propos portrait (4:5 frame).
- Not used: shots with third parties in frame (no consent), the empty tropical beach (1280 px, soft),
  and a 30 s 848×480 beach sunrise clip (too small for any frame, off-topic).
- One AI-generated image remains as a **provisional visual** (the "Bouger" card), carrying a visible
  "[IMAGE PROVISOIRE]" badge that the placeholder gate catches. It never ships to production. Needed: a
  bodyweight / mobility shot outdoors.
- Hero video received 2026-09-28. Source `assets/source/hero-source.mp4` is 1280×720, 24 fps, 8 s,
  no audio, so there is no 1080p encode (upscaling would add weight, not detail). Built files in
  `public/hero/`: `hero-720.mp4` (0.99 MB, desktop), `hero-540.mp4` (0.29 MB, phones),
  `hero-poster.webp` (83 KB), `hero-poster-640.webp` (35 KB), `hero-poster-blur.webp` (32 px backdrop).
  Loop: output = source[1 s → end] then a 1 s fade into source[0 → 1 s], so the last frame matches the
  first. Rebuild with `npm run video` (ffmpeg needed).

## 11. Tech (unchanged decisions)

Astro, static output, plain CSS tokens, no UI framework. Adapter: Vercel, swappable for Netlify or
Cloudflare Pages. Self-hosted font. Cookieless audience measurement only (Vercel Web Analytics via `<Analytics />` from `@vercel/analytics/astro` in Base.astro, public pages, plus click events on the request and visio CTAs via `src/lib/track.ts`), no cookies, no banner. Offers in Markdown with a
validated schema; prices in integer cents. `Session` type reserved for v2. Production build fails while
any [PLACEHOLDER] remains (override for previews).

## 12. Admin (mini CRM), added 2026-09-28

Decided with the owner's representative: a small CRM at `/admin`, for Anthony and the site administrator.
Not a public feature. Site content (texts, prices, photos) is NOT editable from the admin: Anthony asks the
site administrator, who changes the files (decided 2026-09-28; the Keystatic step was dropped).

- **Scope**: requests from the form (status: nouvelle → répondue → confirmée / annulée, notes, reply by
  opening the owner's own mailbox with a prefilled draft, the site never sends), contacts (one card per
  person, notes, history), planned sessions with participants and an editable amount that counts as
  revenue when the session is ticked "faite", and a dashboard. Delivered in four steps: 1 base + accounts +
  requests (done), 2 contacts + sessions + payment (done 2026-09-28), 3 dashboard (done 2026-09-28).
  A fourth step (Keystatic content editing) was dropped.
- **Dashboard**: waiting (new requests, awaiting client, upcoming sessions, contacts), money (month revenue
  with delta vs previous month, year revenue, people taken out, request conversion rate for the year),
  a twelve-month CSS bar chart, revenue by offer, next five sessions, latest requests. Revenue = amount of
  sessions with status "faite", by session start date, Europe/Paris months.
- **Sessions model**: `outings` (offer, start in ms, duration, place, status prévue / faite / annulée,
  amount in cents, notes) and `participants` (contact, people count, optional source request). A request
  gets `outing_id` and status "confirmée" when planned or attached. Amount suggestion from the offer's
  pricing and the total people (`src/lib/crm/pricing.ts`): duo / four-people tariff for the parent-child
  format, per-person price × people for the adult format, "solo price not set" while [TARIF SOLO] remains.
  Per-session .ics export (`/admin/sessions/<id>.ics`) for Outlook or any calendar; the earlier Google
  Calendar link was dropped (no Google account). Times entered and shown in
  Europe/Paris (`parisToMs` / `msToParisParts`).
- **Data**: SQLite on Turso (region Ireland, EU), file `data/dev.db` locally. Drizzle ORM; migrations
  generated by drizzle-kit into `drizzle/` and embedded in the code (`src/lib/db/migrations.ts`), applied
  on first access. Retention stated in the privacy policy: two years after the last exchange.
- **Accounts**: email (or plain identifier) + password (scrypt), HttpOnly session cookie 30 days, lock 15 min
  after 8 failures. Bootstrap (asked 2026-09-28, temporary): while the users table is empty, `admin` /
  `admin123` (overridable with `ADMIN_BOOTSTRAP_USER` / `ADMIN_BOOTSTRAP_PASSWORD`) creates the first
  account at first login, flagged `must_change_password`; a red banner stays until it is changed on
  `/admin/compte`.
  No sign-up: an address listed in `ADMIN_EMAILS` (or already in the users table) can request a one-hour
  link at `/admin/mot-de-passe` to set its password; the link is emailed via Resend, or written to the
  server logs when email is not configured. `scripts/admin-user.mjs` creates an account from a terminal.
- **Rendering**: server-rendered Astro pages (`prerender = false`), middleware guards `/admin`, no
  indexing (`X-Robots-Tag`, robots.txt), no caching. Public pages stay static.
- **Look**: same tokens, light and dark. Sidebar on desktop, top bar on mobile. Status badges:
  nouvelle (lime), répondue, confirmée (deep green), annulée (struck).

## 13. Open items

- [x] Slogan validated (2026-09-28): "Marcher. Respirer. Se retrouver." ("dehors" dropped from the hero title
      later the same day; the OG image follows).
- [x] The format is spelled "Reconnexion" (2026-09-28) and is the parent / child half-day. The adult session
      is "Expérience corps / aventure".
- [x] One voice, "je" (2026-09-28). The owner's micro-entreprise is the legal entity. No "éducateur" or
      diploma on the site. The owner answers requests himself on nomadeproject@outlook.fr.
- [x] Visio before booking (2026-09-28): external booking page (Cal.com recommended), click-to-load, on
      /contact, linked from the price banner, the offers page and each offer card.
- [x] Owner: first name (Anthony) and story received 2026-09-28
- [ ] Owner: portrait photo; full legal name for the legal pages
- [ ] Solo price
- [x] Visio booking URL received 2026-09-28: cal.com/nomadeproject/presentation (Google Calendar dropped, no Google account)
- [ ] Three real testimonials announced 2026-09-28: two replace the provisional ones (files in
      src/content/testimonials/fr/, then remove `provisional: true`), the third gets its own place
- [x] Admin step 1 (2026-09-28): Turso created by the owner's representative (Ireland). First login done and
      temporary password changed the same day. Resend variables set on Vercel. Anthony's own account later via `ADMIN_EMAILS`.
- [x] Admin step 2 (2026-09-28): contacts, sessions, participants, payment on "faite", request → session.
- [x] Admin step 3 (2026-09-28): dashboard.
- [x] Admin step 4 (Keystatic) dropped 2026-09-28: content changes go through the site administrator.
- [x] Hero video received and encoded (2026-09-28)
- [ ] Real photos
- [x] Hosting: Vercel (Hobby during development, paid plan at the official launch). Public email during development: nomadeproject@outlook.fr; the domain, its `contact@` forward and DNS come later.
- [ ] Legal identity (name, SIRET, address, VAT), insurer, mediator, cancellation and weather policy
- [ ] Future languages

## Conversion pass (2026-09-29)

- Zone named everywhere: Marseille, Cannes, Saint-Tropez et alentours (`site.zone`, `site.places`).
- Solo means one-to-one with Anthony. Groups of 3–5 run on dated sessions published from the admin
  (« Publier sur le site » on a session: capacity, public area; the exact meeting point stays private).
  They show in « Prochaines sorties » (home, /offres) via `/api/sessions`, and « Demander une place »
  opens the form with `?session=<id>`.
- Request form: session, number of people (select 1–5), name, email required; period, phone, message
  optional; no consent checkbox (art. 6.1.b, a notice under the button). Turnstile widget rendered when
  `PUBLIC_TURNSTILE_SITE_KEY` is set; the server only enforces it when both keys exist.
- « Prix de test » becomes « Tarif de lancement ». Hero facts: 2h30 · 3h · dès 30 € · 0 écran.
- New page /encadrement/ (who supervises, preparation, weather, parent / child, insurance), linked from
  the footer, the Reconnexion block, /offres and the FAQ. Weather: chosen together, keep or postpone, free.

