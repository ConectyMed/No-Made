#!/usr/bin/env node
/**
 * Crée ou met à jour un compte admin, sans passer par l'email.
 *   node scripts/admin-user.mjs <email> "<Prénom>" [mot de passe]
 * Base : TURSO_DATABASE_URL + TURSO_AUTH_TOKEN dans l'environnement, sinon data/dev.db.
 * Applique d'abord les migrations de ./drizzle si besoin (même mécanisme qu'au démarrage du site).
 * Sans mot de passe donné, un mot de passe aléatoire est généré et affiché une seule fois.
 */
import { createClient } from '@libsql/client';
import { randomBytes, randomUUID, scrypt as scryptCb } from 'node:crypto';
import { promisify } from 'node:util';
import { readFileSync, readdirSync, mkdirSync } from 'node:fs';

const scrypt = promisify(scryptCb);
const [email, name, givenPassword] = process.argv.slice(2);
if (!email || !name) {
  console.error('Usage : node scripts/admin-user.mjs <email> "<Prénom>" [mot de passe]');
  process.exit(1);
}

const url = process.env.TURSO_DATABASE_URL ?? process.env.TURSO_URL;
if (!url) mkdirSync('data', { recursive: true });
const client = createClient(url ? { url, authToken: process.env.TURSO_AUTH_TOKEN } : { url: 'file:./data/dev.db' });

// Migrations, dans l'ordre des fichiers.
await client.execute('CREATE TABLE IF NOT EXISTS __migrations (name TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)');
const done = new Set((await client.execute('SELECT name FROM __migrations')).rows.map((r) => String(r.name)));
for (const file of readdirSync('drizzle').filter((f) => f.endsWith('.sql')).sort()) {
  const mname = file.replace(/\.sql$/, '');
  if (done.has(mname)) continue;
  for (const st of readFileSync(`drizzle/${file}`, 'utf8').split('--> statement-breakpoint').map((s) => s.trim()).filter(Boolean)) {
    await client.execute(st);
  }
  await client.execute({ sql: 'INSERT INTO __migrations (name, applied_at) VALUES (?, ?)', args: [mname, Date.now()] });
}

const password = givenPassword ?? randomBytes(12).toString('base64url');
const salt = randomBytes(16);
const hash = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
const stored = ['scrypt', 16384, 8, 1, salt.toString('base64'), hash.toString('base64')].join('$');
const e = email.trim().toLowerCase();
const now = Date.now();

const existing = await client.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [e] });
if (existing.rows.length) {
  await client.execute({
    sql: 'UPDATE users SET name = ?, password_hash = ?, failed_logins = 0, locked_until = NULL WHERE email = ?',
    args: [name, stored, e],
  });
  await client.execute({ sql: 'DELETE FROM auth_sessions WHERE user_id = ?', args: [String(existing.rows[0].id)] });
  console.log(`Compte mis à jour : ${e}`);
} else {
  await client.execute({
    sql: 'INSERT INTO users (id, email, name, password_hash, role, failed_logins, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)',
    args: [randomUUID(), e, name, stored, 'admin', now],
  });
  console.log(`Compte créé : ${e}`);
}
if (!givenPassword) console.log(`Mot de passe (à transmettre une seule fois, puis à changer) : ${password}`);
