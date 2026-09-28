/**
 * Lecture des variables d'environnement côté serveur.
 * Sur Vercel et en local, les secrets sont dans process.env au moment de l'exécution ;
 * import.meta.env couvre le développement avec un fichier .env.
 */
export function env(name: string): string | undefined {
  const fromProcess = typeof process !== 'undefined' ? process.env?.[name] : undefined;
  const fromMeta = (import.meta.env as Record<string, string | undefined>)[name];
  const value = fromProcess ?? fromMeta;
  return value && value.trim() !== '' ? value.trim() : undefined;
}

export const isDev = import.meta.env.DEV;
