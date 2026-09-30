// Exhibits: the illustrated and interactive set pieces of the story.
// Each function returns HTML that is complete and readable on its own;
// scripts in src/scripts/exhibits/ only add behaviour on top.

import { esc, inline, formatDate, countWords } from './inline.mjs';
import { specimen, site, post, pot, potGrid } from './specimen.mjs';

const RECON = 'Reconstruction in HTML and CSS';

function figure({ id, className = '', body, caption, kind = RECON, attrs = '' }) {
  return `<figure class="exhibit ${className}"${id ? ` id="${esc(id)}"` : ''} ${attrs}>
${body}
<figcaption class="exhibit-cap"><span class="exhibit-kind">${esc(kind)}</span> ${caption}</figcaption>
</figure>`;
}

/* ───────────────────────── Opening ───────────────────────── */

export function openingWindow(ctx) {
  const { specimen: sp } = ctx;
  return specimen(sp, {
    period: '2003',
    theme: 'plain',
    typing: true,
    className: 'sp--hero',
    label: `An illustrative website called ${sp.siteTitle}, drawn as it might have looked in 2003: a plain page in an old-fashioned browser window with one post, titled “${sp.postTitle}”, a short paragraph, and ${sp.imageAlt}.`,
  });
}

/* ───────────────────────── Prologue: the fork ───────────────────────── */

export function fork(ctx, block) {
  const desc = 'A line for b2/cafelog begins in 2001 and fades in late 2002, when its developer stops updating it. In 2003 three lines branch from it: b2evolution, b2++ (which later becomes WordPress MU), and WordPress, which continues to the present.';
  const tall = `<svg class="fork-svg fork-svg--tall" viewBox="0 0 360 324" role="img" aria-label="How b2 became several projects. ${desc}">
<g class="fork-grid">
<line x1="30" y1="20" x2="30" y2="296"/><line x1="130" y1="20" x2="130" y2="296"/><line x1="230" y1="20" x2="230" y2="296"/><line x1="330" y1="20" x2="330" y2="296"/>
<text x="30" y="316">2001</text><text x="130" y="316">2002</text><text x="230" y="316">2003</text><text x="330" y="316" text-anchor="middle">2004</text>
</g>
<path class="fork-line fork-line--b2" pathLength="1" d="M30 150H205"/>
<path class="fork-line fork-line--fade" pathLength="1" d="M205 150H262"/>
<path class="fork-line fork-line--wp" pathLength="1" d="M230 150C250 150 250 70 275 70H352"/>
<path class="fork-line fork-line--evo" pathLength="1" d="M230 150C250 150 252 215 275 215H352"/>
<path class="fork-line fork-line--pp" pathLength="1" d="M242 150C262 150 264 280 287 280H352"/>
<circle class="fork-dot" cx="30" cy="150" r="5"/>
<circle class="fork-dot fork-dot--wp" cx="275" cy="70" r="6"/>
<g class="fork-labels">
<text x="30" y="134" class="fork-name">b2/cafelog</text>
<text x="30" y="172" class="fork-note">Michel Valdrighi</text>
<text x="205" y="192" class="fork-note" text-anchor="end">updates stop</text>
<text x="352" y="52" class="fork-name fork-name--wp" text-anchor="end">WordPress</text>
<text x="352" y="92" class="fork-note" text-anchor="end">Mullenweg, Little</text>
<text x="352" y="201" class="fork-name" text-anchor="end">b2evolution</text>
<text x="352" y="234" class="fork-note" text-anchor="end">Planque</text>
<text x="352" y="266" class="fork-name" text-anchor="end">b2++</text>
<text x="352" y="299" class="fork-note" text-anchor="end">Ó Caoimh → WordPress MU</text>
</g>
</svg>`;
  const svg = `<svg class="fork-svg fork-svg--wide" viewBox="0 0 960 420" role="img" aria-labelledby="fork-title fork-desc">
<title id="fork-title">How b2 became several projects</title>
<desc id="fork-desc">${desc}</desc>
<g class="fork-grid">
<line x1="80" y1="30" x2="80" y2="376"/><line x1="300" y1="30" x2="300" y2="376"/><line x1="520" y1="30" x2="520" y2="376"/><line x1="740" y1="30" x2="740" y2="376"/>
<text x="80" y="402">2001</text><text x="300" y="402">2002</text><text x="520" y="402">2003</text><text x="740" y="402">2004</text>
</g>
<path class="fork-line fork-line--b2" pathLength="1" d="M80 190H470"/>
<path class="fork-line fork-line--fade" pathLength="1" d="M470 190H600"/>
<path class="fork-line fork-line--wp" pathLength="1" d="M520 190C565 190 560 100 615 100H930"/>
<path class="fork-line fork-line--evo" pathLength="1" d="M520 190C565 190 570 236 615 236H930"/>
<path class="fork-line fork-line--pp" pathLength="1" d="M545 190C590 190 600 322 660 322H930"/>
<circle class="fork-dot" cx="80" cy="190" r="6"/>
<circle class="fork-dot fork-dot--wp" cx="615" cy="100" r="7"/>
<g class="fork-labels">
<text x="80" y="170" class="fork-name">b2/cafelog</text>
<text x="80" y="216" class="fork-note">Michel Valdrighi</text>
<text x="462" y="172" class="fork-note" text-anchor="end">updates stop</text>
<text x="630" y="80" class="fork-name fork-name--wp">WordPress</text>
<text x="630" y="126" class="fork-note">Matt Mullenweg, Mike Little</text>
<text x="640" y="222" class="fork-name">b2evolution</text>
<text x="640" y="260" class="fork-note">François Planque</text>
<text x="680" y="308" class="fork-name">b2++</text>
<text x="680" y="346" class="fork-note">Donncha Ó Caoimh → WordPress MU</text>
</g>
</svg>`;
  return figure({
    className: 'exhibit--fork b--wide',
    attrs: 'data-reveal',
    kind: 'Diagram',
    caption: inline(block.caption || 'One codebase, several futures. Positions along the line are approximate.', ctx.citations),
    body: svg + tall,
  });
}

/* ───────────────────────── Chapter 1: a close look ───────────────────────── */

export function closeup(ctx, block) {
  const { specimen: sp } = ctx;
  const notes = (block.notes || []).map((n, i) => `<li><span class="mark">${i + 1}</span><span>${inline(n, ctx.citations)}</span></li>`).join('');
  const body = `<div class="closeup">
<div class="closeup-window">
${specimen(sp, { period: '2003', theme: 'plain', label: `${sp.siteTitle} in its 2003 state: a header, one post, and a short sidebar of links.` })}
<span class="pin pin--1" aria-hidden="true">1</span><span class="pin pin--2" aria-hidden="true">2</span><span class="pin pin--3" aria-hidden="true">3</span>
</div>
<ol class="closeup-notes">${notes}</ol>
</div>`;
  return figure({ className: 'exhibit--closeup b--wide', body, caption: inline(block.caption, ctx.citations) });
}

/* ───────────────────────── Chapter 2: plugins ───────────────────────── */

export function plugins(ctx, block) {
  const { specimen: sp } = ctx;
  const strip = `<div class="plug plug--strip"><span class="hook-flag">the_content</span>${['mug', 'vase', 'plate'].map((p) => `<span class="plug-thumb">${pot(p)}</span>`).join('')}</div>`;
  const form = `<div class="plug plug--form"><span class="hook-flag">the_content</span><span class="plug-label">Write to the potter</span><span class="plug-field"></span><span class="plug-field plug-field--tall"></span><span class="plug-button">Send</span></div>`;
  const counter = `<div class="plug plug--counter"><span class="hook-flag">wp_footer</span>You are visitor <span class="odometer">000412</span></div>`;
  const body = `<div class="plugins">
<div class="plugins-stage">
${specimen(sp, {
    period: '2003',
    theme: 'classic',
    asImage: false,
    slots: strip + form,
    after: counter,
  })}
</div>
<fieldset class="plugins-panel">
<legend>Plugin Management <small>(illustrative)</small></legend>
<label class="switch"><input type="checkbox" id="plug-strip"><span class="switch-name">Photo strip</span><span class="switch-desc">Adds three more pots under every post.</span></label>
<label class="switch"><input type="checkbox" id="plug-form"><span class="switch-name">Contact form</span><span class="switch-desc">Lets a reader write to the potter.</span></label>
<label class="switch"><input type="checkbox" id="plug-counter"><span class="switch-name">Visitor counter</span><span class="switch-desc">A very 2004 thing to want.</span></label>
<label class="switch switch--meta"><input type="checkbox" id="plug-hooks"><span class="switch-name">Show the hooks</span><span class="switch-desc">Mark the places where each plugin attaches.</span></label>
<pre class="plugins-code" aria-label="Example plugin code"><code><span class="c">// kiln-photo-strip.php — the whole plugin</span>
add_filter( 'the_content', 'kiln_photo_strip' );

function kiln_photo_strip( $content ) {
    return $content . kiln_more_pots();
}</code></pre>
</fieldset>
</div>`;
  return figure({ className: 'exhibit--plugins b--wide', attrs: 'data-exhibit="plugins"', body, caption: inline(block.caption, ctx.citations), kind: 'Interactive reconstruction' });
}

/* ───────────────────────── Chapter 2: the theme wardrobe ───────────────────────── */

export function wardrobe(ctx, block) {
  const { specimen: sp, themes, assets } = ctx;
  const chosen = themes.filter((t) => t.wardrobe);
  const radios = chosen.map((t, i) => `<label class="ward-opt">
<input type="radio" name="wardrobe" id="th-${esc(t.id)}" value="${esc(t.id)}"${t.id === (block.initial || 'kubrick') ? ' checked' : ''} aria-describedby="ward-note-${esc(t.id)}">
<span class="ward-year">${esc(t.year)}</span><span class="ward-name">${esc(t.name)}</span>
</label>`).join('');
  const notes = chosen.map((t) => {
    const shot = t.screenshot && assets.get(t.screenshot);
    return `<div class="ward-note" id="ward-note-${esc(t.id)}" data-for="${esc(t.id)}">
<p class="ward-title">${esc(t.name)} <span>${esc(t.version ? `WordPress ${t.version}, ${t.year}` : t.year)}</span></p>
<p class="ward-credit">${inline(t.credit, ctx.citations)}</p>
<p class="ward-about">${inline(t.about, ctx.citations)}</p>${shot ? `
<p class="ward-shot"><picture>${shot.variants.map((v) => `<source type="${v.type}" srcset="${v.srcset}" sizes="15rem">`).join('')}<img src="${esc(shot.src)}" width="${shot.thumbWidth}" height="${shot.thumbHeight}" alt="${esc(shot.alt)}" loading="lazy" decoding="async"></picture><span>${esc(shot.caption)} <a href="${esc(shot.source_page)}" rel="noopener">${esc(shot.license)}</a></span></p>` : ''}
</div>`;
  }).join('');
  const body = `<div class="wardrobe" data-count="${chosen.length}">
<fieldset class="ward-rail">
<legend>Choose a theme</legend>
${radios}
</fieldset>
<div class="ward-stage">
${specimen(sp, { period: '2010', theme: 'wardrobe', asImage: false, showNav: true, className: 'sp--wardrobe' })}
</div>
<div class="ward-notes">${notes}</div>
</div>`;
  return figure({ className: 'exhibit--wardrobe b--full', attrs: 'data-exhibit="wardrobe"', body, caption: inline(block.caption, ctx.citations), kind: 'Interactive reconstruction' });
}

/* ───────────────────────── Chapter 3: who is who ───────────────────────── */

export function entities(ctx, block) {
  const cards = block.items.map((it) => {
    ctx.words.main += countWords(it.text);
    return `<div class="entity entity--${esc(it.id)}">
<dt><span class="entity-kind">${esc(it.kind)}</span>${esc(it.name)}</dt>
<dd>${inline(it.text, ctx.citations)}</dd>
</div>`;
  }).join('');
  return `<section class="entities b--wide" aria-labelledby="entities-h">
<h3 id="entities-h" class="entities-h">${esc(block.title)}</h3>
<p class="entities-intro">${inline(block.intro, ctx.citations)}</p>
<dl class="entities-grid">${cards}</dl>
</section>`;
}

/* ───────────────────────── Chapter 4: beyond the blog ───────────────────────── */

export function beyond(ctx, block) {
  const { specimen: sp } = ctx;
  const main = `<div class="page-intro"><p class="post-title">${esc(sp.postTitle)}</p><p class="post-text">${esc(sp.paragraph)}</p></div>
<p class="section-h">Pots</p>
${potGrid(sp)}`;
  const minis = `<ul class="minis">
<li class="mini mini--library"><div class="mini-pic" role="img" aria-label="Illustration: a tenants’ association site with a searchable list of guides and forms.">
<span class="mini-bar">Harbour Tenants’ Association</span>
<span class="mini-body"><span class="mini-h">Guides &amp; forms</span><i></i><i></i><i></i><i></i></span>
</div><span class="mini-cap">An organisation publishing resources</span></li>
<li class="mini mini--photo"><div class="mini-pic" role="img" aria-label="Illustration: a photographer’s portfolio made of a grid of pictures.">
<span class="mini-bar">Mina Okafor</span>
<span class="mini-body"><i></i><i></i><i></i><i></i><i></i><i></i></span>
</div><span class="mini-cap">A photographer presenting work</span></li>
<li class="mini mini--shopfront"><div class="mini-pic" role="img" aria-label="Illustration: a bicycle repair shop’s site with opening hours and a map.">
<span class="mini-bar">Bell &amp; Daughter Cycles</span>
<span class="mini-body"><span class="mini-h">Open Tue–Sat</span><i></i><i></i><b></b></span>
</div><span class="mini-cap">A small business keeping its own site</span></li>
</ul>`;
  const body = `<div class="beyond">
<div class="beyond-main">
${specimen(sp, {
    period: '2010',
    theme: 'twentyten',
    showNav: true,
    showSide: false,
    main,
    label: `${sp.siteTitle} around 2010: the same words and bowl, now with a navigation menu of Home, About, Pots and Contact, and a gallery of four pots that are neither posts nor pages.`,
  })}
</div>
${minis}
</div>`;
  return figure({ className: 'exhibit--beyond b--full', body, caption: inline(block.caption, ctx.citations), kind: 'Illustrations — fictional sites' });
}

/* ───────────────────────── Chapter 5: a small shop ───────────────────────── */

export function shop(ctx, block) {
  const { specimen: sp } = ctx;
  const items = sp.pots.map((p) => `<li class="shop-item">
<span class="shop-pic">${pot(p.id)}</span>
<span class="shop-name">${esc(p.name)}</span>
<span class="shop-price">${esc(sp.currency)}${esc(p.price)}</span>
<button type="button" class="shop-add" data-add="${esc(p.id)}" aria-pressed="false"><span class="shop-add-off">Add to basket</span><span class="shop-add-on">In the basket</span></button>
</li>`).join('');
  const main = `<div class="shop-head"><p class="post-title">${esc(sp.postTitle)}</p><p class="post-text">${esc(sp.paragraph)}</p></div>
<p class="section-h">Shop</p>
<ul class="shop-grid">${items}</ul>`;
  const body = `<div class="shop">
<div class="sp sp--2010 sp--shop">
<div class="sp-chrome sp-chrome--2010" aria-hidden="true"><div class="sp-tabs"><span class="sp-dots"><i></i><i></i><i></i></span><span class="sp-tab">${esc(sp.siteTitle)} — Shop</span></div><div class="sp-toolbar"><span class="sp-arrows">‹ ›</span><span class="sp-address"><span>${esc(sp.address)}shop/</span></span></div></div>
<div class="sp-viewport">
<div class="site" data-theme="shop">
<div class="site-page">
<div class="site-head">
<p class="site-title"><span>${esc(sp.siteTitle)}</span></p>
<ul class="site-nav"><li>Home</li><li>About</li><li class="is-current">Shop</li><li>Contact</li></ul>
<p class="basket" role="status" aria-live="polite"><span class="basket-icon" aria-hidden="true"></span><span class="basket-text">Basket: <b class="basket-count">0</b> <span class="basket-unit">items</span></span></p>
</div>
<div class="site-body"><div class="site-main">${main}</div></div>
<div class="site-foot"><span class="foot-note">No checkout here: this shop is a drawing.</span></div>
</div>
</div>
</div>
</div>
</div>`;
  return figure({ className: 'exhibit--shop b--wide', attrs: 'data-exhibit="shop"', body, caption: inline(block.caption, ctx.citations), kind: 'Interactive illustration' });
}

/* ───────────────────────── Chapter 6: screens and data ───────────────────────── */

export function viewport(ctx, block) {
  const { specimen: sp } = ctx;
  const json = {
    id: 1,
    date: `${sp.postDate}T09:14:00`,
    slug: 'hello-world',
    type: 'post',
    title: { rendered: sp.postTitle },
    content: { rendered: `<p>${sp.paragraph}</p>` },
    author: 1,
    featured_media: 7,
  };
  const pretty = esc(JSON.stringify(json, null, 2))
    .replace(/&quot;([a-z_]+)&quot;:/g, '<span class="k">&quot;$1&quot;</span>:');
  const body = `<div class="viewport">
<fieldset class="vp-controls">
<legend>Show the same post on</legend>
<label><input type="radio" name="vp" id="vp-desktop" checked><span>A desktop monitor</span></label>
<label><input type="radio" name="vp" id="vp-phone"><span>A phone</span></label>
<label><input type="radio" name="vp" id="vp-data"><span>No screen at all</span></label>
</fieldset>
<div class="vp-stage">
<div class="vp-device">
${specimen(sp, { period: '2020', theme: 'responsive', showNav: true, showSide: false, asImage: false, className: 'sp--vp' })}
</div>
<div class="vp-json" aria-label="The post as data">
<p class="vp-req"><span>GET</span> /wp-json/wp/v2/posts/1</p>
<pre><code>${pretty}</code></pre>
</div>
</div>
</div>`;
  return figure({ className: 'exhibit--viewport b--wide', attrs: 'data-exhibit="viewport"', body, caption: inline(block.caption, ctx.citations), kind: 'Interactive reconstruction' });
}

export function track(ctx, block) {
  const steps = block.steps.map((s) => `<li class="track-step track-step--${esc(s.stage)}">
<span class="track-stage">${esc(s.label)}</span>
<span class="track-date">${esc(s.date)}</span>
<span class="track-text">${inline(s.text, ctx.citations)}</span>
</li>`).join('');
  return `<figure class="exhibit exhibit--track b--wide">
<ol class="track">${steps}</ol>
<figcaption class="exhibit-cap"><span class="exhibit-kind">Diagram</span> ${inline(block.caption, ctx.citations)}</figcaption>
</figure>`;
}

/* ───────────────────────── Chapter 7: blocks ───────────────────────── */

function editorDoc(sp, extra) {
  return `<div class="ed-block ed-block--heading" data-block="Heading"><p class="ed-h">${esc(sp.postTitle)}</p></div>
<div class="ed-block ed-block--para" data-block="Paragraph"><p>${esc(sp.paragraph)}</p></div>
<div class="ed-block ed-block--image" data-block="Image"><div class="ed-img">${pot('bowl')}</div></div>
<div class="ed-block ed-block--para" data-block="Paragraph"><p>${esc(extra)}</p></div>`;
}

export function blockScene(ctx, block) {
  const { specimen: sp } = ctx;
  const steps = block.steps.map((s, i) => {
    ctx.words.main += countWords(s.text);
    return `<div class="step" data-step="${i}">
<p class="step-label">${esc(s.label)}</p>
<p>${inline(s.text, ctx.citations)}</p>
</div>`;
  }).join('');
  return `<div class="scene scene--blocks b--full" data-scene="steps" data-step="${block.steps.length - 1}">
<div class="scene-visual">
<figure class="editor" role="img" aria-label="An editing screen holding the ${esc(sp.siteTitle)} post. As the story advances, its heading, paragraphs and picture are outlined and labelled as separate blocks, without the article itself changing.">
<div class="ed-bar ed-bar--classic" aria-hidden="true"><span class="ed-tab is-on">Visual</span><span class="ed-tab">Text</span><span class="ed-tools"><b>B</b><i>I</i><u>link</u><span>b-quote</span><span>img</span><span>ul</span><span>more</span></span></div>
<div class="ed-bar ed-bar--blocks" aria-hidden="true"><span class="ed-plus">+</span><span class="ed-crumb">Document <span>›</span> <em>Paragraph</em></span><span class="ed-publish">Update</span></div>
<div class="ed-canvas">${editorDoc(sp, block.second)}</div>
<div class="ed-source" aria-hidden="true"><code>&lt;!-- wp:paragraph --&gt;</code><code>&lt;p&gt;I made a bowl today…&lt;/p&gt;</code><code>&lt;!-- /wp:paragraph --&gt;</code></div>
</figure>
<p class="scene-cap"><span class="exhibit-kind">Reconstruction</span> ${inline(block.caption, ctx.citations)}</p>
</div>
<div class="scene-steps">${steps}</div>
</div>`;
}

export function blockPlay(ctx, block) {
  const { specimen: sp } = ctx;
  const blocks = [
    { type: 'heading', name: 'Heading', html: `<p class="ed-h">${esc(sp.postTitle)}</p>`, saved: `<h2 class="wp-block-heading">${sp.postTitle}</h2>` },
    { type: 'paragraph', name: 'Paragraph', html: `<p>${esc(sp.paragraph)}</p>`, saved: `<p>${sp.paragraph.slice(0, 22)}…</p>` },
    { type: 'image', name: 'Image', html: `<div class="ed-img">${pot('bowl')}</div>`, saved: '<figure class="wp-block-image"><img src="bowl-1.jpg" alt=""/></figure>' },
    { type: 'paragraph', name: 'Paragraph', html: `<p>${esc(block.second)}</p>`, saved: `<p>${block.second.slice(0, 22)}…</p>` },
  ];
  const items = blocks.map((b, i) => `<li class="play-block play-block--${b.type}" data-type="${b.type}" data-saved="${esc(b.saved)}" data-name="${b.name}" data-id="${i}" draggable="false">
<span class="play-tag">${b.name}</span>
<span class="play-grip" aria-hidden="true"></span>
<div class="play-body">${b.html}</div>
<span class="play-tools">
<button type="button" class="play-move" data-move="-1" aria-label="Move ${b.name} up"><span aria-hidden="true">↑</span></button>
<button type="button" class="play-move" data-move="1" aria-label="Move ${b.name} down"><span aria-hidden="true">↓</span></button>
</span>
</li>`).join('');
  const saved = blocks.map((b) => `&lt;!-- wp:${b.type} --&gt;\n${esc(b.saved)}\n&lt;!-- /wp:${b.type} --&gt;`).join('\n\n');
  const body = `<div class="play">
<div class="play-editor">
<div class="ed-bar ed-bar--blocks" aria-hidden="true"><span class="ed-plus">+</span><span class="ed-crumb">Document</span><span class="ed-publish">Update</span></div>
<ol class="play-list" aria-label="Blocks in the post, in order">${items}</ol>
<p class="play-actions"><button type="button" class="play-reset">Put everything back</button><span class="play-status" role="status" aria-live="polite"></span></p>
</div>
<div class="play-saved">
<p class="play-saved-h">What gets saved</p>
<pre><code class="play-code">${saved}</code></pre>
</div>
</div>`;
  return figure({ className: 'exhibit--play b--wide', attrs: 'data-exhibit="blocks"', body, caption: inline(block.caption, ctx.citations), kind: 'Interactive reconstruction' });
}

/* ───────────────────────── Chapter 8: the whole site ───────────────────────── */

export function siteScene(ctx, block) {
  const { specimen: sp } = ctx;
  const steps = block.steps.map((s, i) => {
    ctx.words.main += countWords(s.text);
    return `<div class="step" data-step="${i}">
<p class="step-label">${esc(s.label)}</p>
<p>${inline(s.text, ctx.citations)}</p>
</div>`;
  }).join('');
  const main = `<div class="zone zone--content" data-zone="Post content">${post(sp)}</div>
<div class="zone zone--query" data-zone="Pattern: three pots">${potGrid(sp, { count: 3 })}</div>`;
  return `<div class="scene scene--site b--full" data-scene="steps" data-step="${block.steps.length - 1}">
<div class="scene-visual">
<figure class="fse" role="img" aria-label="${esc(sp.siteTitle)} inside an editor. At first only the post’s content can be edited; step by step the editable area grows to include the header, the footer and finally the whole site’s colours and type.">
<div class="fse-bar" aria-hidden="true"><span class="fse-w"></span><span class="fse-crumb"><b class="c0">Post</b><b class="c1">Post</b><b class="c2">Template: Single</b><b class="c3">Styles</b></span><span class="fse-save">Save</span></div>
<div class="fse-canvas">
<div class="site" data-theme="block">
<div class="site-page">
<div class="zone zone--header" data-zone="Template part: Header"><div class="site-head"><p class="site-title"><span>${esc(sp.siteTitle)}</span></p><ul class="site-nav">${sp.pages.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div></div>
<div class="site-body"><div class="site-main">${main}</div></div>
<div class="zone zone--footer" data-zone="Template part: Footer"><div class="site-foot"><span class="foot-note">${esc(sp.siteTitle)} · Proudly powered by WordPress</span></div></div>
</div>
</div>
<div class="fse-styles" aria-hidden="true"><span class="fse-styles-h">Styles</span><span class="sw sw1"></span><span class="sw sw2"></span><span class="sw sw3"></span><span class="fse-aa">Aa</span></div>
</div>
</figure>
<p class="scene-cap"><span class="exhibit-kind">Reconstruction</span> ${inline(block.caption, ctx.citations)}</p>
</div>
<div class="scene-steps">${steps}</div>
</div>`;
}

export function variations(ctx, block) {
  const { specimen: sp } = ctx;
  const opts = block.options.map((o, i) => `<label class="var-opt var-opt--${esc(o.id)}"><input type="radio" name="variation" id="var-${esc(o.id)}"${i === 0 ? ' checked' : ''}><span class="var-swatch" aria-hidden="true"><i></i><i></i><i></i></span><span class="var-name">${esc(o.name)}</span></label>`).join('');
  const main = `${post(sp)}<p class="section-h">From the kiln</p>${potGrid(sp, { count: 3 })}`;
  const body = `<div class="variations">
<fieldset class="var-rail"><legend>Style variation</legend>${opts}</fieldset>
<div class="var-stage">
${specimen(sp, { period: '2020', theme: 'block', showNav: true, showSide: false, showTagline: false, asImage: false, main, className: 'sp--var' })}
</div>
</div>`;
  return figure({ className: 'exhibit--variations b--wide', attrs: 'data-exhibit="variations"', body, caption: inline(block.caption, ctx.citations), kind: 'Interactive reconstruction' });
}

/* ───────────────────────── Chapter 10: share of the web ───────────────────────── */

// Decimal year for a date such as "2026-09-30".
function yearFraction(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const start = Date.UTC(y, 0, 1);
  const end = Date.UTC(y + 1, 0, 1);
  return y + (Date.UTC(y, m - 1, d) - start) / (end - start);
}

export function share(ctx, block) {
  const { points, series } = ctx.marketshare;
  const x0 = yearFraction(points[0].date);
  const x1 = yearFraction(points[points.length - 1].date);
  const yMax = 70;
  const px = (p) => ((yearFraction(p.date) - x0) / (x1 - x0)) * 100;
  const py = (v) => (v / yMax) * 100;
  const line = (id) => points.map((p) => `${px(p).toFixed(2)},${(100 - py(p[id])).toFixed(2)}`).join(' ');
  const last = points[points.length - 1];
  const peak = (id) => points.reduce((best, p) => (p[id] > best[id] ? p : best), points[0]);
  const label = (p) => (p.date.endsWith('-01-01') ? `1 Jan ${p.date.slice(0, 4)}` : formatDate(p.date));

  const grid = [0, 20, 40, 60].map((v) => `<line class="share-grid" x1="0" x2="100" y1="${100 - py(v)}" y2="${100 - py(v)}" vector-effect="non-scaling-stroke"/>`).join('');
  const yTicks = [0, 20, 40, 60].map((v) => `<span class="share-yt" style="bottom:${py(v)}%">${v}%</span>`).join('');
  const xTicks = points.filter((p) => p.date.endsWith('-01-01') && Number(p.date.slice(0, 4)) % 2 === 1)
    .map((p) => `<span class="share-xt" style="left:${px(p).toFixed(2)}%">${p.date.slice(0, 4)}</span>`).join('');
  const marks = series.map((s) => `<i class="share-dot share-dot--${s.id}" style="left:100%;bottom:${py(last[s.id])}%"></i>
<span class="share-end" style="bottom:${py(last[s.id])}%">${last[s.id]}%</span>`).join('\n');
  const legend = series.map((s) => `<li><i class="share-key share-key--${s.id}"></i>${esc(s.label)}</li>`).join('');
  const rows = points.map((p) => `<tr><th scope="row">${esc(label(p))}</th><td>${p.all.toFixed(1)}%</td><td>${p.cms.toFixed(1)}%</td></tr>`).join('');
  const data = esc(JSON.stringify(points.map((p) => ({ x: Number(px(p).toFixed(2)), label: label(p), all: p.all, cms: p.cms }))));
  const summary = `Line chart. The share of all websites running WordPress rises from ${points[0].all}% in 2015 to a peak of ${peak('all').all}% at the start of ${peak('all').date.slice(0, 4)} and stands at ${last.all}% on ${formatDate(last.date)}. Its share of websites with a known content management system peaks at ${peak('cms').cms}% in ${peak('cms').date.slice(0, 4)} and stands at ${last.cms}%. The figures are in the table that follows.`;
  const body = `<div class="share" data-points="${data}">
<p class="share-title">${esc(block.title)}</p>
<ul class="share-legend">${legend}</ul>
<div class="share-plot" role="img" aria-label="${esc(summary)}">
<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
${grid}
<polyline class="share-line share-line--cms" points="${line('cms')}" vector-effect="non-scaling-stroke"/>
<polyline class="share-line share-line--all" points="${line('all')}" vector-effect="non-scaling-stroke"/>
</svg>
${yTicks}
${xTicks}
${marks}
<span class="share-cross" hidden></span>
<div class="share-tip" hidden></div>
</div>
<details class="share-table">
<summary>View these figures as a table</summary>
<table>
<thead><tr><th scope="col">Date</th><th scope="col">Of all websites</th><th scope="col">Of websites whose CMS is known</th></tr></thead>
<tbody>${rows}</tbody>
</table>
</details>
</div>`;
  return figure({ className: 'exhibit--share b--wide', attrs: 'data-exhibit="share"', body, caption: inline(block.caption, ctx.citations), kind: 'Chart · W3Techs data' });
}

/* ───────────────────────── Ending ───────────────────────── */

export function ending(ctx, block) {
  const { specimen: sp, site: meta } = ctx;
  const now = formatDate(meta.verifiedThrough);
  const newPost = `<div class="post post--yours" hidden>
<p class="post-date">${esc(now)}</p>
<p class="post-title yours-text"></p>
<p class="post-meta">Published by you — only on this page</p>
</div>`;
  const main = `${newPost}${post(sp)}<p class="section-h">From the kiln</p>${potGrid(sp, { shop: true, count: 3 })}`;
  return `<div class="ending-pair b--full">
<figure class="ending-then">
${specimen(sp, { period: '2003', theme: 'plain', label: `${sp.siteTitle} as it began in 2003: one plain post titled “${sp.postTitle}”.` })}
<figcaption><span class="mono">2003</span> A title, a paragraph, a picture.</figcaption>
</figure>
<figure class="ending-now" data-exhibit="publish">
${specimen(sp, { period: '2020', theme: 'block', showNav: true, showSide: false, showTagline: false, asImage: false, main, className: 'sp--now' })}
<figcaption><span class="mono">2026</span> The same title, paragraph and picture — and everything that gathered around them. <span class="exhibit-kind">Illustration</span></figcaption>
</figure>
</div>
<form class="publish b--text" data-publish hidden>
<label for="publish-input" class="publish-q">${esc(block.question)}</label>
<p class="publish-row"><input type="text" id="publish-input" maxlength="120" autocomplete="off" placeholder="${esc(block.placeholder)}" aria-describedby="publish-note"><button type="submit">Publish</button></p>
<p class="publish-note" id="publish-note">${esc(block.note)}</p>
<p class="publish-status" role="status" aria-live="polite"></p>
</form>`;
}

export const registry = {
  fork, closeup, plugins, wardrobe, entities, beyond, shop, viewport, track,
  blockScene, blockPlay, siteScene, variations, share, ending,
};
