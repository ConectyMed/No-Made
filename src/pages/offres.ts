/**
 * Ancienne adresse : la page Offres est devenue Expériences (2026-09-29).
 * Une route serveur plutôt que `redirects` dans astro.config : celle-ci ne couvre pas /offres/ (avec la barre).
 */
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = () =>
  new Response(null, { status: 301, headers: { Location: '/experiences/', 'Cache-Control': 'public, max-age=86400' } });
