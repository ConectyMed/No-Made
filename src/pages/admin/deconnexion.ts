/** POST /admin/deconnexion : ferme la session et renvoie à la page de connexion. */
import type { APIRoute } from 'astro';
import { COOKIE_NAME, clearSessionCookie, destroySession } from '@/lib/auth/session';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect }) => {
  await destroySession(cookies.get(COOKIE_NAME)?.value);
  clearSessionCookie(cookies);
  return redirect('/admin/connexion', 303);
};

export const GET: APIRoute = ({ redirect }) => redirect('/admin', 303);
