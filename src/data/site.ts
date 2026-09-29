/**
 * Identité du site. Un seul endroit à modifier.
 * Les valeurs entre [CROCHETS] sont des placeholders : le build de production
 * refuse de partir tant qu'il en reste.
 *
 * Le site est celui de la personne qui encadre les sessions. Il parle en « je ».
 */
export const site = {
  name: "No'Made", // titres, métadonnées
  shortName: "No'Made", // wordmark de la nav
  slug: 'nomade-project', // ASCII, sans accent : slugs, domaine, fichiers
  area: 'PACA',
  areaLong: 'Provence-Alpes-Côte d’Azur',
  /** Où ont lieu les sessions : repris dans le hero, les offres, la FAQ, les mentions légales, le JSON-LD. */
  places: ['Marseille', 'Cannes', 'Saint-Tropez'],
  zone: 'Marseille, Cannes, Saint-Tropez et alentours',
  locale: 'fr-FR',

  /** Prénom de la personne qui encadre : À propos, signature de l'email de confirmation. */
  ownerFirstName: 'Anthony',

  /** Une ligne, reprise dans le pied de page et les métadonnées. */
  tagline: 'Marche, mouvement et respiration, dehors, en solo ou en petit groupe.',

  /** Adresse publique. Phase de dev : la boîte Outlook ; plus tard contact@<domaine> redirigée vers elle. */
  email: 'nomadeproject@outlook.fr',
  phone: null as string | null, // affiché seulement si renseigné

  /**
   * Rendez-vous visio avant de réserver. Coller ici l'URL publique de la page de réservation.
   * Reconnus et affichés dans la page : Cal.com (recommandé, https://cal.com/<utilisateur>/<evenement>),
   * Calendly, Google Agenda (planning de rendez-vous). Toute autre URL s'ouvre dans un nouvel onglet.
   */
  visio: {
    url: 'https://cal.com/nomadeproject/presentation',
    duration: '20 minutes',
  },

  /** Réseaux : placeholders tant que les comptes n'existent pas. */
  social: [
    { label: 'Instagram', href: '#', placeholder: '[LIEN INSTAGRAM]' },
    { label: 'Facebook', href: '#', placeholder: '[LIEN FACEBOOK]' },
  ],

  /** Interrupteurs de contenu. */
  showTestimonials: true, // avis provisoires depuis le 2026-09-28 ; à remplacer par les vrais (voir GUIDE, étape 6 quater)
} as const;

/** Libellé du CTA principal, identique partout (design.md §2). */
export const CTA_LABEL = 'Demander une session';
export const CTA_HREF = '/contact/';

/** CTA secondaire : échanger en visio avant de réserver. */
export const VISIO_LABEL = 'Réserver un créneau visio';
export const VISIO_HREF = '/contact/#visio';

export const nav = [
  { href: '/', label: 'Accueil' },
  { href: '/offres/', label: 'Offres' },
  { href: '/a-propos/', label: 'À propos' },
  { href: '/contact/', label: 'Contact' },
] as const;

export const legalLinks = [
  { href: '/mentions-legales/', label: 'Mentions légales' },
  { href: '/cgv/', label: 'CGV' },
  { href: '/confidentialite/', label: 'Confidentialité' },
] as const;
