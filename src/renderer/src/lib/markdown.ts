const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function renderInline(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

/** Blocco di codice: il contenuto è testo grezzo, quindi viene solo escapato. */
const codeBlock = (lines: string[]): string => `<pre><code>${escapeHtml(lines.join('\n'))}</code></pre>`;

/**
 * Mini renderer Markdown: titoli, grassetto, corsivo, codice inline e a blocchi,
 * elenchi puntati e numerati. Ogni testo viene escapato prima di aggiungere i tag,
 * quindi non può iniettare HTML.
 */
export function renderMarkdown(src: string): string {
  const out: string[] = [];
  let listTag: 'ul' | 'ol' | null = null; // lista aperta, se presente
  let code: string[] | null = null; // righe del blocco di codice aperto, se presente

  for (const line of src.split('\n')) {
    // I recinti ``` aprono e chiudono un blocco di codice: dentro non si interpreta nulla.
    if (/^\s*```/.test(line)) {
      if (code) {
        out.push(codeBlock(code));
        code = null;
      } else {
        if (listTag) {
          out.push(`</${listTag}>`);
          listTag = null;
        }
        code = [];
      }
      continue;
    }
    if (code) {
      code.push(line);
      continue;
    }

    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      const tag = bullet ? 'ul' : 'ol';
      if (listTag !== tag) {
        if (listTag) out.push(`</${listTag}>`);
        out.push(`<${tag}>`);
        listTag = tag;
      }
      out.push(`<li>${renderInline((bullet ?? numbered)?.[1] ?? '')}</li>`);
      continue;
    }
    if (listTag) {
      out.push(`</${listTag}>`);
      listTag = null;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1]?.length ?? 1;
      out.push(`<h${level}>${renderInline(heading[2] ?? '')}</h${level}>`);
    } else if (line.trim()) {
      out.push(`<p>${renderInline(line)}</p>`);
    }
  }

  if (listTag) out.push(`</${listTag}>`);
  // Blocco ancora aperto (es. mentre si scrive): si mostra comunque come codice.
  if (code) out.push(codeBlock(code));
  return out.join('\n');
}
