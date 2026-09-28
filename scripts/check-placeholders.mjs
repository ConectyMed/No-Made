#!/usr/bin/env node
/**
 * Contrôle des placeholders après `astro build`.
 * Parcourt dist/ et signale tout [PLACEHOLDER] restant dans le HTML.
 * En production (VERCEL_ENV=production ou CONTEXT=production ou CF_PAGES_BRANCH=main),
 * le build échoue tant qu'il en reste, sauf si ALLOW_PLACEHOLDERS=1.
 * Génère aussi docs/PLACEHOLDERS.md, la liste de ce qu'il reste à compléter.
 */
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
// Avec l'adaptateur Vercel, les pages statiques sont dans dist/client/.
const DIST = existsSync(join(ROOT, 'dist', 'client')) ? join(ROOT, 'dist', 'client') : join(ROOT, 'dist');
const PATTERN = /\[(?:[A-ZÀ-ÜŒ0-9][A-ZÀ-ÜŒ0-9 '’:/._-]{1,60})\]/g;

if (!existsSync(DIST)) {
  console.error('check-placeholders : dossier dist/ introuvable. Lance `astro build` d’abord.');
  process.exit(1);
}

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) files.push(p);
  }
})(DIST);

const found = new Map(); // placeholder → Set(pages)
for (const file of files) {
  const html = readFileSync(file, 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');
  const page = '/' + relative(DIST, file).replace(/index\.html$/, '').replace(/\\/g, '/');
  for (const m of html.matchAll(PATTERN)) {
    const key = m[0];
    if (!found.has(key)) found.set(key, new Set());
    found.get(key).add(page);
  }
}

const isProd =
  process.env.VERCEL_ENV === 'production' ||
  process.env.CONTEXT === 'production' ||
  (process.env.CF_PAGES_BRANCH && ['main', 'master'].includes(process.env.CF_PAGES_BRANCH)) ||
  process.env.NODE_ENV === 'production' && process.env.CI === 'true' && !process.env.VERCEL_ENV;

const lines = ['# Placeholders restants', '', `Généré par \`npm run build\` le ${new Date().toISOString().slice(0, 10)}.`, ''];
if (found.size === 0) {
  lines.push('Aucun. Le site peut partir en production.');
} else {
  lines.push('| Placeholder | Pages |', '|---|---|');
  for (const [key, pages] of [...found].sort()) lines.push(`| \`${key}\` | ${[...pages].sort().join(', ')} |`);
  lines.push('', 'Où les remplir : `src/data/site.ts` (email, réseaux), `src/content/offers/fr/*.md` (partenaire), `src/assets/provisoire/` (images encore provisoires).');
}
writeFileSync(join(ROOT, 'docs', 'PLACEHOLDERS.md'), lines.join('\n') + '\n');

if (found.size === 0) {
  console.log('check-placeholders : aucun placeholder. ✔');
  process.exit(0);
}

console.log(`check-placeholders : ${found.size} placeholder(s) restant(s) :`);
for (const [key, pages] of [...found].sort()) console.log(`  ${key}  →  ${[...pages].sort().join(', ')}`);

const allowRaw = process.env.ALLOW_PLACEHOLDERS;
const allow = ['1', 'true', 'yes', 'on'].includes(String(allowRaw ?? '').trim().toLowerCase());
console.log(
  `\nEnvironnement : VERCEL_ENV=${process.env.VERCEL_ENV ?? '-'} · branche=${process.env.VERCEL_GIT_COMMIT_REF ?? '-'} · production=${isProd ? 'oui' : 'non'} · ALLOW_PLACEHOLDERS=${allowRaw === undefined ? '(absente)' : JSON.stringify(allowRaw)}`,
);

if (isProd && !allow) {
  console.error('\nBuild de production refusé : il reste des informations à compléter (voir docs/PLACEHOLDERS.md).');
  console.error('Pour forcer pendant le développement : variable ALLOW_PLACEHOLDERS=1, cochée pour l’environnement Production, puis Redeploy.');
  process.exit(1);
}
console.log(isProd ? 'ALLOW_PLACEHOLDERS actif : build de production autorisé malgré les placeholders.' : 'Build de prévisualisation : autorisé.');
