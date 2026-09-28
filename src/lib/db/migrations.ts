/**
 * Migrations embarquées dans le code (import ?raw), appliquées dans l'ordre par getDb().
 * Après `npm run db:generate -- --name <nom>`, ajouter le nouveau fichier ici.
 */
import m0000 from '../../../drizzle/0000_init.sql?raw';

export const migrations: { name: string; sql: string }[] = [{ name: '0000_init', sql: m0000 }];
