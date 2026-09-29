/**
 * Collections de contenu. Les offres sont des fichiers Markdown dans
 * src/content/offers/<locale>/. Le schéma ci-dessous valide chaque fichier au build.
 *
 * Un prix a soit un montant en centimes, soit un placeholder visible ("[TARIF SOLO]") tant que
 * le montant n'est pas connu : rien d'inventé ne part en production.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const price = z
  .object({
    /** Libellé affiché après le montant : "par personne", "le duo parent / enfant"… */
    label: z.string(),
    /** Montant en centimes d'euro. Entier, prêt pour Stripe. */
    amountCents: z.number().int().nonnegative().optional(),
    /** Texte du placeholder, sans crochets, quand le montant n'est pas encore fixé. */
    placeholder: z.string().optional(),
  })
  .refine((p) => p.amountCents !== undefined || (p.placeholder && p.placeholder.length > 0), {
    message: 'Un prix a un montant (amountCents) ou un placeholder.',
    path: ['amountCents'],
  });

const offers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/offers' }),
  schema: z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/, 'slug ASCII, minuscules et tirets'),
    title: z.string(),
    category: z.string(),
    summary: z.string(),
    duration: z.string(),
    groupSize: z.string(),
    pricing: z.array(price).min(1),
    /** "Tarif de lancement, susceptible d’évoluer" : affiché tant que true. */
    testPrice: z.boolean().default(true),
    forWhom: z.string(),
    includes: z.array(z.string()).min(1),
    bring: z.array(z.string()).min(1),
    order: z.number().int().default(0),
  }),
});

/**
 * Témoignages : uniquement de vraies personnes, avec leur accord. Prénom et initiale suffisent.
 * Un fichier dont le nom commence par _ est ignoré (sert de modèle).
 */
const testimonials = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/testimonials' }),
  schema: z.object({
    /** Ex. "Camille R." */
    name: z.string().min(2),
    /** Mois de la session, ex. "2026-10" */
    date: z.string().regex(/^\d{4}-\d{2}$/, 'format AAAA-MM'),
    /** Slug de l'offre concernée, ou vide. */
    offerSlug: z.string().optional(),
    /** D'où vient l'avis : email, message, oral… (interne, non affiché) */
    source: z.string().optional(),
    /** La personne a donné son accord pour être citée sur le site. Obligatoire pour un vrai avis. */
    consent: z.boolean().default(false),
    /**
     * Avis provisoire, inventé pour la maquette (décision du 2026-09-28). Il porte un marqueur
     * [AVIS PROVISOIRE] invisible à l'écran mais vu par le contrôle des placeholders : la production
     * reste bloquée tant qu'il n'est pas remplacé par un vrai avis.
     */
    provisional: z.boolean().default(false),
    order: z.number().int().default(0),
  })
  .refine((t) => t.provisional || t.consent === true, {
    message: 'Un vrai avis exige consent: true ; un avis inventé exige provisional: true.',
    path: ['consent'],
  }),
});

export const collections = { offers, testimonials };
