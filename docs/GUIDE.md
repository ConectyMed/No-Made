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

## Étape 2 — Choisir l'hébergement (10 min)

Le site est statique, plus une seule fonction pour le formulaire. Trois options, le code marche sur les trois :

| Option | Prix | Usage commercial | Ce qu'il faut savoir |
|---|---|---|---|
| **Vercel Pro** | ~20 $/mois | oui | Le plus simple. Le plan gratuit (Hobby) interdit l'usage commercial : un site qui vend des sessions n'y a pas sa place. |
| **Netlify** | gratuit | oui | Très proche de Vercel. Je change une ligne de configuration. |
| **Cloudflare Pages** | gratuit | oui | Idéal si tu prends aussi ton domaine chez Cloudflare. Je change une ligne de configuration. |

Ma recommandation si tu veux zéro frais fixe : **Cloudflare Pages** avec le domaine chez Cloudflare. Si tu préfères la simplicité et que 20 $/mois ne te gênent pas : **Vercel Pro**.

À faire : créer le compte, y connecter GitHub, importer le dépôt `ConectyMed/No-Made`. Le framework « Astro » est détecté tout seul. Dis-moi lequel tu as choisi.

---

## Étape 3 — Domaine et adresse email (30 min)

1. **Choisis et achète le nom de domaine**, en ASCII sans accent, par exemple `nomade-project.fr` ou `nomadeproject.fr`. Chez Cloudflare Registrar, OVH, Gandi ou Infomaniak. Compte 8 à 15 € par an.
2. **Une adresse email sur ce domaine**, par exemple `contact@nomade-project.fr`. Deux voies :
   - une vraie boîte mail chez ton registrar (OVH, Gandi et Infomaniak en proposent, quelques euros par mois) ;
   - ou une simple redirection de `contact@…` vers ta boîte actuelle (gratuit chez Cloudflare Email Routing, OVH, Gandi).
3. Note où sont gérés les **DNS** du domaine (c'est là que tu ajouteras deux ou trois enregistrements à l'étape 4).

Dis-moi le domaine et l'adresse : je les mets dans le code (`SITE_URL`, `[ADRESSE EMAIL]`).

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
   | `CONTACT_TO_EMAIL` | l'adresse qui doit recevoir les demandes (la tienne) |
   | `CONTACT_FROM_EMAIL` | une adresse sur le domaine vérifié, ex. `contact@nomade-project.fr` |

   Pour tester **avant** d'avoir un domaine : `CONTACT_FROM_EMAIL=onboarding@resend.dev` et `CONTACT_TO_EMAIL=` l'adresse avec laquelle tu as créé le compte Resend. Ça suffit pour recevoir les demandes ; seul l'accusé de réception au demandeur ne partira pas.

5. Ne mets **jamais** la clé dans le code ni dans un message : uniquement dans les variables d'environnement.

---

## Étape 5 — La vidéo du hero (dès que tu l'as)

Le hero est prêt à recevoir la vidéo ; en attendant il affiche l'image provisoire.

- Un fichier **MP4 H.264, 16:9, 1080p, sans piste audio, environ 8 secondes**, plan fixe.
- Le **poster** : la première image de la vidéo, en JPG ou PNG (je fais le WebP).
- Dépose-les dans le dépôt sous `assets/source/` (par exemple `hero-source.mp4` et `hero-poster.png`), ou envoie-les-moi. Je fais les encodages (1080p et 720p), la boucle fondue, le fondu d'entrée et le repli sans vidéo.

Les cinq visuels actuels sont générés par IA et portent un badge « image provisoire ». Ils ne peuvent pas partir en production : le build refusera tant qu'ils sont là. Remplace-les par tes photos quand tu en as (`src/assets/provisoire/`, mêmes noms de fichiers, et je retire les badges).

---

## Étape 6 — Les informations qui manquent sur le site

Chaque case correspond à un placeholder jaune. Le build de production refuse de partir tant qu'il en reste (`docs/PLACEHOLDERS.md` en donne la liste à jour après chaque `npm run build`).

- [ ] **Éducateur partenaire** : prénom, nom, diplôme exact (intitulé officiel), numéro de carte professionnelle, et s'il exerce en son nom propre ou via une structure.
- [ ] **Toi** : prénom et nom à afficher sur À propos, et la photo personnelle (Machu Picchu).
- [ ] **Adresse email publique** (étape 3).
- [ ] **Instagram** et **Facebook** : les liens, ou « pas de compte » et je retire la ligne.
- [ ] **Météo et annulation** : que se passe-t-il s'il pleut, si quelqu'un annule la veille, si toi tu annules ? Report, remboursement, acompte ? Deux ou trois phrases suffisent, je rédige.
- [ ] **Statut juridique** pour les pages légales : micro-entreprise (à confirmer), nom ou dénomination, SIRET, adresse, TVA applicable ou non (mention « TVA non applicable, art. 293 B du CGI » en micro-entreprise), médiateur de la consommation choisi, assureur responsabilité civile professionnelle.
- [ ] **Langues futures** éventuelles (anglais ?), pour préparer la configuration.

---

## Étape 7 — Tester

Quand les étapes 1, 2 et 4 sont faites :

1. Ouvre le site sur l'URL de prévisualisation donnée par l'hébergeur.
2. Remplis le formulaire avec ta propre adresse et envoie.
3. Tu dois recevoir l'email « Demande de session : … » dans la minute, et ton adresse de test doit recevoir « On a bien reçu ta demande ».
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
