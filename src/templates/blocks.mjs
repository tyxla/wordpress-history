// Turns the block lists in content/chapters/*.json into HTML.

import { esc, inline, formatDate, countWords } from './inline.mjs';
import { registry } from './exhibits.mjs';

// Blocks that belong to the main reading column. Consecutive ones are wrapped
// together so that margin notes can float beside them.
const PROSE = new Set(['p', 'lede', 'h3', 'aside', 'pull', 'quote', 'archive', 'chronology', 'list']);

function picture(asset, { sizes = '(min-width: 900px) 46rem, 100vw', eager = false } = {}) {
  const sources = asset.variants
    .map((v) => `<source type="${v.type}" srcset="${v.srcset}" sizes="${sizes}">`)
    .join('');
  return `<picture>${sources}<img src="${esc(asset.src)}" width="${asset.width}" height="${asset.height}" alt="${esc(asset.alt)}"${eager ? '' : ' loading="lazy"'} decoding="async"></picture>`;
}

function credit(asset) {
  const bits = [asset.creator, asset.license].filter(Boolean).join(', ');
  return `<span class="credit">${asset.source_page ? `<a href="${esc(asset.source_page)}" rel="noopener">${esc(bits)}</a>` : esc(bits)}</span>`;
}

const renderers = {
  p(b, ctx) {
    ctx.words.main += countWords(b.text);
    const html = `<p>${inline(b.text, ctx.citations)}</p>`;
    // A small discovery for people who view source: in the chapter about blocks,
    // the paragraphs of this page are delimited the way WordPress stores them.
    return ctx.chapter?.id === 'blocks' ? `<!-- wp:paragraph -->\n${html}\n<!-- /wp:paragraph -->` : html;
  },

  lede(b, ctx) {
    ctx.words.main += countWords(b.text);
    return `<p class="lede">${inline(b.text, ctx.citations)}</p>`;
  },

  h3(b, ctx) {
    ctx.words.main += countWords(b.text);
    return `<h3 class="subhead"${b.id ? ` id="${esc(b.id)}"` : ''}>${inline(b.text, ctx.citations)}</h3>`;
  },

  // An editorial line in our own words.
  pull(b, ctx) {
    ctx.words.main += countWords(b.text);
    return `<p class="pull">${inline(b.text, ctx.citations)}</p>`;
  },

  // A verbatim quotation. Always attributed, always sourced.
  quote(b, ctx) {
    if (!b.cite) ctx.problems.push(`Quotation without a source: “${b.text.slice(0, 50)}…”`);
    const where = [b.where, b.date ? formatDate(b.date) : ''].filter(Boolean).join(', ');
    return `<figure class="quote">
<blockquote><p>${inline(b.text)}</p></blockquote>
<figcaption>— ${esc(b.by)}${where ? `, <span class="quote-where">${esc(where)}</span>` : ''}${b.cite ? ctx.citations.cite(b.cite) : ''}</figcaption>
</figure>`;
  },

  aside(b, ctx) {
    ctx.words.extra += countWords(b.text);
    return `<aside class="marginal"${b.label ? ` aria-label="${esc(b.label)}"` : ''}>${b.label ? `<p class="marginal-label">${esc(b.label)}</p>` : ''}<p>${inline(b.text, ctx.citations)}</p></aside>`;
  },

  list(b, ctx) {
    const items = b.items.map((t) => {
      ctx.words.main += countWords(t);
      return `<li>${inline(t, ctx.citations)}</li>`;
    }).join('');
    return `<ul class="plain-list">${items}</ul>`;
  },

  chronology(b, ctx) {
    const items = b.items.map((it) => {
      ctx.words.extra += countWords(it.text);
      return `<li><time class="chron-date">${esc(it.date)}</time><span class="chron-text">${inline(it.text, ctx.citations)}</span></li>`;
    }).join('');
    return `<div class="chron">${b.title ? `<p class="chron-title">${esc(b.title)}</p>` : ''}<ol>${items}</ol></div>`;
  },

  // "Open the archive": optional depth, inline, without losing one's place.
  archive(b, ctx) {
    const items = b.items.map((it) => {
      if (it.type === 'quote') {
        if (!it.cite) ctx.problems.push(`Archive quotation without a source: “${it.text.slice(0, 50)}…”`);
        ctx.words.extra += countWords(it.text);
        const where = [it.where, it.date ? formatDate(it.date) : ''].filter(Boolean).join(', ');
        return `<figure class="arch-quote"><blockquote><p>${inline(it.text)}</p></blockquote><figcaption>— ${esc(it.by)}${where ? `, ${esc(where)}` : ''}${it.cite ? ctx.citations.cite(it.cite) : ''}</figcaption></figure>`;
      }
      if (it.type === 'figure') {
        const asset = ctx.assets.get(it.asset);
        if (!asset) { ctx.problems.push(`Unknown asset: ${it.asset}`); return ''; }
        ctx.usedAssets.add(it.asset);
        return `<figure class="arch-figure">${picture(asset, { sizes: '(min-width: 700px) 34rem, 92vw' })}<figcaption>${inline(it.caption || asset.caption, ctx.citations)} ${credit(asset)}</figcaption></figure>`;
      }
      if (it.type === 'facts') {
        const rows = it.rows.map(([k, v]) => {
          ctx.words.extra += countWords(v);
          return `<div><dt>${esc(k)}</dt><dd>${inline(v, ctx.citations)}</dd></div>`;
        }).join('');
        return `<dl class="arch-facts">${rows}</dl>`;
      }
      if (it.type === 'chronology') {
        const rows = it.items.map((row) => {
          ctx.words.extra += countWords(row.text);
          return `<li><time class="chron-date">${esc(row.date)}</time><span class="chron-text">${inline(row.text, ctx.citations)}</span></li>`;
        }).join('');
        return `<div class="chron chron--inset"><ol>${rows}</ol></div>`;
      }
      // A dated list in which every entry says what kind of statement it is.
      if (it.type === 'ledger') {
        const rows = it.rows.map((row) => {
          ctx.words.extra += countWords(row.text);
          return `<li><time class="chron-date">${esc(row.date)}</time><span class="chron-text"><span class="kind kind--${esc(row.kind.toLowerCase())}">${esc(row.kind)}</span> ${inline(row.text, ctx.citations)}</span></li>`;
        }).join('');
        return `<div class="chron chron--inset chron--ledger"><ol>${rows}</ol></div>`;
      }
      if (it.type === 'links') {
        return `<ul class="arch-links">${it.links.map((l) => `<li><a href="${esc(l.url)}" rel="noopener">${esc(l.label)}</a>${l.note ? ` <span>${esc(l.note)}</span>` : ''}</li>`).join('')}</ul>`;
      }
      ctx.words.extra += countWords(it.text);
      return `<p>${inline(it.text, ctx.citations)}</p>`;
    }).join('\n');
    return `<details class="archive">
<summary><span class="archive-open">Open the archive</span><span class="archive-title">${esc(b.title)}</span></summary>
<div class="archive-body">${items}</div>
</details>`;
  },

  figure(b, ctx) {
    const asset = ctx.assets.get(b.asset);
    if (!asset) { ctx.problems.push(`Unknown asset: ${b.asset}`); return ''; }
    const layout = b.layout || 'wide';
    const sizes = layout === 'full' ? '100vw' : layout === 'wide' ? '(min-width: 1100px) 60rem, 100vw' : '(min-width: 900px) 34rem, 100vw';
    ctx.usedAssets.add(b.asset);
    return `<figure class="plate plate--${esc(layout)} b--${esc(layout)}${b.tilt ? ' plate--tilt' : ''}">
<div class="plate-frame">${picture(asset, { sizes })}</div>
<figcaption><span class="exhibit-kind">${esc(asset.kind)}</span> ${inline(b.caption || asset.caption, ctx.citations)} ${credit(asset)}</figcaption>
</figure>`;
  },

  exhibit(b, ctx) {
    const fn = registry[b.name];
    if (!fn) { ctx.problems.push(`Unknown exhibit: ${b.name}`); return ''; }
    return fn(ctx, b);
  },

  rule() {
    return '<hr class="ornament">';
  },
};

export function renderBlocks(blocks, ctx) {
  const out = [];
  let run = [];
  const flush = () => {
    if (run.length) out.push(`<div class="prose">\n${run.join('\n')}\n</div>`);
    run = [];
  };
  for (const raw of blocks) {
    const b = typeof raw === 'string' ? { type: 'p', text: raw } : raw;
    const render = renderers[b.type];
    if (!render) { ctx.problems.push(`Unknown block type: ${b.type}`); continue; }
    const html = render(b, ctx);
    if (PROSE.has(b.type)) run.push(html);
    else { flush(); out.push(html); }
  }
  flush();
  return out.join('\n');
}
