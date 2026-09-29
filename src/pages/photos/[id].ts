/**
 * GET /photos/<id> — une photo d'article, lue dans la base.
 * Un id ne change jamais de contenu : cache d'un an, navigateur et CDN.
 */
import type { APIRoute } from 'astro';
import { getMedia } from '@/lib/crm/media';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const id = params.id ?? '';
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response('Introuvable', { status: 404 });
  try {
    const m = await getMedia(id);
    if (!m) return new Response('Introuvable', { status: 404, headers: { 'Cache-Control': 'public, max-age=60' } });
    return new Response(new Uint8Array(m.data), {
      headers: {
        'Content-Type': m.mime,
        'Content-Length': String(m.bytes),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (e) {
    console.error('[photos] lecture impossible :', e);
    return new Response('Indisponible', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
};
