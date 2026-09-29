// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { loadEnv } from 'vite';
import { resolveSiteUrl } from './src/lib/site-url.mjs';

// Domaine : variable PUBLIC_SITE_URL (voir src/lib/site-url.mjs), domaine provisoire tant qu'elle manque.
const SITE_URL = resolveSiteUrl(
  process.env.PUBLIC_SITE_URL ?? loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), 'PUBLIC_').PUBLIC_SITE_URL,
);

export default defineConfig({
  site: SITE_URL,
  // Pages statiques servies par le CDN. Seul /api/contact (M3) tournera à la demande.
  output: 'static',
  // Portabilité : c'est la seule ligne liée à Vercel. Pour Netlify ou Cloudflare Pages,
  // remplacer par @astrojs/netlify ou @astrojs/cloudflare et rien d'autre ne change.
  adapter: vercel(),
  // /philosophie/ est rendue à la demande : on l'ajoute au plan du site à la main.
  // L'admin (privée, noindex) n'a rien à faire dans le plan du site.
  integrations: [
    sitemap({
      customPages: [`${SITE_URL}/philosophie/`],
      filter: (page) => !new URL(page).pathname.startsWith('/admin/'),
    }),
  ],
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr'], // [À COMPLÉTER] : ajouter 'en' etc. plus tard, sans préfixe pour le français.
    routing: { prefixDefaultLocale: false },
  },
  build: {
    inlineStylesheets: 'auto',
  },
  // Une seule forme d'adresse, avec barre finale : /contact/, /philosophie/mon-texte/. Canonical, sitemap et liens
  // internes suivent ; une adresse sans barre est redirigée (301, ou 308 pour un envoi de formulaire).
  trailingSlash: 'always',
});
