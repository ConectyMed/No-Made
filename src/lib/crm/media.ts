/**
 * Photos des articles, stockées dans la base (table media) : pas de service de fichiers à configurer.
 * Le navigateur les réduit avant l'envoi (1400 px de côté au plus, WebP ou JPEG, voir ArticleForm), elles
 * pèsent donc quelques centaines de Ko. Servies par /photos/<id>, en cache long : un id ne change jamais de contenu.
 */
import { eq, inArray, like, or } from 'drizzle-orm';
import { getDb, schema } from '../db';

/** Au-delà, refusé : une photo réduite fait bien moins ; la limite de Vercel pour une requête est 4,5 Mo. */
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

const MEDIA_URL_RE = /\/photos\/([0-9a-f-]{36})/g;

/** Type réel d'après les premiers octets : on ne se fie pas au nom ni au type annoncé. */
export function sniffImage(buf: Uint8Array): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  const ascii = (a: number, b: number) => String.fromCharCode(...buf.subarray(a, b));
  if (buf.length > 12 && ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  return null;
}

export async function saveMedia(data: Uint8Array, mime: string, width: number, height: number): Promise<string> {
  const db = await getDb();
  const id = crypto.randomUUID();
  await db.insert(schema.media).values({
    id,
    mime,
    width: Math.max(1, Math.round(width) || 1),
    height: Math.max(1, Math.round(height) || 1),
    bytes: data.byteLength,
    data: Buffer.from(data),
    createdAt: Date.now(),
  });
  return id;
}

export async function getMedia(id: string) {
  const db = await getDb();
  return (await db.query.media.findFirst({ where: eq(schema.media.id, id) })) ?? null;
}

/** Dimensions des photos citées, pour réserver leur place dans la page (pas de saut à l'affichage). */
export async function mediaDims(ids: string[]): Promise<Record<string, { width: number; height: number }>> {
  if (!ids.length) return {};
  const db = await getDb();
  const rows = await db
    .select({ id: schema.media.id, width: schema.media.width, height: schema.media.height })
    .from(schema.media)
    .where(inArray(schema.media.id, ids));
  return Object.fromEntries(rows.map((r) => [r.id, { width: r.width, height: r.height }]));
}

/** Ids des photos d'un article : sa couverture et celles insérées dans le texte. */
export function mediaIdsOf(a: { body: string; coverId: string | null }): string[] {
  const ids = new Set([...a.body.matchAll(MEDIA_URL_RE)].map((m) => m[1]));
  if (a.coverId) ids.add(a.coverId);
  return [...ids];
}

/** Supprime les photos que plus aucun article n'utilise (après une modification ou une suppression). */
export async function deleteUnusedMedia(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const db = await getDb();
  for (const id of ids) {
    const used = await db.query.articles.findFirst({
      where: or(eq(schema.articles.coverId, id), like(schema.articles.body, `%/photos/${id}%`)),
      columns: { id: true },
    });
    if (!used) await db.delete(schema.media).where(eq(schema.media.id, id));
  }
}
