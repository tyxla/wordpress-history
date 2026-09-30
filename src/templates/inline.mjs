// Inline text formatting shared by every template.
//
// Content files use a deliberately small markup:
//   *emphasis*   **strong**   `code`   [link text](https://…)   [^source-id]
// Everything else is plain text and is escaped.

export function esc(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function slug(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// "2003-05-27" → "27 May 2003"; "2003-05" → "May 2003"; "2003" → "2003".
export function formatDate(iso = '') {
  const [y, m, d] = String(iso).split('-');
  if (!m) return y || '';
  const month = MONTHS[Number(m) - 1];
  return d ? `${Number(d)} ${month} ${y}` : `${month} ${y}`;
}

// Keeps track of which sources are cited, in order of first appearance,
// so that reference numbers are stable across the page.
export class Citations {
  constructor(sources) {
    this.sources = new Map(sources.map((s) => [s.id, s]));
    this.order = [];
    this.uses = new Map();
    this.missing = new Set();
  }

  cite(id, follows = false) {
    const source = this.sources.get(id);
    if (!source) {
      this.missing.add(id);
      return '';
    }
    if (!this.uses.has(id)) {
      this.order.push(id);
      this.uses.set(id, 0);
    }
    const n = this.order.indexOf(id) + 1;
    const use = this.uses.get(id) + 1;
    this.uses.set(id, use);
    const label = `Source ${n}: ${source.title}`;
    return `<sup class="cite${follows ? ' cite--next' : ''}"><a href="#src-${esc(id)}" id="cite-${esc(id)}-${use}" aria-label="${esc(label)}">${n}</a></sup>`;
  }

  list() {
    return this.order.map((id, i) => ({ n: i + 1, uses: this.uses.get(id), ...this.sources.get(id) }));
  }
}

export function inline(text = '', citations) {
  let html = esc(text);
  // Code first, so its contents are not treated as markup.
  const code = [];
  html = html.replace(/`([^`]+)`/g, (_, c) => {
    code.push(c);
    return `\u0000${code.length - 1}\u0000`;
  });
  // Runs of citations ([^a][^b]) are rendered together, comma-separated.
  html = html.replace(/(?:\[\^[a-z0-9-]+\])+/g, (run) => {
    if (!citations) return '';
    return [...run.matchAll(/\[\^([a-z0-9-]+)\]/g)].map((m, i) => citations.cite(m[1], i > 0)).join('');
  });
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    const external = /^https?:/.test(url);
    return `<a href="${url}"${external ? ' rel="noopener"' : ''}>${label}</a>`;
  });
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${code[Number(i)]}</code>`);
  return html;
}

// Rough word count of the visible text in a formatted string.
export function countWords(text = '') {
  return String(text)
    .replace(/\[\^[a-z0-9-]+\]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .split(/\s+/)
    .filter(Boolean).length;
}
