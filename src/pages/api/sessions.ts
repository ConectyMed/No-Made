/**
 * GET /api/sessions — sessions groupées publiées et à venir, pour « Prochaines sorties ».
 * Le site reste statique : ce bloc est rempli côté navigateur. Rien de privé ne sort d'ici
 * (ni lieu exact, ni notes, ni participants), seulement la zone et les places restantes.
 * ?id=<id> : une seule session (formulaire de demande de place).
 */
import type { APIRoute } from 'astro';
import { getPublicOuting, listPublicOutings, type PublicOuting } from '@/lib/crm/outings';
import { formatDateLong, formatTime } from '@/lib/dates';

export const prerender = false;

const view = (o: PublicOuting) => ({
  ...o,
  dateLabel: formatDateLong(o.startsAt).replace(/ \d{4}$/, ''),
  timeLabel: formatTime(o.startsAt).replace(':', 'h').replace(/^0/, ''),
  full: o.seatsLeft === 0,
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      // Une minute de cache CDN : les places restantes restent à peu près à jour.
      'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
    },
  });

export const GET: APIRoute = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    if (id) {
      const one = await getPublicOuting(id);
      return one ? json({ session: view(one) }) : json({ session: null }, 404);
    }
    return json({ sessions: (await listPublicOutings()).map(view) });
  } catch (e) {
    console.error('[sessions] lecture impossible :', e);
    return json({ sessions: [] }, 503);
  }
};
