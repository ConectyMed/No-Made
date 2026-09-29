/**
 * POST /admin/api/photos — envoi d'une photo d'article depuis l'admin (protégé par le middleware).
 * Corps : multipart, champs `file`, `width`, `height`. Réponse : { id, url }.
 */
import type { APIRoute } from 'astro';
import { MAX_PHOTO_BYTES, saveMedia, sniffImage } from '@/lib/crm/media';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return json({ error: 'Connexion requise.' }, 401);
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'Envoi illisible.' }, 400);
  }
  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) return json({ error: 'Aucune photo reçue.' }, 400);
  if (file.size > MAX_PHOTO_BYTES) return json({ error: 'Photo trop lourde (4 Mo au plus).' }, 413);

  const data = new Uint8Array(await file.arrayBuffer());
  const mime = sniffImage(data);
  if (!mime) return json({ error: 'Format non reconnu : JPEG, PNG ou WebP seulement.' }, 415);

  try {
    const id = await saveMedia(data, mime, Number(form.get('width')), Number(form.get('height')));
    return json({ id, url: `/photos/${id}` });
  } catch (e) {
    console.error('[photos] enregistrement impossible :', e);
    return json({ error: 'Enregistrement impossible, réessaie dans un instant.' }, 503);
  }
};
