/**
 * Connexion à la base : Turso en production (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN),
 * fichier SQLite local sinon (data/dev.db, ignoré par git).
 * Les migrations sont embarquées et appliquées une fois par démarrage, avant la première requête.
 */
import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { migrations } from './migrations';
import { env } from '../env';

export type Db = LibSQLDatabase<typeof schema>;

let client: Client | null = null;
let db: Db | null = null;
let ready: Promise<void> | null = null;

function connect(): Client {
  const url = env('TURSO_DATABASE_URL') ?? env('TURSO_URL') ?? env('DATABASE_URL');
  const authToken = env('TURSO_AUTH_TOKEN') ?? env('DATABASE_AUTH_TOKEN');
  if (url) return createClient({ url, authToken });
  if (import.meta.env.PROD && process.env.VERCEL) {
    throw new Error('TURSO_DATABASE_URL manquante : la base n’est pas configurée sur Vercel.');
  }
  return createClient({ url: 'file:./data/dev.db' });
}

async function applyMigrations(c: Client): Promise<void> {
  await c.execute(
    'CREATE TABLE IF NOT EXISTS __migrations (name TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)',
  );
  const done = new Set((await c.execute('SELECT name FROM __migrations')).rows.map((r) => String(r.name)));
  for (const m of migrations) {
    if (done.has(m.name)) continue;
    const statements = m.sql
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const statement of statements) await c.execute(statement);
    await c.execute({ sql: 'INSERT INTO __migrations (name, applied_at) VALUES (?, ?)', args: [m.name, Date.now()] });
  }
}

/** Base prête à l'emploi (migrations appliquées). À appeler dans chaque route serveur. */
export async function getDb(): Promise<Db> {
  if (!client) client = connect();
  if (!db) db = drizzle(client, { schema });
  if (!ready) {
    ready = applyMigrations(client).catch((e) => {
      ready = null; // on réessaiera à la prochaine requête
      throw e;
    });
  }
  await ready;
  return db;
}

export { schema };
