/**
 * GET /admin/sessions/<id>.ics : la session au format iCalendar, pour l'ajouter à Outlook, Apple
 * Calendrier ou n'importe quel agenda. Protégé par le middleware comme le reste de /admin.
 */
import type { APIRoute } from 'astro';
import { getOuting } from '@/lib/crm/outings';
import { toGoogleUtc } from '@/lib/dates';
import { site } from '@/data/site';

export const prerender = false;

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const fold = (line: string) => line.match(/.{1,70}/gs)?.join('\r\n ') ?? line;

export const GET: APIRoute = async ({ params, url }) => {
  const data = await getOuting(params.id ?? '');
  if (!data) return new Response('Session introuvable', { status: 404 });
  const { outing: o, participants, people } = data;
  const end = o.startsAt + (o.durationMin ?? 150) * 60_000;
  const who = participants.map((p) => `${p.contact.name} (${p.participant.people})`).join(', ') || 'à confirmer';
  const description = [`${people} personne${people > 1 ? 's' : ''} : ${who}`, o.notes ?? '', `Admin : ${new URL(`/admin/sessions/${o.id}`, url.origin)}`]
    .filter(Boolean)
    .join('\n');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${site.name}//Admin//FR`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${o.id}@nomade-project`,
    `DTSTAMP:${toGoogleUtc(Date.now())}`,
    `DTSTART:${toGoogleUtc(o.startsAt)}`,
    `DTEND:${toGoogleUtc(end)}`,
    `SUMMARY:${esc(`${site.shortName} · ${o.offerLabel}`)}`,
    o.place ? `LOCATION:${esc(o.place)}` : '',
    `DESCRIPTION:${esc(description)}`,
    `URL:${new URL(`/admin/sessions/${o.id}`, url.origin)}`,
    `STATUS:${o.status === 'annulee' ? 'CANCELLED' : 'CONFIRMED'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);
  const body = lines.map(fold).join('\r\n') + '\r\n';
  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="nomade-session-${toGoogleUtc(o.startsAt).slice(0, 8)}.ics"`,
      'Cache-Control': 'no-store',
    },
  });
};
