// Assembles the whole page.

import { esc, inline, formatDate, slug } from './inline.mjs';
import { renderBlocks } from './blocks.mjs';
import { potSprite } from './specimen.mjs';
import { openingWindow, ending } from './exhibits.mjs';
import { renderReleases } from './releases.mjs';

function masthead(ctx, nav) {
  const items = nav.map((n) => `<li><a href="#${esc(n.id)}"><span class="idx-label">${esc(n.label)}</span><span class="idx-title">${esc(n.title)}</span><span class="idx-years">${esc(n.years || '')}</span></a></li>`).join('');
  return `<header class="masthead" id="masthead">
<a class="wordmark" href="#top" aria-label="${esc(ctx.site.title)} — back to the beginning">Hello, World<span>.</span></a>
<p class="whereami" aria-hidden="true"><span class="whereami-label"></span><span class="whereami-title"></span></p>
<div class="mast-tools">
<button type="button" class="motion-toggle" role="switch" aria-checked="true" hidden><span class="motion-dot" aria-hidden="true"></span><span class="motion-text">Motion</span><span class="motion-state" aria-hidden="true">on</span></button>
<details class="index">
<summary><span class="index-word">Chapters</span><span class="index-now" aria-hidden="true"></span></summary>
<nav class="index-panel" aria-label="Chapters"><ol>${items}</ol></nav>
</details>
</div>
<div class="progress" aria-hidden="true"><span></span></div>
</header>`;
}

function ruler(nav) {
  const ticks = nav.filter((n) => n.tick).map((n) => `<a href="#${esc(n.id)}" tabindex="-1" data-for="${esc(n.id)}"><span>${esc(n.tick)}</span><i>${esc(n.title)}</i></a>`).join('');
  return `<div class="ruler" aria-hidden="true">${ticks}</div>`;
}

function opening(ctx) {
  const o = ctx.site.opening;
  return `<section class="opening" id="top" data-chapter data-label="" data-title="${esc(ctx.site.subtitle)}" data-scene="progress">
<div class="opening-stage">
<div class="opening-copy">
<p class="eyebrow">${esc(o.eyebrow)}</p>
<h1 class="opening-title">Hello, World<span>.</span></h1>
<p class="opening-sub">${esc(ctx.site.subtitle)}</p>
<p class="opening-micro">${esc(o.micro)}</p>
</div>
<figure class="opening-window">
<div class="opening-mount">
${openingWindow(ctx)}
</div>
<figcaption><span class="exhibit-kind">Fig. 1 · Illustration</span> ${esc(o.figcaption)}</figcaption>
</figure>
<p class="opening-year" aria-hidden="true"><span class="yr-fixed" data-n="200"></span><span class="yr-roll"><span data-n="3"></span><span data-n="2"></span><span data-n="1"></span></span></p>
<div class="opening-hook">
<p class="hook">${inline(o.hook, ctx.citations)}</p>
<p class="hook-after">${inline(o.after, ctx.citations)}</p>
<p class="opening-go"><a class="go" href="#${esc(ctx.chapters[0].id)}">${esc(o.cta)} <span aria-hidden="true">↓</span></a></p>
</div>
</div>
</section>`;
}

function chapter(ctx, ch) {
  ctx.chapter = ch;
  const before = ctx.words.main;
  const body = renderBlocks(ch.blocks, ctx);
  ctx.chapter = null;
  ctx.words.byChapter ??= [];
  ctx.words.byChapter.push([ch.label, ctx.words.main - before]);
  return `<section class="chapter chapter--${esc(ch.tone || 'paper')}" id="${esc(ch.id)}" data-chapter data-label="${esc(ch.label)}" data-title="${esc(ch.title)}" aria-labelledby="${esc(ch.id)}-h">
<header class="chapter-head">
<p class="chapter-kicker"><span>${esc(ch.label)}</span><span class="chapter-years">${esc(ch.years)}</span></p>
<p class="chapter-numeral" aria-hidden="true" data-n="${esc(ch.numeral)}"></p>
<h2 id="${esc(ch.id)}-h" class="chapter-title">${inline(ch.title)}<span class="dot">.</span></h2>
<p class="chapter-dek">${inline(ch.dek, ctx.citations)}</p>
</header>
<div class="chapter-body">
${body}
</div>
</section>`;
}

function endingSection(ctx) {
  const e = ctx.site.ending;
  return `<section class="chapter chapter--ending" id="ending" data-chapter data-label="Ending" data-title="${esc(e.title)}" aria-labelledby="ending-h">
<header class="chapter-head chapter-head--quiet">
<p class="chapter-kicker"><span>Ending</span><span class="chapter-years">${esc(formatDate(ctx.site.verifiedThrough))}</span></p>
<h2 id="ending-h" class="chapter-title">${esc(e.title)}<span class="dot">.</span></h2>
</header>
<div class="chapter-body">
<div class="prose">
${e.paragraphs.map((p) => `<p>${inline(p, ctx.citations)}</p>`).join('\n')}
</div>
${ending(ctx, e)}
<p class="last-line b--text">${esc(e.lastLine)}</p>
</div>
</section>`;
}

function sourceEntry(s) {
  const who = [s.author, s.publisher].filter(Boolean).join(', ');
  const back = Array.from({ length: s.uses }, (_, i) => `<a href="#cite-${esc(s.id)}-${i + 1}" aria-label="Back to reference ${i + 1} of source ${s.n}">↑</a>`).join(' ');
  return `<li id="src-${esc(s.id)}" value="${s.n}"><span class="src-title">${s.url ? `<a href="${esc(s.url)}" rel="noopener">${esc(s.title)}</a>` : esc(s.title)}</span>${who ? ` <span class="src-who">${esc(who)}</span>` : ''}${s.date ? ` <time class="src-date">${esc(formatDate(s.date))}</time>` : ''}${s.note ? ` <span class="src-note">${esc(s.note)}</span>` : ''} <span class="src-back">${back}</span></li>`;
}

function colophon(ctx) {
  const c = ctx.site.colophon;
  const sources = ctx.citations.list();
  const used = [...ctx.assets.values()].filter((a) => a.used);
  const assetRows = used.map((a) => `<li><span class="as-title">${esc(a.title)}</span> <span class="as-meta">${esc([a.creator, a.date ? formatDate(a.date) : '', a.license].filter(Boolean).join(' · '))}</span>${a.source_page ? ` <a href="${esc(a.source_page)}" rel="noopener">Source</a>` : ''}${a.changes ? ` <span class="as-note">${esc(a.changes)}</span>` : ''}</li>`).join('');
  return `<footer class="colophon" id="sources" data-chapter data-label="Appendix" data-title="Sources &amp; credits">
<div class="colophon-inner">
<h2 class="colophon-h">Sources &amp; credits</h2>
<p class="verified"><span class="stamp">${esc(ctx.site.verifiedLabel)}</span></p>
<div class="colophon-grid">
<section class="colophon-about" aria-labelledby="about-h">
<h3 id="about-h">About this history</h3>
${c.about.map((p) => `<p>${inline(p)}</p>`).join('\n')}
<h3>Go further</h3>
<ul class="further">${c.further.map((l) => `<li><a href="${esc(l.url)}" rel="noopener">${esc(l.label)}</a> <span>${esc(l.note)}</span></li>`).join('')}</ul>
</section>
<section class="colophon-sources" aria-labelledby="src-h">
<h3 id="src-h">Sources, in order of first citation</h3>
<p class="src-intro">${inline(c.sourcesIntro)}</p>
<ol class="sources">${sources.map(sourceEntry).join('\n')}</ol>
</section>
</div>
<section class="colophon-assets" aria-labelledby="assets-h">
<h3 id="assets-h">Images and reconstructions</h3>
<p>${inline(c.assetsIntro)}</p>
${assetRows ? `<ul class="asset-list">${assetRows}</ul>` : ''}
<h3>Typefaces</h3>
<p>${inline(c.type)}</p>
</section>
<p class="fineprint">${inline(c.fineprint)}</p>
</div>
</footer>`;
}

export function renderPage(ctx) {
  const { site, chapters } = ctx;
  const nav = [
    { id: 'top', label: 'Opening', title: 'Hello, World.', years: '' },
    ...chapters.map((c) => ({ id: c.id, label: c.label, title: c.navTitle || c.title, years: c.years, tick: c.tick })),
  ];
  // The release collection sits between two chapters, as an interlude.
  const parts = [];
  for (const ch of chapters) {
    parts.push(chapter(ctx, ch));
    if (ch.id === site.releasesAfter) {
      parts.push(renderReleases(ctx));
      nav.splice(nav.findIndex((n) => n.id === ch.id) + 1, 0, { id: 'releases', label: 'Interlude', title: 'The release collection', years: '' });
    }
  }
  nav.push({ id: 'ending', label: 'Ending', title: site.ending.title, years: '' });
  nav.push({ id: 'sources', label: 'Appendix', title: 'Sources & credits', years: '' });

  // Render the body first: citations are numbered in reading order.
  const open = opening(ctx);
  const body = parts.join('\n');
  const end = endingSection(ctx);
  const foot = colophon(ctx);

  const { css, js, fonts } = ctx.paths;
  const description = site.description;
  return `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(site.title)} — ${esc(site.subtitle)}</title>
<meta name="description" content="${esc(description)}">
<meta name="color-scheme" content="light">
<meta name="theme-color" content="#f3ede2">
<meta property="og:title" content="${esc(site.title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="article">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23f3ede2'/%3E%3Ctext x='5' y='25' font-family='Georgia,serif' font-size='26' fill='%2317150f'%3EH%3C/text%3E%3Ccircle cx='26' cy='23' r='3' fill='%231d3fc4'/%3E%3C/svg%3E">
<link rel="preload" href="${fonts}/fraunces.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${fonts}/atkinson-next.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${css}">
<script>document.documentElement.className='js';try{var m=localStorage.getItem('hw-motion');if(m)document.documentElement.dataset.motion=m}catch(e){}</script>
<script type="module" src="${js}/core.js"></script>
</head>
<body>
<a class="skip" href="#main">Skip to the story</a>
${potSprite()}
${masthead(ctx, nav)}
${ruler(nav)}
<main id="main">
${open}
${body}
${end}
</main>
${foot}
</body>
</html>
`;
}

export { slug };
