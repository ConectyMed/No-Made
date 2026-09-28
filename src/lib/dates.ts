/** Dates en français, fuseau Europe/Paris, à partir de millisecondes. */
const TZ = 'Europe/Paris';

export function formatDateTime(ms: number): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: TZ }).format(ms);
}

export function formatDate(ms: number): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeZone: TZ }).format(ms);
}

export function formatDateLong(ms: number): string {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ }).format(ms);
}

export function formatTime(ms: number): string {
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: TZ }).format(ms);
}

/** "il y a 3 j", "il y a 2 h", "à l'instant". */
export function formatRelative(ms: number, now = Date.now()): string {
  const diff = now - ms;
  const min = Math.round(diff / 60_000);
  if (min < 1) return 'à l’instant';
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  if (d < 30) return `il y a ${d} j`;
  return formatDate(ms);
}

// ---------- Saisie de dates locales (Europe/Paris) ----------

/** Décalage (minutes) entre l'heure de Paris et UTC à un instant donné. */
function parisOffsetMinutes(ms: number): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(ms);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return Math.round((asUtc - ms) / 60_000);
}

/** "2026-10-18" + "09:00" (heure de Paris) → millisecondes. null si invalide. */
export function parisToMs(date: string, time: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^(\d{2}):(\d{2})$/.exec(time || '00:00');
  if (!m || !t) return null;
  const guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +t[1], +t[2]);
  let ms = guess - parisOffsetMinutes(guess) * 60_000;
  ms = guess - parisOffsetMinutes(ms) * 60_000; // second passage pour les bascules d'heure d'été
  return Number.isFinite(ms) ? ms : null;
}

/** Millisecondes → { date: "2026-10-18", time: "09:00" } en heure de Paris, pour préremplir un formulaire. */
export function msToParisParts(ms: number): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(ms);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
}

/** Début du mois courant (heure de Paris), en millisecondes. */
export function startOfParisMonth(ms = Date.now()): number {
  const { date } = msToParisParts(ms);
  return parisToMs(date.slice(0, 7) + '-01', '00:00') ?? ms;
}

/** Début de l'année courante (heure de Paris). */
export function startOfParisYear(ms = Date.now()): number {
  const { date } = msToParisParts(ms);
  return parisToMs(date.slice(0, 4) + '-01-01', '00:00') ?? ms;
}

/** Format Google Agenda : 20261018T070000Z */
export function toGoogleUtc(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}
