# Nó Made Project — site web

Site vitrine de Nó Made Project : sorties nature « corps / aventure » en solo ou en petit groupe, et un format Reconnexion parent / enfant, région PACA. Le site parle en « je » : la personne qui encadre les sessions.
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
| Les couleurs du mode sombre | `src/styles/tokens.css`, bloc `[data-theme='dark']` (et son miroir `prefers-color-scheme`) |
| Les textes de l'interface et des pages | `src/i18n/fr.json` |
| Le nom, la zone, l'email, les réseaux, les liens de la nav | `src/data/site.ts` |
| Une offre, un prix | `src/content/offers/fr/*.md` |
| Le prénom, le lien de réservation visio (Cal.com), la phrase du pied de page, l'interrupteur des avis | `src/data/site.ts` |
| Un avis de participant (avec son accord) | `src/content/testimonials/fr/*.md`, modèle `_modele.md` ; placé dans la page par `<Quote who="…" />` dans `src/pages/index.astro` |
| Une sortie groupée datée (« Prochaines sorties ») | `/admin/sessions` : créer la session, cocher « Publier sur le site », places et zone |
| La zone (Marseille, Cannes, Saint-Tropez) | `src/data/site.ts` (`zone`, `places`) |
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

## Admin (mini CRM)

`/admin` : demandes, contacts, sessions, tableau de bord. Base SQLite sur Turso (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`),
fichier `data/dev.db` en local. Comptes par email et mot de passe ; les adresses de `ADMIN_EMAILS` créent leur mot de passe
sur `/admin/mot-de-passe`. Schéma dans `src/lib/db/schema.ts` ; après une modification : `npm run db:generate -- --name <nom>`
puis ajouter le fichier dans `src/lib/db/migrations.ts`. Compte depuis un terminal : `npm run admin:user -- email "Prénom"`.

## Jalons

| Jalon | Contenu | État |
|---|---|---|
| M0 | Squelette : tokens, gabarit, en-tête, pied de page, 8 routes | fait |
| M1 | Hero vidéo : encodages, boucle fondue, poster, entrée, pause, mouvement réduit | fait |
| M2 | Accueil complet, Offres, À propos (design v2, images provisoires) | fait |
| M3 | Formulaire de demande, envoi d'email, anti-spam, FAQ | fait (clés Resend à renseigner) |
| M4 | Pages légales, contrôle des placeholders, SEO, audit accessibilité | fait |
| + | Mode sombre : suit le système, bascule discrète dans la nav, choix mémorisé | fait |
| M5.1 | Admin : base Turso, comptes, connexion, boîte de demandes branchée sur le formulaire | fait |
| M5.2 | Admin : contacts, sessions, participants, paiement au cochage, export .ics vers l'agenda | fait |
| M5.3 | Admin : tableau de bord (chiffre, sessions, conversion, douze mois, par offre) | fait |
| M5.4 | Édition du contenu par Anthony : abandonnée (2026-09-28), les modifications passent par l'administrateur du site | — |
