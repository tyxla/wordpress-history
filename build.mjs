#!/usr/bin/env node
// Builds the site into dist/. No dependencies: `node build.mjs`.
//
//   content/   the history itself — text, dates, sources, releases, assets
//   src/       templates, styles, scripts, fonts and images
//   dist/      the finished static site
//
// Pass --strict to fail on any editorial problem (unknown source, quote
// without a citation, missing asset…), which is what `npm run check` does.

import { promises as fs } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const strict = process.argv.includes('--strict');

const read = (p) => fs.readFile(path.join(root, p), 'utf8');
const readJson = async (p) => JSON.parse(await read(p));

async function listFiles(dir, base = dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listFiles(full, base)));
    else out.push(path.relative(base, full));
  }
  return out.sort();
}

const CSS_ORDER = ['base.css', 'chrome.css', 'story.css', 'specimen.css', 'themes.css', 'exhibits.css', 'releases.css', 'ending.css'];

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,])\s*/g, '$1')
    .replace(/:\s+/g, ':')
    .replace(/;}/g, '}')
    .trim();
}

// Theme rules are written once, against `.site[data-theme="x"]`. For the
// themes in the wardrobe the same rules must also apply when that theme's
// radio button is checked, so the exhibit works without any JavaScript.
function expandThemes(css, themes) {
  let out = css;
  const notes = [];
  for (const t of themes.filter((x) => x.wardrobe)) {
    const from = `.site[data-theme="${t.id}"]`;
    const to = `:is(.site[data-theme="${t.id}"], .wardrobe:has(#th-${t.id}:checked) .site)`;
    out = out.split(from).join(to);
    notes.push(`.wardrobe:has(#th-${t.id}:checked) .ward-note[data-for="${t.id}"]{display:block}`);
  }
  return `${out}\n${notes.join('\n')}`;
}

function prepareAssets(list, imagesPath) {
  const map = new Map();
  for (const a of list) {
    const widths = a.widths || [a.width];
    const ext = a.fallback || 'jpg';
    const largest = Math.max(...widths);
    const ratio = a.height / a.width;
    const variants = [];
    if (a.webp !== false) {
      variants.push({ type: 'image/webp', srcset: widths.map((w) => `${imagesPath}/${a.file}-${w}.webp ${w}w`).join(', ') });
    }
    map.set(a.id, {
      ...a,
      kind: a.kind || 'Photograph',
      src: `${imagesPath}/${a.file}-${largest}.${ext}`,
      width: largest,
      height: Math.round(largest * ratio),
      thumbWidth: a.thumbWidth || Math.min(largest, 320),
      thumbHeight: Math.round((a.thumbWidth || Math.min(largest, 320)) * ratio),
      variants,
      used: false,
    });
  }
  return map;
}

async function main() {
  const started = Date.now();
  const { renderPage } = await import('./src/templates/page.mjs');
  const { Citations } = await import('./src/templates/inline.mjs');

  const site = await readJson('content/site.json');
  const chapterFiles = (await fs.readdir(path.join(root, 'content/chapters'))).filter((f) => f.endsWith('.json')).sort();
  const chapters = await Promise.all(chapterFiles.map((f) => readJson(`content/chapters/${f}`)));
  const sources = await readJson('content/sources.json');
  const releases = await readJson('content/releases.json');
  const themes = await readJson('content/themes.json');
  const assetList = await readJson('content/assets.json');
  const specimen = await readJson('content/specimen.json');
  const marketshare = await readJson('content/marketshare.json');

  // Styles and scripts live in a folder named after their contents, so they
  // can be cached forever and still change when the site does.
  const cssSource = (await Promise.all(CSS_ORDER.map((f) => read(`src/styles/${f}`)))).join('\n');
  const css = minifyCss(expandThemes(cssSource, themes));
  const scripts = await listFiles(path.join(root, 'src/scripts'));
  const scriptSources = await Promise.all(scripts.map((f) => read(`src/scripts/${f}`)));
  const stamp = createHash('sha256').update(css).update(scriptSources.join('')).digest('hex').slice(0, 10);

  const paths = {
    css: `assets/${stamp}/site.css`,
    js: `assets/${stamp}/js`,
    fonts: 'assets/fonts',
    images: 'assets/images',
  };

  const ctx = {
    site,
    chapters,
    releases,
    themes,
    specimen,
    marketshare,
    paths,
    citations: new Citations(sources),
    assets: prepareAssets(assetList, paths.images),
    usedAssets: new Set(),
    words: { main: 0, extra: 0 },
    problems: [],
  };

  // First pass marks which assets are used; the page is rendered once.
  const html = await renderWithAssets(renderPage, ctx);

  await fs.rm(dist, { recursive: true, force: true });
  await fs.mkdir(path.join(dist, 'assets', stamp, 'js'), { recursive: true });
  await fs.writeFile(path.join(dist, 'index.html'), html);
  await fs.writeFile(path.join(dist, paths.css), css);
  for (const [i, file] of scripts.entries()) {
    const target = path.join(dist, paths.js, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, scriptSources[i]);
  }
  await fs.cp(path.join(root, 'src/fonts'), path.join(dist, paths.fonts), { recursive: true });
  await fs.mkdir(path.join(dist, paths.images), { recursive: true });
  await fs.cp(path.join(root, 'src/images'), path.join(dist, paths.images), { recursive: true }).catch(() => {});
  await fs.writeFile(path.join(dist, '404.html'), notFound(site, paths));
  // Styles and scripts are content-addressed, so they can be cached for good.
  await fs.writeFile(path.join(dist, '_headers'), `/assets/${stamp}/*\n  Cache-Control: public, max-age=31536000, immutable\n/assets/fonts/*\n  Cache-Control: public, max-age=2592000\n`);

  // Editorial report.
  for (const id of ctx.citations.missing) ctx.problems.push(`Citation of an unknown source: ${id}`);
  const cited = new Set(ctx.citations.order);
  const unused = sources.filter((s) => !cited.has(s.id)).map((s) => s.id);
  const size = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(1)} KB`;
  console.log(`Built dist/ in ${Date.now() - started} ms`);
  console.log(`  index.html ${size(html)} · site.css ${size(css)} · ${scripts.length} scripts ${size(scriptSources.join(''))}`);
  console.log(`  ${chapters.length} chapters · ${ctx.words.main} words on the main path · ${ctx.words.extra} in archives and notes`);
  console.log(`  ${(ctx.words.byChapter || []).map(([label, n]) => `${label.replace('Chapter ', 'Ch')} ${n}`).join(' · ')}`);
  console.log(`  ${cited.size} sources cited · ${releases.length} releases · ${ctx.usedAssets.size} images`);
  if (unused.length) console.log(`  Sources never cited: ${unused.join(', ')}`);
  if (ctx.problems.length) {
    console.log(`\n${ctx.problems.length} problem(s):`);
    for (const p of ctx.problems) console.log(`  - ${p}`);
    if (strict) process.exit(1);
  }
}

async function renderWithAssets(renderPage, ctx) {
  // Assets used by exhibits (theme screenshots) are marked here as well.
  for (const t of ctx.themes) if (t.wardrobe && t.screenshot && ctx.assets.has(t.screenshot)) ctx.usedAssets.add(t.screenshot);
  // Figures register themselves while rendering; the colophon (rendered last)
  // reads the flag, so flag lazily through a getter.
  for (const [id, asset] of ctx.assets) {
    Object.defineProperty(asset, 'used', { get: () => ctx.usedAssets.has(id), enumerable: true });
  }
  return renderPage(ctx);
}

function notFound(site, paths) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found — ${site.title}</title>
<link rel="stylesheet" href="/${paths.css}">
</head>
<body class="notfound">
<main>
<p class="eyebrow">404</p>
<h1 class="opening-title">Nothing here<span>.</span></h1>
<p>This history is a single page. <a href="/">Start from “Hello, world.”</a></p>
</main>
</body>
</html>
`;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
