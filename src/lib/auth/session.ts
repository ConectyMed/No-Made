/**
 * Comptes et sessions de l'admin.
 *  - Deux comptes prévus (Anthony et l'administrateur du site). Pas d'inscription publique :
 *    une adresse peut créer son mot de passe si elle figure dans ADMIN_EMAILS ou existe déjà en base.
 *  - Cookie de session HttpOnly, 30 jours, prolongé à l'usage ; seul le hachage du jeton est stocké.
 *  - Verrouillage 15 min après 8 échecs de connexion.
 *  - Compte de démarrage : tant qu'aucun compte n'existe, l'identifiant ADMIN_BOOTSTRAP_USER avec le mot de
 *    passe ADMIN_BOOTSTRAP_PASSWORD (par défaut admin / admin123, demandé le 2026-09-28, temporaire) crée
 *    le premier compte à la première connexion. Il est marqué « mot de passe à changer ».
 */
import { createHash, randomBytes } from 'node:crypto';
import { and, count, eq, gt, isNull } from 'drizzle-orm';
import type { AstroCookies } from 'astro';
import { getDb, schema } from '../db';
import { hashPassword, verifyPassword } from './password';
import { env } from '../env';

export const COOKIE_NAME = 'nomade_admin';
const SESSION_DAYS = 30;
const RENEW_BELOW_DAYS = 15;
const TOKEN_MINUTES = 60;
const MAX_FAILED = 8;
const LOCK_MINUTES = 15;
const DAY = 24 * 60 * 60 * 1000;

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  mustChangePassword: boolean;
}

const toAdminUser = (u: typeof schema.users.$inferSelect): AdminUser => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  mustChangePassword: u.mustChangePassword === 1,
});

function bootstrapCredentials() {
  return { user: normalizeEmail(env('ADMIN_BOOTSTRAP_USER') ?? 'admin'), password: env('ADMIN_BOOTSTRAP_PASSWORD') ?? 'admin123' };
}

/** Crée le compte de démarrage si la table est vide et que les identifiants correspondent. */
async function tryBootstrap(email: string, password: string) {
  const db = await getDb();
  const boot = bootstrapCredentials();
  if (email !== boot.user || password !== boot.password) return null;
  const total = await db.select({ n: count() }).from(schema.users).get();
  if ((total?.n ?? 0) > 0) return null;
  const id = crypto.randomUUID();
  await db.insert(schema.users).values({
    id,
    email: boot.user,
    name: 'Admin',
    passwordHash: await hashPassword(password),
    role: 'admin',
    mustChangePassword: 1,
    createdAt: Date.now(),
  });
  console.warn('[admin] compte de démarrage créé : change son mot de passe dès que possible.');
  return db.query.users.findFirst({ where: eq(schema.users.id, id) });
}

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
const newToken = () => randomBytes(32).toString('base64url');

export function allowedEmails(): string[] {
  return (env('ADMIN_EMAILS') ?? '')
    .split(/[,;\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const normalizeEmail = (e: string) => e.trim().toLowerCase();

/** L'adresse a le droit de (re)définir un mot de passe : compte existant ou adresse autorisée. */
export async function canSetPassword(email: string): Promise<boolean> {
  const db = await getDb();
  const e = normalizeEmail(email);
  if (allowedEmails().includes(e)) return true;
  const user = await db.query.users.findFirst({ where: eq(schema.users.email, e) });
  return !!user;
}

// ---------- Connexion ----------

export type LoginResult = { ok: true; user: AdminUser } | { ok: false; reason: 'invalid' | 'locked' };

export async function login(email: string, password: string): Promise<LoginResult> {
  const db = await getDb();
  const e = normalizeEmail(email);
  let user = await db.query.users.findFirst({ where: eq(schema.users.email, e) });
  const now = Date.now();
  if (!user) user = (await tryBootstrap(e, password)) ?? undefined;
  if (!user) {
    await verifyPassword(password, null); // temps constant, pas de fuite sur l'existence du compte
    return { ok: false, reason: 'invalid' };
  }
  if (user.lockedUntil && user.lockedUntil > now) return { ok: false, reason: 'locked' };

  const good = await verifyPassword(password, user.passwordHash);
  if (!good) {
    const failed = user.failedLogins + 1;
    await db
      .update(schema.users)
      .set({ failedLogins: failed, lockedUntil: failed >= MAX_FAILED ? now + LOCK_MINUTES * 60_000 : null })
      .where(eq(schema.users.id, user.id));
    return { ok: false, reason: failed >= MAX_FAILED ? 'locked' : 'invalid' };
  }
  await db
    .update(schema.users)
    .set({ failedLogins: 0, lockedUntil: null, lastLoginAt: now })
    .where(eq(schema.users.id, user.id));
  return { ok: true, user: toAdminUser(user) };
}

/** Changement de mot de passe (et de prénom) depuis « Mon compte », après vérification de l'actuel. */
export async function changePassword(
  userId: string,
  current: string,
  next: string,
  name?: string,
): Promise<{ ok: true } | { ok: false; reason: 'wrong-current' | 'not-found' }> {
  const db = await getDb();
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });
  if (!user) return { ok: false, reason: 'not-found' };
  if (!(await verifyPassword(current, user.passwordHash))) return { ok: false, reason: 'wrong-current' };
  await db
    .update(schema.users)
    .set({ passwordHash: await hashPassword(next), mustChangePassword: 0, ...(name?.trim() ? { name: name.trim() } : {}) })
    .where(eq(schema.users.id, userId));
  return { ok: true };
}

/** Ferme toutes les sessions d'un utilisateur sauf celle indiquée (après un changement de mot de passe). */
export async function destroyOtherSessions(userId: string, keepToken: string | undefined): Promise<void> {
  const db = await getDb();
  const keep = keepToken ? sha256(keepToken) : '';
  const rows = await db.select({ id: schema.authSessions.id }).from(schema.authSessions).where(eq(schema.authSessions.userId, userId));
  for (const r of rows) if (r.id !== keep) await db.delete(schema.authSessions).where(eq(schema.authSessions.id, r.id));
}

// ---------- Sessions ----------

export async function createSession(userId: string): Promise<string> {
  const db = await getDb();
  const token = newToken();
  const now = Date.now();
  await db.insert(schema.authSessions).values({ id: sha256(token), userId, createdAt: now, expiresAt: now + SESSION_DAYS * DAY });
  return token;
}

export async function getUserFromToken(token: string | undefined): Promise<AdminUser | null> {
  if (!token) return null;
  const db = await getDb();
  const id = sha256(token);
  const row = await db
    .select({ session: schema.authSessions, user: schema.users })
    .from(schema.authSessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.authSessions.userId))
    .where(eq(schema.authSessions.id, id))
    .get();
  if (!row) return null;
  const now = Date.now();
  if (row.session.expiresAt <= now) {
    await db.delete(schema.authSessions).where(eq(schema.authSessions.id, id));
    return null;
  }
  if (row.session.expiresAt - now < RENEW_BELOW_DAYS * DAY) {
    await db.update(schema.authSessions).set({ expiresAt: now + SESSION_DAYS * DAY }).where(eq(schema.authSessions.id, id));
  }
  return toAdminUser(row.user);
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token) return;
  const db = await getDb();
  await db.delete(schema.authSessions).where(eq(schema.authSessions.id, sha256(token)));
}

export function setSessionCookie(cookies: AstroCookies, token: string): void {
  cookies.set(COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export function clearSessionCookie(cookies: AstroCookies): void {
  cookies.delete(COOKIE_NAME, { path: '/' });
}

// ---------- Lien de (ré)initialisation du mot de passe ----------

export async function createPasswordToken(email: string): Promise<string> {
  const db = await getDb();
  const token = newToken();
  const now = Date.now();
  await db.insert(schema.passwordTokens).values({
    id: sha256(token),
    email: normalizeEmail(email),
    createdAt: now,
    expiresAt: now + TOKEN_MINUTES * 60_000,
  });
  return token;
}

export async function peekPasswordToken(token: string): Promise<{ email: string; isNew: boolean } | null> {
  const db = await getDb();
  const row = await db.query.passwordTokens.findFirst({
    where: and(eq(schema.passwordTokens.id, sha256(token)), isNull(schema.passwordTokens.usedAt), gt(schema.passwordTokens.expiresAt, Date.now())),
  });
  if (!row) return null;
  const user = await db.query.users.findFirst({ where: eq(schema.users.email, row.email) });
  return { email: row.email, isNew: !user };
}

/** Consomme le lien, crée le compte s'il n'existe pas, enregistre le mot de passe, ouvre une session. */
export async function setPasswordWithToken(token: string, password: string, name?: string): Promise<AdminUser | null> {
  const db = await getDb();
  const info = await peekPasswordToken(token);
  if (!info) return null;
  const now = Date.now();
  const passwordHash = await hashPassword(password);
  let user = await db.query.users.findFirst({ where: eq(schema.users.email, info.email) });
  if (!user) {
    const id = crypto.randomUUID();
    await db.insert(schema.users).values({
      id,
      email: info.email,
      name: (name ?? '').trim() || info.email.split('@')[0],
      passwordHash,
      role: 'admin',
      createdAt: now,
    });
    user = await db.query.users.findFirst({ where: eq(schema.users.id, id) });
  } else {
    await db
      .update(schema.users)
      .set({ passwordHash, failedLogins: 0, lockedUntil: null, mustChangePassword: 0, ...(name?.trim() ? { name: name.trim() } : {}) })
      .where(eq(schema.users.id, user.id));
    // Changer de mot de passe ferme les autres sessions.
    await db.delete(schema.authSessions).where(eq(schema.authSessions.userId, user.id));
  }
  await db.update(schema.passwordTokens).set({ usedAt: now }).where(eq(schema.passwordTokens.id, sha256(token)));
  if (!user) return null;
  return { ...toAdminUser(user), mustChangePassword: false };
}
