/**
 * Types partagés. `Session` est réservé pour la v2 (dates, capacité, paiement Stripe) :
 * rien ne l'utilise encore, mais le formulaire et les données sont pensés pour lui.
 */

export interface PriceLine {
  label: string;
  amountCents: number;
}

/** Une session datée, à venir en v2. Montants en centimes, comme Stripe. */
export interface Session {
  id: string;
  offerSlug: string;
  /** ISO 8601, ex. "2027-03-14T09:00:00+01:00" */
  startsAt: string;
  capacity: number;
  seatsLeft: number;
  priceCents: number;
  currency: 'EUR';
  status: 'draft' | 'open' | 'full' | 'cancelled';
}

/** Charge utile du formulaire "Demander une session" (M3). */
export interface SessionRequest {
  name: string;
  email: string;
  phone?: string;
  offerSlug: string;
  /** Réservé v2 : identifiant d'une session datée. Toujours null en v1. */
  sessionId: string | null;
  groupSize: number;
  preferredPeriod: string;
  message?: string;
  consent: true;
}
