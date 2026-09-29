/**
 * Protection de /admin : lit le cookie de session, expose l'utilisateur dans Astro.locals.user,
 * redirige vers la connexion sinon. Les pages publiques restent statiques : le middleware ne
 * s'exécute que pour les routes rendues à la demande.
 */
import { defineMiddleware } from 'astro:middleware';
import { COOKIE_NAME, getUserFromToken } from '@/lib/auth/session';

const PUBLIC_ADMIN = [/^\/admin\/connexion\/?$/, /^\/admin\/mot-de-passe(\/.*)?$/];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  if (!pathname.startsWith('/admin')) return next();

  const token = context.cookies.get(COOKIE_NAME)?.value;
  let user = null;
  try {
    user = await getUserFromToken(token);
  } catch (e) {
    console.error('[admin] base indisponible :', e);
    return new Response('Base de données indisponible. Vérifie la configuration Turso.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
  context.locals.user = user;

  const isPublic = PUBLIC_ADMIN.some((re) => re.test(pathname));
  if (!user && !isPublic) {
    const suite = encodeURIComponent(pathname + context.url.search);
    return context.redirect(`/admin/connexion/?suite=${suite}`, 303);
  }
  if (user && /^\/admin\/connexion\/?$/.test(pathname)) return context.redirect('/admin/', 303);

  const response = await next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('Referrer-Policy', 'same-origin');
  return response;
});
