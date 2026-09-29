/**
 * Articles de la page « Ma philosophie » : écrits et publiés depuis l'admin, lus par /philosophie/.
 * Un brouillon n'est jamais visible sur le site. La date de publication est fixée à la première publication.
 */
import { and, desc, eq, ne } from 'drizzle-orm';
import { getDb, schema } from '../db';
import { ARTICLE_STATUSES, type Article, type ArticleStatus } from '../db/schema';
import { deleteUnusedMedia, mediaIdsOf } from './media';

const now = () => Date.now();

export function isArticleStatus(s: unknown): s is ArticleStatus {
  return typeof s === 'string' && (ARTICLE_STATUSES as readonly string[]).includes(s);
}

/** « Marcher, c'est penser » → « marcher-c-est-penser ». ASCII, sans accent. */
export function slugify(s: string): string {
  return (
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/œ/g, 'oe')
      .replace(/æ/g, 'ae')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80)
      .replace(/-+$/, '') || 'article'
  );
}

/** Adresse libre : ajoute -2, -3… si une autre fiche l'utilise déjà. */
async function uniqueSlug(base: string, exceptId?: string): Promise<string> {
  const db = await getDb();
  for (let n = 1; n < 100; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const taken = await db.query.articles.findFirst({
      where: exceptId ? and(eq(schema.articles.slug, candidate), ne(schema.articles.id, exceptId)) : eq(schema.articles.slug, candidate),
      columns: { id: true },
    });
    if (!taken) return candidate;
  }
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

export interface ArticleInput {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: ArticleStatus;
  /** Photo de couverture (id de la table media) et sa description ; vides = pas de couverture. */
  coverId: string;
  coverAlt: string;
}

/** Lit le formulaire de l'admin. Renvoie une erreur lisible si le titre manque. */
export function readArticleForm(form: FormData): { input: ArticleInput; error: string | null } {
  const status = form.get('status');
  const input: ArticleInput = {
    title: String(form.get('title') ?? '').trim().slice(0, 200),
    slug: String(form.get('slug') ?? '').trim(),
    excerpt: String(form.get('excerpt') ?? '').trim().slice(0, 400),
    body: String(form.get('body') ?? '').slice(0, 100_000),
    status: isArticleStatus(status) ? status : 'brouillon',
    coverId: /^[0-9a-f-]{36}$/.test(String(form.get('coverId') ?? '')) ? String(form.get('coverId')) : '',
    coverAlt: String(form.get('coverAlt') ?? '').trim().slice(0, 200),
  };
  let error: string | null = null;
  if (!input.title) error = 'Il faut un titre.';
  else if (input.status === 'publie' && !input.body.trim()) error = 'Le texte est vide : enregistre-le en brouillon, ou écris-le avant de publier.';
  else if (input.status === 'publie' && input.coverId && !input.coverAlt)
    error = 'Décris la photo de couverture (« Ce qu’on voit sur la photo ») avant de publier : c’est le texte lu à la place de l’image.';
  return { input, error };
}

export async function createArticle(input: ArticleInput): Promise<string> {
  const db = await getDb();
  const id = crypto.randomUUID();
  const t = now();
  await db.insert(schema.articles).values({
    id,
    slug: await uniqueSlug(slugify(input.slug || input.title)),
    title: input.title,
    excerpt: input.excerpt || null,
    body: input.body,
    status: input.status,
    coverId: input.coverId || null,
    coverAlt: input.coverId ? input.coverAlt || null : null,
    publishedAt: input.status === 'publie' ? t : null,
    createdAt: t,
    updatedAt: t,
  });
  return id;
}

export async function updateArticle(id: string, input: ArticleInput): Promise<void> {
  const db = await getDb();
  const current = await getArticle(id);
  if (!current) return;
  await db
    .update(schema.articles)
    .set({
      slug: await uniqueSlug(slugify(input.slug || input.title), id),
      title: input.title,
      excerpt: input.excerpt || null,
      body: input.body,
      status: input.status,
      coverId: input.coverId || null,
      coverAlt: input.coverId ? input.coverAlt || null : null,
      publishedAt: input.status === 'publie' ? (current.publishedAt ?? now()) : current.publishedAt,
      updatedAt: now(),
    })
    .where(eq(schema.articles.id, id));
  // Photos retirées du texte ou couverture remplacée : on les efface si plus rien ne s'en sert.
  const kept = new Set(mediaIdsOf({ body: input.body, coverId: input.coverId || null }));
  await deleteUnusedMedia(mediaIdsOf(current).filter((m) => !kept.has(m)));
}

export async function deleteArticle(id: string): Promise<void> {
  const db = await getDb();
  const current = await getArticle(id);
  await db.delete(schema.articles).where(eq(schema.articles.id, id));
  if (current) await deleteUnusedMedia(mediaIdsOf(current));
}

export async function getArticle(id: string): Promise<Article | null> {
  const db = await getDb();
  return (await db.query.articles.findFirst({ where: eq(schema.articles.id, id) })) ?? null;
}

/** Tous les articles pour l'admin, les plus récemment modifiés d'abord. */
export async function listArticles(): Promise<Article[]> {
  const db = await getDb();
  return db.select().from(schema.articles).orderBy(desc(schema.articles.updatedAt)).limit(500);
}

// ---------- Site public ----------

export async function listPublishedArticles(): Promise<Article[]> {
  const db = await getDb();
  return db
    .select()
    .from(schema.articles)
    .where(eq(schema.articles.status, 'publie'))
    .orderBy(desc(schema.articles.publishedAt))
    .limit(200);
}

export async function getPublishedArticle(slug: string): Promise<Article | null> {
  const db = await getDb();
  return (
    (await db.query.articles.findFirst({
      where: and(eq(schema.articles.slug, slug), eq(schema.articles.status, 'publie')),
    })) ?? null
  );
}
