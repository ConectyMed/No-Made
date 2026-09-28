/**
 * Collections de contenu. Les offres sont des fichiers Markdown dans
 * src/content/offers/<locale>/. Le schéma ci-dessous valide chaque fichier au build.
 *
 * Règle design.md §2 : une offre ne peut décrire de la mobilité ou de l'exercice physique
 * que si elle est encadrée par l'éducateur partenaire, nommé. D'où `partnerLed` + `partnerName`.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const price = z.object({
  /** Libellé affiché après le montant : "par personne", "le duo père / fils"… */
  label: z.string(),
  /** Montant en centimes d'euro. Entier, prêt pour Stripe. */
  amountCents: z.number().int().nonnegative(),
});

const offers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/offers' }),
  schema: z
    .object({
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
      partnerLed: z.boolean().default(false),
      partnerName: z.string().optional(),
      order: z.number().int().default(0),
    })
    .refine((o) => !o.partnerLed || (o.partnerName && o.partnerName.length > 0), {
      message: 'Une offre avec partnerLed: true doit nommer le partenaire (partnerName).',
      path: ['partnerName'],
    }),
});

export const collections = { offers };
