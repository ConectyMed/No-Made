/**
 * Montant suggéré pour une session, d'après l'offre et le nombre de personnes.
 * Toujours modifiable à la main : les prix sont des tarifs de lancement et le tarif solo n'existe pas encore.
 */
import { getCollection } from 'astro:content';

export interface OfferOption {
  slug: string;
  label: string;
  durationMin: number | null;
}

/** "2h30" → 150, "3h" → 180, "45 min" → 45. */
export function parseDurationMin(s: string): number | null {
  const h = /(\d+)\s*h\s*(\d{1,2})?/i.exec(s);
  if (h) return Number(h[1]) * 60 + Number(h[2] ?? 0);
  const m = /(\d+)\s*min/i.exec(s);
  return m ? Number(m[1]) : null;
}

export async function offerOptions(): Promise<OfferOption[]> {
  const offers = (await getCollection('offers', ({ filePath }) => filePath?.includes('/offers/fr/'))).sort(
    (a, b) => a.data.order - b.data.order,
  );
  return offers.map((o) => ({ slug: o.data.slug, label: `${o.data.title} (${o.data.duration})`, durationMin: parseDurationMin(o.data.duration) }));
}

export interface Suggestion {
  amountCents: number | null;
  reason: string;
}

export async function suggestAmount(offerSlug: string, people: number): Promise<Suggestion> {
  const offers = await getCollection('offers', ({ filePath }) => filePath?.includes('/offers/fr/'));
  const offer = offers.find((o) => o.data.slug === offerSlug);
  if (!offer || people <= 0) return { amountCents: null, reason: 'Pas de participant pour l’instant.' };
  const pricing = offer.data.pricing;

  if (offerSlug === 'reconnexion-parent-enfant') {
    const duo = pricing.find((p) => /duo/i.test(p.label))?.amountCents;
    const four = pricing.find((p) => /4/.test(p.label))?.amountCents;
    if (people <= 2 && duo !== undefined) return { amountCents: duo, reason: 'tarif duo' };
    if (four !== undefined) return { amountCents: four, reason: 'tarif pour 4 personnes' };
  }

  const perPerson = pricing.find((p) => /personne/i.test(p.label) && p.amountCents !== undefined);
  const solo = pricing.find((p) => /solo/i.test(p.label));
  if (people <= 2 && solo && solo.amountCents === undefined) {
    return { amountCents: null, reason: 'tarif solo pas encore fixé : à saisir à la main' };
  }
  if (perPerson?.amountCents !== undefined) {
    return { amountCents: perPerson.amountCents * people, reason: `${people} × ${perPerson.amountCents / 100} €` };
  }
  const first = pricing.find((p) => p.amountCents !== undefined);
  return first?.amountCents !== undefined ? { amountCents: first.amountCents, reason: first.label } : { amountCents: null, reason: 'pas de prix connu' };
}

/** "90", "90,50", "90.5 €" → centimes. null si illisible. */
export function parseEuros(s: string): number | null {
  const clean = s.replace(/[€\s]/g, '').replace(',', '.');
  if (!clean) return 0;
  const n = Number(clean);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}
