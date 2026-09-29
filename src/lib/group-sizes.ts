/**
 * « Combien de personnes ? » selon la session choisie. Partagé par le formulaire (liste filtrée dans
 * le navigateur) et /api/contact (validation serveur). Session inconnue ou « Je ne sais pas encore » : tout.
 */
export interface SizeOption {
  value: number;
  label: string;
}

export const ALL_SIZES: SizeOption[] = [
  { value: 1, label: 'Juste moi' },
  { value: 2, label: '2 personnes' },
  { value: 3, label: '3 personnes' },
  { value: 4, label: '4 personnes' },
  { value: 5, label: '5 personnes' },
];

export const SIZES_BY_OFFER: Record<string, SizeOption[]> = {
  'experience-corps-aventure': ALL_SIZES,
  'reconnexion-parent-enfant': [
    { value: 2, label: '2 personnes (1 parent + 1 enfant)' },
    { value: 4, label: '4 personnes (2 duos)' },
  ],
};

export const sizesFor = (offerSlug: string | null | undefined): SizeOption[] =>
  (offerSlug && SIZES_BY_OFFER[offerSlug]) || ALL_SIZES;
