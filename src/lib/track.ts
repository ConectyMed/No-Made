/**
 * Événements de mesure d'audience (Vercel Web Analytics : sans cookie, sans donnée personnelle).
 * Le script est chargé par <Analytics /> dans src/layouts/Base.astro. Sans lui (bloqueur, autre hébergeur),
 * l'appel ne fait rien. Les événements personnalisés ne remontent qu'avec une offre Vercel qui les inclut ;
 * les pages vues, toujours.
 */
import { track as vercelTrack } from '@vercel/analytics';

export function track(name: string, data?: Record<string, string | number | boolean>): void {
  try {
    vercelTrack(name, data);
  } catch {
    /* la mesure ne doit jamais casser la page */
  }
}

/**
 * Clics sur les appels à l'action, par délégation (un seul écouteur pour tout le site) :
 *  - [data-track="nom"] : événement nommé ;
 *  - liens vers la visio (#visio, Cal.com) et bouton qui ouvre le calendrier : « clic-visio » ;
 *  - liens vers /contact/ : « clic-demande ».
 * La page d'origine accompagne chaque événement.
 */
export function trackClicks(): void {
  document.addEventListener('click', (e) => {
    const el = (e.target as Element | null)?.closest<HTMLElement>('a, button');
    if (!el) return;
    const from = location.pathname;
    const href = el instanceof HTMLAnchorElement ? el.getAttribute('href') ?? '' : '';
    if (el.dataset.track) track(el.dataset.track, { depuis: from });
    else if (el.hasAttribute('data-visio-open') || href.includes('#visio') || /cal\.com|calendly\.com/.test(href)) track('clic-visio', { depuis: from });
    else if (href.startsWith('/contact')) track('clic-demande', { depuis: from });
  });
}
