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
