# Nó Made Project — site web

Site vitrine de Nó Made Project : balades guidées et expériences nature en petit groupe, région PACA.
Le brief complet (look, ton, pages, offres, décisions) est dans [`docs/design.md`](docs/design.md).

## Démarrer

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # génère dist/ (et .vercel/output/)
npm run preview
npm run video      # régénère public/hero/ depuis assets/source/hero-source.mp4 (ffmpeg requis)
```

Node 22 ou plus récent.

## Où modifier quoi

| Je veux changer… | Fichier |
|---|---|
| Les couleurs, les tailles de texte, les arrondis | `src/styles/tokens.css` (couche « palette brute » seulement) |
| Les textes de l'interface et des pages | `src/i18n/fr.json` |
| Le nom, la zone, l'email, les réseaux, les liens de la nav | `src/data/site.ts` |
| Une offre, un prix | `src/content/offers/fr/*.md` (à partir du jalon M2) |
| Une page | `src/pages/<nom>.astro` |
| L'en-tête, le pied de page, un bouton | `src/components/` |
| La police (Plus Jakarta Sans) | `public/fonts/` + `@font-face` dans `src/styles/global.css` |
| Les images provisoires (à remplacer par de vraies photos) | `src/assets/provisoire/` |

## Placeholders

Toute information manquante est écrite entre crochets et en majuscules : `[SLOGAN]`, `[ADRESSE EMAIL]`,
`[NOM DU PARTENAIRE]`… Le composant `Placeholder` les affiche avec un cadre jaune pointillé.
À partir du jalon M4, un build de production échoue tant qu'il en reste, sauf si `ALLOW_PLACEHOLDERS=1`.

## Déploiement

- **Vercel** : importer le dépôt, framework « Astro », rien d'autre à régler. Les variables d'environnement
  (formulaire de contact, jalon M3) sont listées dans `.env.example`.
- **Netlify ou Cloudflare Pages** : remplacer `@astrojs/vercel` par `@astrojs/netlify` ou `@astrojs/cloudflare`
  dans `package.json` et `astro.config.mjs`. Rien d'autre ne change.
- Mettre à jour `SITE_URL` dans `astro.config.mjs` et `public/robots.txt` avec le vrai domaine.

## Jalons

| Jalon | Contenu | État |
|---|---|---|
| M0 | Squelette : tokens, gabarit, en-tête, pied de page, 8 routes | fait |
| M1 | Hero vidéo : encodages, boucle fondue, poster, entrée, pause, mouvement réduit | fait |
| M2 | Accueil complet, Offres, À propos (design v2, images provisoires) | fait |
| M3 | Formulaire de demande, envoi d'email, anti-spam, FAQ | fait (clés Resend à renseigner) |
| M4 | Pages légales, contrôle des placeholders, SEO, audit accessibilité | à venir |
