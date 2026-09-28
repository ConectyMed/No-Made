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
    /** "Prix de test, susceptibles de changer" : affiché tant que true. */
    testPrice: z.boolean().default(true),
    forWhom: z.string(),
    includes: z.array(z.string()).min(1),
    bring: z.array(z.string()).min(1),
    order: z.number().int().default(0),
  }),
});

export const collections = { offers };
