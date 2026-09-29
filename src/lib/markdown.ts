/**
 * Markdown simple pour les articles « Ma philosophie », écrits dans l'admin.
 * Tout le texte est échappé d'abord : aucun HTML saisi ne passe. Ce qui est reconnu :
 *   ## Titre / ### Sous-titre (un # seul compte comme ##, le titre de l'article est le seul h1)
 *   - élément de liste (ou * ), 1. liste numérotée
 *   > citation
 *   **gras**, *italique* ou _italique_, [texte](https://lien), [texte](/page-du-site/)
 *   ligne vide = nouveau paragraphe ; retour à la ligne simple = saut de ligne.
 */

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const emphasis = (s: string) =>
  s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*(?!\s)(.+?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/(^|[^\w])_(?!\s)(.+?)_(?!\w)/g, '$1<em>$2</em>');

function inline(raw: string): string {
  // Les liens sont mis de côté pendant la mise en forme : un « _ » dans une adresse ne doit pas devenir de l'italique.
  const links: string[] = [];
  const text = escapeHtml(raw).replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:|\/)[^\s)]*)\)/g, (_, label: string, href: string) => {
    const external = /^https?:\/\//.test(href);
    links.push(`<a href="${href}"${external ? ' rel="noopener"' : ''}>${emphasis(label)}</a>`);
    return `\u0000${links.length - 1}\u0000`;
  });
  return emphasis(text).replace(/\u0000(\d+)\u0000/g, (_, i: string) => links[Number(i)] ?? '');
}

export function renderMarkdown(src: string): string {
  const blocks = src.replace(/\r\n?/g, '\n').trim().split(/\n\s*\n/);
  const out: string[] = [];
  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trimEnd());
    const first = lines[0]?.trim() ?? '';
    if (!first) continue;

    const heading = first.match(/^(#{1,3})\s+(.+)$/);
    if (heading && lines.length === 1) {
      const level = heading[1].length === 3 ? 3 : 2;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }
    if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
      out.push(`<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*]\s+/, ''))}</li>`).join('')}</ul>`);
      continue;
    }
    if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
      out.push(`<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ''))}</li>`).join('')}</ol>`);
      continue;
    }
    if (lines.every((l) => /^\s*>/.test(l))) {
      const text = lines.map((l) => inline(l.replace(/^\s*>\s?/, ''))).join('<br>');
      out.push(`<blockquote><p>${text}</p></blockquote>`);
      continue;
    }
    out.push(`<p>${lines.map((l) => inline(l.trim())).join('<br>')}</p>`);
  }
  return out.join('\n');
}

/** Temps de lecture arrondi, au moins une minute (environ 220 mots par minute). */
export function readingMinutes(src: string): number {
  const words = src.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
