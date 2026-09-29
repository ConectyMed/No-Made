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

## Étape 4 — Resend, pour recevoir les demandes par email : fait (28 septembre 2026)

Compte créé, les trois variables sont dans Vercel. Reste, au lancement, la vérification du domaine (point 2) pour que l'accusé de réception parte vers n'importe quelle adresse.

Resend est le service qui envoie l'email quand quelqu'un remplit le formulaire. Gratuit jusqu'à 3 000 emails par mois.

1. Compte Resend : **créé** (2026-09-28).
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

Depuis le 28/09, le hero est en deux colonnes : le texte à gauche, la vidéo à droite qui fond dans le cadre, trois petites cartes (Marcher, Bouger, Respirer) posées dessus, et quatre repères en bas (2h30, 3h, 20 min, 0 écran). Les durées viennent des fiches d'offres et du bloc visio : si tu changes une durée dans `src/content/offers/fr/`, le hero suit. Aucun chiffre du type « 500 sorties, 1 000 participants » : on n'en a pas, on n'en invente pas.

Premières vraies photos reçues le 28 septembre 2026, dans `src/assets/photos/`, métadonnées retirées : l'escalier de montagne (accueil, « Marcher, randonner », Pérou), le coucher de soleil sur les rochers face à la mer (accueil, « Respirer, se concentrer », lieu à confirmer), le lac d'altitude (accueil, cadre Reconnexion, Pérou) et son portrait assis sur un rocher (À propos, Pérou). Les photos du Pérou portent une petite légende « Pérou », pour ne pas laisser croire que c'est la région : à retirer si tu préfères.

Un visuel reste généré par IA, avec le badge « image provisoire » qui bloque la production : la carte « Bouger » (accueil). Il manque donc une photo d'Anthony en train de faire un exercice au poids du corps ou de mobilité, dehors. Une photo parent / enfant en nature (avec l'accord des personnes) serait aussi la bienvenue pour le cadre Reconnexion, où le lac tient lieu d'ambiance en attendant.

Écartés : les deux photos au bord du lac et sur la plage où apparaissent d'autres personnes (pas d'accord de leur part, images floues), la plage tropicale vide (1280 px, floue) et la vidéo du lever de soleil sur la plage (848×480, trop petite pour un cadre du site, et hors sujet). Une vidéo utile serait filmée à l'horizontale, en 1080p, quelques secondes, en nature dans la région.

---

## Étape 6 — Les informations qui manquent sur le site

Chaque case correspond à un placeholder jaune. Le build de production refuse de partir tant qu'il en reste (`docs/PLACEHOLDERS.md` en donne la liste à jour après chaque `npm run build`).

- [x] **Lui** : prénom et parcours reçus (Anthony). Pas de diplôme ni de titre, et pas un mot sur le bar : c'est décidé.
- [x] **Son portrait** pour la page À propos : reçu le 28 septembre 2026 (photo de voyage, Pérou).
- [ ] **Son nom complet** pour les pages légales (éditeur, vendeur, responsable des données) : « Anthony A. » ne suffit pas là.
- [ ] **Tarif en solo** de la Nó Made Experience (aujourd'hui `[TARIF SOLO]`).
- [x] **Lien Cal.com** pour la visio : reçu le 28 septembre 2026 (`cal.com/nomadeproject/presentation`), en place.
- [ ] **Les trois avis** annoncés : prénom, initiale, texte, mois, offre, accord de la personne (étape 6 quater).
- [ ] **Adresse email publique** (étape 3).
- [ ] **Instagram** et **Facebook** : les liens, ou « pas de compte » et je retire la ligne.
- [ ] **Météo et annulation** : que se passe-t-il s'il pleut, si quelqu'un annule la veille, si toi tu annules ? Report, remboursement, acompte ? Deux ou trois phrases suffisent, je rédige.
- [ ] **Statut juridique** pour les pages légales : micro-entreprise (à confirmer), nom ou dénomination, SIRET, adresse, TVA applicable ou non (mention « TVA non applicable, art. 293 B du CGI » en micro-entreprise), médiateur de la consommation choisi, assureur responsabilité civile professionnelle.
- [ ] **Langues futures** éventuelles (anglais ?), pour préparer la configuration.

---

## Étape 6 bis — Le rendez-vous visio avec Cal.com (15 min, à faire par lui)

Le site propose une visio gratuite de 20 minutes avant de réserver. Google Agenda est écarté (pas de compte Google). Cal.com fait la même chose, gratuitement, avec un compte email classique, et se synchronise avec son agenda Outlook.

1. Créer un compte sur [cal.com](https://cal.com) avec son adresse email (pas besoin de Google). Choisir un nom d'utilisateur simple, par exemple `nomade` : il apparaîtra dans le lien.
2. **Settings → Calendars → Add** : connecter **Outlook Calendar** avec son compte Microsoft. Cal.com lira ses indisponibilités et y écrira les rendez-vous pris.
3. **Settings → Conferencing** : garder **Cal Video** (visio intégrée, gratuite, sans compte pour le visiteur). Microsoft Teams est possible aussi.
4. **Event Types → New** : nom « Échanger en visio », durée 20 min, lieu Cal Video. Dans **Availability**, ses jours et heures acceptés, et une marge entre deux rendez-vous. Enregistrer.
5. Copier le lien public de l'événement : `https://cal.com/<utilisateur>/<evenement>`. Me l'envoyer. Je le mets dans `src/data/site.ts` (`visio.url`) : le calendrier s'affiche alors dans la page Contact, au clic seulement, et le bouton « Réserver un créneau visio » se met à fonctionner partout.

Autres possibilités reconnues par le site si vous préférez : Calendly (plan gratuit, un seul type d'événement, synchronisation Outlook) ou Google Agenda si un compte Google apparaît un jour. Tout autre lien s'ouvrira simplement dans un nouvel onglet.

---

## Étape 6 quater — Les avis de participants

Le site a un emplacement pour les avis sur l'accueil, entre le déroulement et le bandeau prix. Depuis le 28 septembre 2026, deux **avis provisoires, inventés pour la maquette** (fichiers `karim-b.md`, `lea-d.md`) sont glissés dans la page comme des citations ; la troisième citation est de Saint-Exupéry (*Le Petit Prince*), courte citation attribuée, et peut rester ; la page À propos porte une citation de Montaigne (*Essais*, III, 3), domaine public, qui reste aussi. Ils portent un marqueur invisible `[AVIS PROVISOIRE]` : la production reste bloquée tant qu'ils sont là, comme pour les images provisoires.

Pour chaque avis, envoie-moi : le prénom et l'initiale du nom, le texte tel qu'il a été écrit, le mois de la session, l'offre concernée, d'où vient l'avis (email, message, oral), et la confirmation que la personne est d'accord pour être citée. Je crée un fichier par avis dans `src/content/testimonials/fr/` (modèle : `_modele.md`) et j'active la section. Pas d'étoiles ni de note : le texte et le prénom suffisent, c'est plus crédible.

---

## Étape 6 ter — L'espace admin (mini CRM)

L'admin est sur `/admin`. Il enregistre chaque demande du formulaire, en plus de l'email, et servira à suivre les sessions.

1. **Base de données** : fait (Turso, Irlande). Vérifie dans Vercel → Settings → Environment Variables que `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN` existent pour les trois environnements. Si l'intégration les a nommées autrement, dis-le-moi.
2. **Première connexion** : faite le 28 septembre 2026, mot de passe temporaire changé. Le mécanisme de compte de démarrage est désormais inactif (un compte existe). Pour changer de mot de passe : **Mon compte**.
3. **Le compte d'Anthony**, quand il en voudra un à lui : ajoute une variable `ADMIN_EMAILS` avec son adresse (et la tienne si tu veux un compte séparé), pour les trois environnements, Redeploy, puis il va sur `/admin/mot-de-passe`, saisit son adresse et reçoit un lien valable une heure. Tant que Resend n'est pas configuré (étape 4), l'email ne part pas et le lien est écrit dans les journaux de la fonction, sur Vercel → Deployments → le déploiement → Functions. Solution de repli depuis ton ordinateur : `TURSO_DATABASE_URL=… TURSO_AUTH_TOKEN=… node scripts/admin-user.mjs adresse "Prénom"`.
4. **Au quotidien** : Demandes → ouvrir une demande → « Répondre par email » ouvre la boîte mail avec un brouillon, la demande passe en « répondue ». Le statut, les notes sur la demande et sur la personne s'enregistrent dans le bloc Suivi. Le bouton Supprimer sert au droit à l'effacement (RGPD).

5. **Contacts** : une fiche par personne, créée à sa première demande, ou à la main (« Nouveau contact ») pour quelqu'un qui a appelé. Coordonnées, notes, historique des demandes et des sessions. Supprimer une fiche efface aussi ses demandes et ses participations.
6. **Sessions** : depuis une demande, « Planifier une session » crée la session avec la personne déjà inscrite, le nombre de personnes et un montant suggéré d'après l'offre ; la demande passe en « confirmée ». Ou « Rattacher à une session prévue » si la date existe déjà. Sur la session : participants (ajout depuis le carnet, retrait), date, lieu, durée, notes, montant (avec la suggestion recalculée selon le nombre de personnes, bouton « Utiliser »), et un bouton « Ajouter à mon agenda (.ics) » qu'Outlook ouvre directement.
7. **Paiement** : quand la session est passée, « Marquer faite » fige son montant, qui compte alors dans le chiffre d'affaires du tableau de bord. « Annuler la session » la garde dans l'historique sans la compter. Les deux sont réversibles.

8. **Tableau de bord** : en haut, ce qui attend (demandes à traiter, réponses attendues, sessions à venir, carnet) ; puis le chiffre du mois avec l'écart au mois précédent, le chiffre de l'année, les personnes emmenées, le taux de demandes converties ; enfin douze mois de chiffre en histogramme, la répartition par offre, les prochaines sessions et les dernières demandes. Tout le chiffre vient des sessions cochées « faite ».

Le contenu du site (textes, prix, photos) ne se modifie pas depuis l'admin : Anthony te transmet ses changements, tu me les passes ou tu modifies les fichiers indiqués dans le README.

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
