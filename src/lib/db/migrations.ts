/**
 * Migrations embarquées dans le code (import ?raw), appliquées dans l'ordre par getDb().
 * Après `npm run db:generate -- --name <nom>`, ajouter le nouveau fichier ici.
 */
import m0000 from '../../../drizzle/0000_init.sql?raw';
import m0001 from '../../../drizzle/0001_must_change_password.sql?raw';
import m0002 from '../../../drizzle/0002_public_group_sessions.sql?raw';

export const migrations: { name: string; sql: string }[] = [
  { name: '0000_init', sql: m0000 },
  { name: '0001_must_change_password', sql: m0001 },
  { name: '0002_public_group_sessions', sql: m0002 },
];
