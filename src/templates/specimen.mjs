// The "living website": one small, fictional site that is redrawn in every era.
// Its words and its crooked bowl never change; everything around them does.

import { esc, formatDate } from './inline.mjs';

// Drawn once, reused everywhere through <use>. Colours come from CSS custom
// properties so that each historical "theme" can glaze the pots its own way.
export function potSprite() {
  return `<svg class="sprite" width="0" height="0" aria-hidden="true" focusable="false">
<symbol id="pot-bowl" viewBox="0 0 240 160">
<ellipse cx="122" cy="141" rx="66" ry="7" fill="var(--pot-shadow)"/>
<path d="M37 63C42 106 70 133 97 135L151 136C180 131 200 101 205 55Z" fill="var(--pot)"/>
<path d="M37 63C70 79 170 73 205 55C204 69 201 80 198 88C186 92 178 84 170 93C162 102 157 119 148 115C140 111 145 94 132 94C118 94 121 105 108 103C96 101 98 92 84 92C68 92 60 100 48 92C43 84 39 74 37 63Z" fill="var(--pot-glaze)"/>
<ellipse cx="121" cy="59" rx="84.2" ry="12.5" transform="rotate(-2.7 121 59)" fill="var(--pot-in)"/>
</symbol>
<symbol id="pot-mug" viewBox="0 0 240 160">
<ellipse cx="120" cy="141" rx="58" ry="7" fill="var(--pot-shadow)"/>
<path d="M164 60C198 56 200 110 162 106" fill="none" stroke="var(--pot)" stroke-width="12" stroke-linecap="round"/>
<path d="M70 42L75 128C75 134 81 138 89 138L149 138C157 138 163 134 163 128L168 42Z" fill="var(--pot)"/>
<path d="M70 42L72 78C86 84 96 74 108 80C120 86 124 76 138 80C150 84 158 76 166 78L168 42Z" fill="var(--pot-glaze)"/>
<ellipse cx="119" cy="42" rx="49" ry="8" fill="var(--pot-in)"/>
</symbol>
<symbol id="pot-vase" viewBox="0 0 240 160">
<ellipse cx="120" cy="143" rx="44" ry="6" fill="var(--pot-shadow)"/>
<path d="M105 24L105 52C70 66 62 118 97 140L143 140C178 118 170 66 135 52L135 24Z" fill="var(--pot)"/>
<path d="M105 24L105 52C92 58 83 68 78 80C92 88 104 78 118 84C134 90 146 80 162 82C157 68 148 58 135 52L135 24Z" fill="var(--pot-glaze)"/>
<ellipse cx="120" cy="24" rx="15" ry="4" fill="var(--pot-in)"/>
</symbol>
<symbol id="pot-plate" viewBox="0 0 240 160">
<ellipse cx="121" cy="112" rx="88" ry="14" fill="var(--pot-shadow)"/>
<ellipse cx="120" cy="92" rx="94" ry="30" fill="var(--pot)"/>
<ellipse cx="120" cy="88" rx="80" ry="23" fill="var(--pot-glaze)"/>
<ellipse cx="120" cy="87" rx="56" ry="14" fill="var(--pot-in)"/>
</symbol>
</svg>`;
}

export function pot(name, className = '') {
  return `<svg class="pot ${className}" viewBox="0 0 240 160" aria-hidden="true" focusable="false"><use href="#pot-${name}"/></svg>`;
}

// Browser window furniture, loosely in the manner of three periods.
function chrome(sp, { period = '2003', address }) {
  const url = esc(address || sp.address);
  if (period === '2003') {
    return `<div class="sp-chrome sp-chrome--2003" aria-hidden="true">
<div class="sp-titlebar"><span class="sp-titletext">${esc(sp.siteTitle)} — Web Browser</span><span class="sp-winbtns"><i></i><i></i><i></i></span></div>
<div class="sp-toolbar"><span class="sp-tool">Back</span><span class="sp-tool">Forward</span><span class="sp-tool">Reload</span><span class="sp-address"><b>Address</b><span>${url}</span></span></div>
</div>`;
  }
  if (period === '2010') {
    return `<div class="sp-chrome sp-chrome--2010" aria-hidden="true">
<div class="sp-tabs"><span class="sp-dots"><i></i><i></i><i></i></span><span class="sp-tab">${esc(sp.siteTitle)}</span></div>
<div class="sp-toolbar"><span class="sp-arrows">‹ ›</span><span class="sp-address"><span>${url}</span></span></div>
</div>`;
  }
  return `<div class="sp-chrome sp-chrome--2020" aria-hidden="true">
<span class="sp-dots"><i></i><i></i><i></i></span><span class="sp-address"><span>${url}</span></span>
</div>`;
}

function sidebar(sp) {
  const links = sp.links.map((l) => `<li>${esc(l)}</li>`).join('');
  return `<div class="site-side">
<p class="side-h">Links</p><ul>${links}</ul>
<p class="side-h">Categories</p><ul><li>General</li><li>Glazes</li><li>Kiln log</li></ul>
<p class="side-h">Archives</p><ul><li>${esc(formatDate(sp.postDate.slice(0, 7)))}</li></ul>
</div>`;
}

function nav(sp) {
  return `<ul class="site-nav">${sp.pages.map((p, i) => `<li${i === 0 ? ' class="is-current"' : ''}>${esc(p)}</li>`).join('')}</ul>`;
}

export function potGrid(sp, { shop = false, count = 4 } = {}) {
  const items = sp.pots.slice(0, count).map((p) => `<li class="pots-item" data-pot="${esc(p.id)}">
<span class="pots-pic">${pot(p.id)}</span>
<span class="pots-name">${esc(p.name)}</span>${shop ? `
<span class="pots-price">${esc(sp.currency)}${esc(p.price)}</span>` : ''}
</li>`).join('');
  return `<ul class="pots">${items}</ul>`;
}

// The post that never changes.
export function post(sp, { typing = false, slots = '' } = {}) {
  const title = typing
    ? `<span class="type" data-type="${esc(sp.postTitle)}">${esc(sp.postTitle)}</span><span class="caret" aria-hidden="true"></span>`
    : esc(sp.postTitle);
  return `<div class="post">
<p class="post-date">${esc(formatDate(sp.postDate))}</p>
<p class="post-title">${title}</p>
<p class="post-meta">Filed under: General — ${esc(sp.author)}</p>
<div class="post-content">
<p class="post-text">${esc(sp.paragraph)}</p>
<div class="post-figure">${pot('bowl')}<span class="post-figcap">${esc(sp.imageCaption)}</span></div>
</div>${slots}
<p class="post-foot">Comments (0)</p>
</div>`;
}

export function site(sp, opts = {}) {
  const {
    theme = 'plain',
    showNav = false,
    showSide = true,
    showTagline = true,
    before = '',
    after = '',
    slots = '',
    typing = false,
    main,
  } = opts;
  return `<div class="site" data-theme="${esc(theme)}">
<div class="site-page">
<div class="site-head">
<p class="site-title"><span>${esc(sp.siteTitle)}</span></p>${showTagline ? `
<p class="site-tagline">${esc(sp.tagline)}</p>` : ''}
<div class="site-banner"></div>${showNav ? `
${nav(sp)}` : ''}
</div>
<div class="site-body">
<div class="site-main">${before}${main ?? post(sp, { typing, slots })}${after}</div>${showSide ? `
${sidebar(sp)}` : ''}
</div>
<div class="site-foot"><span class="foot-note">${esc(sp.siteTitle)} is proudly powered by WordPress</span></div>
</div>
</div>`;
}

// A framed specimen. `label` describes the picture for people who cannot see it;
// when `asImage` is false the inner text stays readable (used by interactive exhibits).
export function specimen(sp, opts = {}) {
  const { period = '2003', label, asImage = true, className = '', address, attrs = '' } = opts;
  const a11y = asImage && label ? ` role="img" aria-label="${esc(label)}"` : '';
  return `<div class="sp sp--${esc(period)} ${esc(className)}"${a11y} ${attrs}>
${chrome(sp, { period, address })}
<div class="sp-viewport">${site(sp, opts)}</div>
</div>`;
}
