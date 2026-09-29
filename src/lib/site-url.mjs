/**
 * Adresse publique du site : une seule source, la variable PUBLIC_SITE_URL (Vercel : Settings → Environment Variables).
 * Tant qu'elle n'est pas définie, le domaine provisoire ci-dessous sert partout (canonical, og:url, og:image,
 * sitemap, robots.txt) et le contrôle des placeholders le signale : la production reste bloquée.
 * Lu par astro.config.mjs (→ `site`, donc Astro.site dans les pages) et par scripts/check-placeholders.mjs.
 */
export const PLACEHOLDER_SITE_URL = 'https://nomade-project.example';

/** Adresse sans barre finale, ex. "https://exemple.fr". */
export const resolveSiteUrl = (value) => (String(value ?? '').trim() || PLACEHOLDER_SITE_URL).replace(/\/+$/, '');
