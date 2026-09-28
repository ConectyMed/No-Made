/**
 * Identité du site. Un seul endroit à modifier.
 * Les valeurs entre [CROCHETS] sont des placeholders : le build de production
 * refusera de partir tant qu'il en reste (script ajouté au jalon M4).
 */
export const site = {
  name: 'Nó Made Project', // titres, métadonnées
  shortName: 'Nó Made', // wordmark de la nav
  slug: 'nomade-project', // ASCII, sans accent : slugs, domaine, fichiers
  area: 'PACA',
  areaLong: 'Provence-Alpes-Côte d’Azur',
  locale: 'fr-FR',

  /** Adresse publique. Phase de dev : la boîte Outlook ; plus tard contact@<domaine> redirigée vers elle. */
  email: 'nomadeproject@outlook.fr',
  phone: null as string | null, // affiché seulement si renseigné

  /** Réseaux : placeholders tant que les comptes n'existent pas. */
  social: [
    { label: 'Instagram', href: '#', placeholder: '[LIEN INSTAGRAM]' },
    { label: 'Facebook', href: '#', placeholder: '[LIEN FACEBOOK]' },
  ],

  /** Interrupteurs de contenu. */
  showTestimonials: false, // passe à true seulement avec de vrais témoignages
} as const;

/** Libellé du CTA principal, identique partout (design.md §2). */
export const CTA_LABEL = 'Demander une session';
export const CTA_HREF = '/contact/';

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
