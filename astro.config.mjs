// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// [À COMPLÉTER] : remplacer par le vrai domaine dès qu'il est choisi (ASCII, sans accent).
const SITE_URL = 'https://nomade-project.example';

export default defineConfig({
  site: SITE_URL,
  // Pages statiques servies par le CDN. Seul /api/contact (M3) tournera à la demande.
  output: 'static',
  // Portabilité : c'est la seule ligne liée à Vercel. Pour Netlify ou Cloudflare Pages,
  // remplacer par @astrojs/netlify ou @astrojs/cloudflare et rien d'autre ne change.
  adapter: vercel(),
  // /philosophie/ est rendue à la demande : on l'ajoute au plan du site à la main.
  integrations: [sitemap({ customPages: [`${SITE_URL}/philosophie/`] })],
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr'], // [À COMPLÉTER] : ajouter 'en' etc. plus tard, sans préfixe pour le français.
    routing: { prefixDefaultLocale: false },
  },
  build: {
    inlineStylesheets: 'auto',
  },
  trailingSlash: 'ignore',
});
