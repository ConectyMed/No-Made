/**
 * Accès aux chaînes de l'interface.
 * Français seulement pour l'instant. Pour ajouter une langue :
 *   1. créer src/i18n/<code>.json avec les mêmes clés,
 *   2. l'ajouter au dictionnaire ci-dessous et à `locales` dans astro.config.mjs.
 */
import fr from './fr.json';

export type Locale = 'fr';
export const defaultLocale: Locale = 'fr';

const dictionaries = { fr } as const;
type Dictionary = typeof fr;

type Path<T> = T extends string
  ? ''
  : {
      [K in Extract<keyof T, string>]: T[K] extends string ? K : `${K}.${Path<T[K]>}`;
    }[Extract<keyof T, string>];

export type TKey = Path<Dictionary>;

/** t('pages.home.h1') → chaîne. Lance une erreur au build si la clé manque. */
export function t(key: TKey, locale: Locale = defaultLocale): string {
  const value = key
    .split('.')
    .reduce<unknown>((acc, part) => (acc as Record<string, unknown>)?.[part], dictionaries[locale]);
  if (typeof value !== 'string') {
    throw new Error(`Clé i18n manquante : "${key}" (${locale})`);
  }
  return value;
}

/** Sous-arbre d'une page : usePage('offers').lead */
export function usePage<K extends keyof Dictionary['pages']>(page: K, locale: Locale = defaultLocale) {
  return dictionaries[locale].pages[page];
}
