// The release collection: every major release as a record sleeve.

import { esc, inline, formatDate } from './inline.mjs';

// A small deterministic hash so that each sleeve keeps its design between builds.
function hash(str) {
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

// Neighbouring sleeves never share a layout or a colourway.
const previous = { layout: -1, colour: -1 };
function sleeve(r) {
  const h = hash(r.version + (r.codename || ''));
  let layout = h % 6;
  let colour = (h >> 5) % 6;
  if (layout === previous.layout) layout = (layout + 1 + ((h >> 9) % 4)) % 6;
  if (colour === previous.colour) colour = (colour + 1 + ((h >> 12) % 4)) % 6;
  previous.layout = layout;
  previous.colour = colour;
  const name = r.codename || '—';
  return `<div class="sleeve sleeve--l${layout} sleeve--c${colour}" aria-hidden="true">
<span class="sleeve-shape"></span>
<span class="sleeve-ver">${esc(r.version)}</span>
<span class="sleeve-name">${esc(name)}</span>
<span class="sleeve-year">${esc(r.date.slice(0, 4))}</span>
</div>`;
}

export function renderReleases(ctx) {
  const { releases, site } = ctx;
  const meta = site.releases;
  const decades = [...new Set(releases.map((r) => `${r.date.slice(0, 3)}0s`))];
  previous.layout = -1;
  previous.colour = -1;
  const items = releases.map((r) => {
    const q = [r.version, r.codename, r.musician, r.instrument, r.date.slice(0, 4), r.highlight].filter(Boolean).join(' ').toLowerCase();
    const honour = r.musician ? `for ${esc(r.musician)}${r.instrument ? `, ${esc(r.instrument)}` : ''}` : 'no codename';
    return `<li class="record" data-q="${esc(q)}" data-decade="${r.date.slice(0, 3)}0s">
${sleeve(r)}
<p class="record-title"><span class="record-ver">${esc(r.version)}</span>${r.codename ? ` <span class="record-name">“${esc(r.codename)}”</span>` : ''}</p>
<p class="record-meta"><time datetime="${esc(r.date)}">${esc(formatDate(r.date))}</time> · ${honour}</p>
<p class="record-note">${esc(r.highlight)}${r.url ? ` <a href="${esc(r.url)}" rel="noopener" aria-label="Announcement for WordPress ${esc(r.version)}">Announcement</a>` : ''}</p>
</li>`;
  }).join('\n');
  const chips = decades.map((d) => `<button type="button" class="chip" data-decade="${d}" aria-pressed="false">${d}</button>`).join('');
  return `<section class="releases" id="releases" data-chapter data-label="Interlude" data-title="The release collection" data-exhibit="releases" aria-labelledby="releases-h">
<div class="releases-inner">
<header class="releases-head">
<p class="chapter-kicker"><span>Interlude</span><span class="chapter-years">${releases.length} records</span></p>
<h2 id="releases-h" class="chapter-title">${esc(meta.title)}<span class="dot">.</span></h2>
<p class="chapter-dek">${inline(meta.dek, ctx.citations)}</p>
<form class="crate-search" role="search" hidden>
<label for="crate-q">Search the collection</label>
<input type="search" id="crate-q" placeholder="${esc(meta.placeholder)}" autocomplete="off" spellcheck="false">
<span class="crate-chips" role="group" aria-label="Filter by decade">${chips}</span>
<p class="crate-count" role="status" aria-live="polite"></p>
</form>
</header>
<ol class="crate">
${items}
</ol>
<p class="crate-empty" hidden>${esc(meta.empty)}</p>
<p class="crate-foot">${inline(meta.foot, ctx.citations)}</p>
</div>
</section>`;
}
