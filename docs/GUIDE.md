# Guide : ce qu'il te reste à faire, dans l'ordre

Tout ce qui est ici dépend de toi (comptes, domaine, informations). Le code, lui, est prêt ou en cours.
Coche au fur et à mesure. Quand un point est fait, dis-le-moi et je branche la suite.

---

## Étape 1 — Débloquer GitHub (5 min, bloquant)

Sans ça, rien de ce que je fais n'arrive dans ton dépôt.

1. Va sur **https://claude.ai/connect-github** et reconnecte ton compte GitHub.
2. Sur la page qui s'ouvre, installe l'application **Claude** sur l'organisation **ConectyMed** et donne-lui accès au dépôt **No-Made** (ou à tous les dépôts).
   Si tu n'es pas administrateur de l'organisation, demande à la personne qui l'est.
3. Dis-moi « GitHub ok ». Je pousse la branche `claude/no-made-website-plan-9asdt1` et j'ouvre une pull request pour que tu voies tout.

---

## Étape 2 — Hébergement : Vercel (choisi)

Le site est statique, plus une seule fonction pour le formulaire. Trois options, le code marche sur les trois :

| Option | Prix | Usage commercial | Ce qu'il faut savoir |
|---|---|---|---|
| **Vercel Pro** | ~20 $/mois | oui | Le plus simple. Le plan gratuit (Hobby) interdit l'usage commercial : un site qui vend des sessions n'y a pas sa place. |
| **Netlify** | gratuit | oui | Très proche de Vercel. Je change une ligne de configuration. |
| **Cloudflare Pages** | gratuit | oui | Idéal si tu prends aussi ton domaine chez Cloudflare. Je change une ligne de configuration. |

Ma recommandation si tu veux zéro frais fixe : **Cloudflare Pages** avec le domaine chez Cloudflare. Si tu préfères la simplicité et que 20 $/mois ne te gênent pas : **Vercel Pro**.

Décision : **Vercel**, plan gratuit pendant le développement, plan payant au lancement officiel (le plan gratuit interdit l'usage commercial).

À faire : créer le compte sur vercel.com, y connecter GitHub, **Add New → Project**, importer `ConectyMed/No-Made`. Le framework « Astro » est détecté tout seul. Dans **Settings → Git**, la branche de production reste `main` ; chaque autre branche donne une URL de prévisualisation.

---

## Étape 3 — Domaine et adresse email (plus tard, au lancement)

1. **Choisis et achète le nom de domaine**, en ASCII sans accent, par exemple `nomade-project.fr` ou `nomadeproject.fr`. Chez Cloudflare Registrar, OVH, Gandi ou Infomaniak. Compte 8 à 15 € par an.
2. **Une adresse email sur ce domaine**, par exemple `contact@nomade-project.fr`. Deux voies :
   - une vraie boîte mail chez ton registrar (OVH, Gandi et Infomaniak en proposent, quelques euros par mois) ;
   - ou une simple redirection de `contact@…` vers ta boîte actuelle (gratuit chez Cloudflare Email Routing, OVH, Gandi).
3. Note où sont gérés les **DNS** du domaine (c'est là que tu ajouteras deux ou trois enregistrements à l'étape 4).

Décision : pendant le développement, l'adresse publique et de réception est **nomadeproject@outlook.fr** (déjà dans le code). Au lancement, `contact@<domaine>` sera redirigée vers cette boîte. Dis-moi le domaine quand il existe : je mets à jour `SITE_URL` et l'adresse affichée.

---

## Étape 4 — Resend, pour recevoir les demandes par email (20 min)

Resend est le service qui envoie l'email quand quelqu'un remplit le formulaire. Gratuit jusqu'à 3 000 emails par mois.

1. Crée un compte sur **https://resend.com**.
2. **Domains → Add domain** : ajoute ton domaine. Resend te donne 2 ou 3 enregistrements DNS (DKIM, SPF). Copie-les dans les DNS du domaine (étape 3). Vérification en général sous une heure.
3. **API Keys → Create API key** : copie la clé (elle commence par `re_`). Elle ne s'affiche qu'une fois.
4. Dans ton hébergeur (Vercel : Project → Settings → Environment Variables ; Netlify : Site configuration → Environment variables ; Cloudflare : Settings → Variables), ajoute :

   | Variable | Valeur |
   |---|---|
   | `RESEND_API_KEY` | la clé `re_…` |
   | `CONTACT_TO_EMAIL` | `nomadeproject@outlook.fr` |
   | `CONTACT_FROM_EMAIL` | `onboarding@resend.dev` tant qu'il n'y a pas de domaine vérifié |

   Important : sans domaine vérifié, Resend n'accepte d'envoyer **que vers l'adresse avec laquelle le compte Resend a été créé**. Crée donc le compte Resend avec `nomadeproject@outlook.fr`. Tu recevras les demandes ; seul l'accusé de réception au demandeur attendra le domaine. L'étape 2 (Domains) se fera au lancement.

5. Ne mets **jamais** la clé dans le code ni dans un message : uniquement dans les variables d'environnement.

---

## Étape 5 — La vidéo du hero : fait

Reçue et intégrée. Source en `assets/source/hero-source.mp4` (1280×720, 8 s, sans son), encodages et poster dans `public/hero/`. Si tu remplaces la vidéo un jour : même format, même dossier, puis `npm run video` régénère tout (il faut ffmpeg sur la machine).

Les cinq visuels actuels sont générés par IA et portent un badge « image provisoire ». Ils ne peuvent pas partir en production : le build refusera tant qu'ils sont là. Remplace-les par tes photos quand tu en as (`src/assets/provisoire/`, mêmes noms de fichiers, et je retire les badges).

---

## Étape 6 — Les informations qui manquent sur le site

Chaque case correspond à un placeholder jaune. Le build de production refuse de partir tant qu'il en reste (`docs/PLACEHOLDERS.md` en donne la liste à jour après chaque `npm run build`).

- [x] **Lui** : prénom et parcours reçus (Antho). Pas de diplôme ni de titre : c'est décidé.
- [ ] **Son portrait** pour la page À propos (format vertical, 4:5, au moins 1200 px de haut).
- [ ] **Son nom complet** pour les pages légales (éditeur, vendeur, responsable des données) : « Antho A. » ne suffit pas là.
- [ ] **Tarif en solo** de l'Expérience corps / aventure (aujourd'hui `[TARIF SOLO]`).
- [ ] **Lien Google Agenda** pour la visio (étape 6 bis ci-dessous).
- [ ] **Adresse email publique** (étape 3).
- [ ] **Instagram** et **Facebook** : les liens, ou « pas de compte » et je retire la ligne.
- [ ] **Météo et annulation** : que se passe-t-il s'il pleut, si quelqu'un annule la veille, si toi tu annules ? Report, remboursement, acompte ? Deux ou trois phrases suffisent, je rédige.
- [ ] **Statut juridique** pour les pages légales : micro-entreprise (à confirmer), nom ou dénomination, SIRET, adresse, TVA applicable ou non (mention « TVA non applicable, art. 293 B du CGI » en micro-entreprise), médiateur de la consommation choisi, assureur responsabilité civile professionnelle.
- [ ] **Langues futures** éventuelles (anglais ?), pour préparer la configuration.

---

## Étape 6 bis — Le rendez-vous visio avec Google Agenda (15 min, à faire par lui)

Le site propose une visio gratuite de 20 minutes avant de réserver. Le calendrier est celui de Google Agenda, gratuit avec un compte Google.

1. Se connecter à [calendar.google.com](https://calendar.google.com) avec son compte Google (en créer un s'il n'en a pas ; l'adresse Outlook peut servir d'identifiant).
2. Bouton **Créer** → **Planning de rendez-vous**. Nom : « Échanger en visio, 20 min ». Durée 20 min. Choisir les jours et heures où il accepte des visios, et une marge entre deux rendez-vous.
3. Dans **Paramètres de réservation**, cocher **Visioconférence Google Meet** : le lien de la visio est créé et envoyé tout seul.
4. Enregistrer, puis ouvrir le planning et cliquer sur **Partager** → onglet **Intégrer sur un site** → copier **l'URL** qui se trouve dans le code (elle commence par `https://calendar.google.com/calendar/appointments/schedules/`). C'est celle-là qu'il me faut, pas le lien court.
5. Me l'envoyer. Je la mets dans `src/data/site.ts` (`visio.url`), et le bouton « Réserver un créneau visio » se met à fonctionner : le calendrier s'affiche dans la page, au clic seulement.

Si son compte n'a pas l'option « Planning de rendez-vous », le lien court de partage (`calendar.app.google/…`) marche aussi : le bouton ouvrira alors la page Google dans un nouvel onglet.

---

## Étape 7 — Tester

Quand les étapes 1, 2 et 4 sont faites :

1. Ouvre le site sur l'URL de prévisualisation donnée par l'hébergeur.
2. Remplis le formulaire avec ta propre adresse et envoie.
3. Tu dois recevoir l'email « Demande de session : … » dans la minute, et ton adresse de test doit recevoir « J'ai bien reçu ta demande ».
4. Réponds directement à l'email reçu : la réponse part vers le demandeur.

Si rien n'arrive : vérifie les trois variables de l'étape 4, puis les journaux de la fonction chez l'hébergeur. Dis-moi ce que tu vois.

---

## Étape 8 — Mise en ligne

1. Tous les placeholders remplis (`docs/PLACEHOLDERS.md` vide).
2. Pages légales relues par toi, et idéalement par quelqu'un dont c'est le métier.
3. Le domaine pointé vers l'hébergeur (il te donne les enregistrements à ajouter).
4. Un dernier test du formulaire depuis le vrai domaine.

---

## Ce que je fais pendant ce temps, sans rien attendre de toi

- Le formulaire envoie déjà les emails dès que les variables de l'étape 4 existent.
- Le contrôle des placeholders est en place.
- À venir : les modèles des trois pages légales (à compléter avec l'étape 6), l'image Open Graph définitive, l'audit accessibilité et performance, puis le hero vidéo dès que le fichier arrive.
