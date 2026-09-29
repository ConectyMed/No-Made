/**
 * POST /api/contact — réception d'une demande de session.
 *
 * Étapes : lecture du formulaire → anti-spam (champ piège, délai minimum, Turnstile si configuré)
 * → validation → session datée éventuelle (place demandée sur une sortie groupée publiée) → (persistance : rien en v1, réservé aux sessions datées) → email au propriétaire
 * → accusé de réception au demandeur → réponse JSON ou redirection.
 *
 * Seule route servie à la demande (fonction serverless) ; tout le reste du site est statique.
 */
import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import { getCollection } from 'astro:content';
import { sendMail, mailConfig, escapeHtml } from '@/lib/mail';
import { env, isDev } from '@/lib/env';
import { site } from '@/data/site';
import { createRequest } from '@/lib/crm/requests';
import { getPublicOuting, type PublicOuting } from '@/lib/crm/outings';
import { formatDateLong, formatTime } from '@/lib/dates';
import type { SessionRequest } from '@/lib/types';

export const prerender = false;

const MIN_FILL_TIME_MS = 3000;
const MAX_BODY_BYTES = 20_000;

const schema = z.object({
  name: z.string().trim().min(2, 'Ton nom est trop court.').max(120),
  email: z.string().trim().email('Cette adresse email ne semble pas valide.').max(200),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  offerSlug: z.string().trim().min(1, 'Choisis une session.').max(80),
  groupSize: z.coerce.number().int().min(1, 'Au moins une personne.').max(5, 'Cinq personnes maximum par session.'),
  preferredPeriod: z.string().trim().max(200).optional().or(z.literal('')),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
  /** Sortie groupée publiée sur le site (facultatif). */
  sessionId: z.string().trim().max(80).optional().or(z.literal('')),
  // Pas de case à cocher : répondre à une demande est une mesure précontractuelle (RGPD, art. 6.1.b),
  // la mention sous le bouton informe. Le champ reste accepté pour les anciens formulaires en cache.
  consent: z.unknown().optional(),
  // anti-spam
  website: z.string().max(200).optional().or(z.literal('')),
  startedAt: z.coerce.number().optional(),
  'cf-turnstile-response': z.string().optional(),
});

type Parsed = z.infer<typeof schema>;

async function readBody(request: Request): Promise<Record<string, unknown>> {
  const type = request.headers.get('content-type') ?? '';
  if (type.includes('application/json')) return (await request.json()) as Record<string, unknown>;
  const form = await request.formData();
  return Object.fromEntries(form.entries());
}

function wantsJson(request: Request): boolean {
  const accept = request.headers.get('accept') ?? '';
  return accept.includes('application/json') || request.headers.get('x-requested-with') === 'fetch';
}

function respond(request: Request, status: number, payload: Record<string, unknown>, redirectTo: string) {
  if (wantsJson(request)) {
    return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(null, { status: 303, headers: { Location: redirectTo } });
}

async function verifyTurnstile(token: string | undefined, ip: string | undefined): Promise<boolean> {
  const secret = env('TURNSTILE_SECRET_KEY');
  // Turnstile dormant tant que les deux clés ne sont pas là : sans clé publique, le formulaire n'affiche
  // pas le widget, et exiger un jeton bloquerait toutes les demandes.
  if (!secret || !env('PUBLIC_TURNSTILE_SITE_KEY')) return true;
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean };
  return data.success === true;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const okUrl = '/contact/?envoye=1#merci';
  const errUrl = '/contact/?erreur=1#erreur';

  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > MAX_BODY_BYTES) return respond(request, 413, { ok: false, error: 'Message trop long.' }, errUrl);

  let raw: Record<string, unknown>;
  try {
    raw = await readBody(request);
  } catch {
    return respond(request, 400, { ok: false, error: 'Formulaire illisible.' }, errUrl);
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors = Object.fromEntries(
      parsed.error.issues.map((i) => [String(i.path[0] ?? 'form'), i.message]),
    );
    return respond(request, 422, { ok: false, errors }, errUrl);
  }
  const data: Parsed = parsed.data;

  // --- Anti-spam : on répond "ok" sans rien envoyer, pour ne pas renseigner les robots.
  const tooFast = data.startedAt ? Date.now() - data.startedAt < MIN_FILL_TIME_MS : false;
  if (data.website || tooFast) {
    return respond(request, 200, { ok: true, skipped: true }, okUrl);
  }
  if (!(await verifyTurnstile(data['cf-turnstile-response'], clientAddress))) {
    return respond(request, 403, { ok: false, error: 'Vérification anti-spam échouée. Réessaie.' }, errUrl);
  }

  // --- Session datée (place demandée sur une sortie groupée publiée). Une date passée, complète ou
  //     dépubliée n'empêche pas la demande : elle arrive comme une demande classique.
  let outing: PublicOuting | null = null;
  if (data.sessionId) {
    try {
      outing = await getPublicOuting(data.sessionId);
    } catch (e) {
      console.error('[contact] lecture de la session impossible :', e);
    }
    if (outing?.seatsLeft === 0) outing = null;
  }
  const outingLabel = outing ? `${formatDateLong(outing.startsAt)}, ${formatTime(outing.startsAt)}${outing.area ? ` (${outing.area})` : ''}` : null;

  // --- Libellé de l'offre
  const offers = await getCollection('offers');
  const offerSlug = outing?.offerSlug ?? data.offerSlug;
  const offer = offers.find((o) => o.data.slug === offerSlug);
  const offerLabel = offer ? `${offer.data.title} (${offer.data.duration})` : offerSlug === 'indecis' ? 'Ne sait pas encore' : offerSlug;
  const preferredPeriod = outingLabel ? `Session du ${outingLabel}` : data.preferredPeriod || 'À définir';

  const req: SessionRequest = {
    name: data.name,
    email: data.email,
    phone: data.phone || undefined,
    offerSlug,
    sessionId: outing?.id ?? null,
    groupSize: data.groupSize,
    preferredPeriod,
    message: data.message || undefined,
    consent: true,
  };

  // --- Enregistrement dans l'admin (mini CRM). Un échec de la base ne doit pas perdre la demande :
  //     l'email part quand même, l'erreur est journalisée.
  let requestId: string | null = null;
  try {
    requestId = await createRequest(req, offerLabel);
  } catch (e) {
    console.error('[contact] enregistrement en base impossible :', e);
  }
  const adminUrl = requestId ? new URL(`/admin/demandes/${requestId}`, request.url).toString() : null;
  const outingUrl = outing ? new URL(`/admin/sessions/${outing.id}`, request.url).toString() : null;

  // --- Email au propriétaire
  const { to } = mailConfig();
  const owner = to ?? (isDev ? 'dev@localhost' : undefined);
  if (!owner) {
    return respond(request, 500, { ok: false, error: 'CONTACT_TO_EMAIL manquant.' }, errUrl);
  }

  const lines = [
    `Nom : ${req.name}`,
    `Email : ${req.email}`,
    `Téléphone : ${req.phone ?? '-'}`,
    `Session : ${offerLabel}`,
    `Nombre de personnes : ${req.groupSize}`,
    `Période souhaitée : ${req.preferredPeriod}`,
    `Session datée : ${outingLabel ? `oui, ${outing?.seatsLeft ?? '?'} place(s) libre(s) avant cette demande` : 'non'}`,
    '',
    'Message :',
    req.message ?? '-',
  ];
  const rows = lines.slice(0, 7).map((l) => {
    const [k, ...v] = l.split(' : ');
    return `<tr><td style="padding:6px 12px 6px 0;color:#424843">${escapeHtml(k)}</td><td style="padding:6px 0;font-weight:600">${escapeHtml(v.join(' : '))}</td></tr>`;
  });
  const html = `<div style="font-family:system-ui,sans-serif;color:#1a1c1c;line-height:1.5">
<h2 style="color:#082013;margin:0 0 12px">Nouvelle demande de session</h2>
<table style="border-collapse:collapse">${rows.join('')}</table>
<p style="margin:16px 0 4px;color:#424843">Message :</p>
<p style="white-space:pre-wrap;margin:0">${escapeHtml(req.message ?? '-')}</p>
<p style="margin-top:24px;font-size:12px;color:#737973">Réponds directement à cet email pour écrire à ${escapeHtml(req.name)}.${adminUrl ? ` <a href="${adminUrl}">Voir dans l’admin</a>.` : ''}${outingUrl ? ` <a href="${outingUrl}">Ouvrir la session</a> pour l’ajouter aux participants.` : ''}</p>
</div>`;

  const sent = await sendMail({
    to: owner,
    replyTo: req.email,
    subject: `${outing ? 'Demande de place' : 'Demande de session'} : ${offerLabel} — ${req.name}`,
    text: `Nouvelle demande de session\n\n${lines.join('\n')}${adminUrl ? `\n\nDans l’admin : ${adminUrl}` : ''}${outingUrl ? `\nLa session : ${outingUrl}` : ''}`,
    html,
  });

  if (!sent.ok) {
    console.error('[contact] envoi impossible :', sent.error);
    return respond(request, 502, { ok: false, error: 'L’envoi a échoué. Réessaie dans un moment ou écris-moi directement.' }, errUrl);
  }

  // --- Accusé de réception au demandeur (français, tutoiement, en « je »). Son échec n'est pas bloquant.
  // Le prénom vient de site.ts : tant que c'est un placeholder, il apparaît aussi sur À propos et bloque la production.
  const ack = await sendMail({
    to: req.email,
    subject: 'J’ai bien reçu ta demande — Nó Made Project',
    text: [
      `Bonjour ${req.name},`,
      '',
      outingLabel
        ? `J’ai bien reçu ta demande de place pour « ${offerLabel} », le ${outingLabel}, pour ${req.groupSize} personne${req.groupSize > 1 ? 's' : ''}.`
        : `J’ai bien reçu ta demande pour « ${offerLabel} », pour ${req.groupSize} personne${req.groupSize > 1 ? 's' : ''}, période souhaitée : ${req.preferredPeriod}.`,
      outingLabel
        ? 'Je te confirme la place par email, avec le point de rendez-vous exact. Pas de paiement en ligne : tout se règle après confirmation.'
        : 'Je te réponds par email pour caler une date ensemble. Pas de paiement en ligne : tout se règle après confirmation.',
      `Si tu préfères qu’on en parle d’abord, tu peux réserver un créneau visio ici : ${new URL('/contact/#visio', request.url).toString()}`,
      '',
      'À bientôt dehors,',
      `${site.ownerFirstName} — Nó Made Project`,
    ].join('\n'),
  });
  if (!ack.ok) console.warn('[contact] accusé de réception non envoyé :', ack.error);

  return respond(request, 200, { ok: true, dev: sent.dev ?? false }, okUrl);
};

export const GET: APIRoute = () =>
  new Response(JSON.stringify({ ok: false, error: 'Utilise le formulaire.' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', Allow: 'POST' },
  });
