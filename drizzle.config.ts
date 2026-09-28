// Configuration de drizzle-kit : génère les migrations SQL dans ./drizzle à partir du schéma.
// Usage : npm run db:generate -- --name <nom>. Les migrations sont ensuite embarquées dans le code
// (src/lib/db/migrations.ts) et appliquées au premier accès, en local comme sur Vercel.
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
});
