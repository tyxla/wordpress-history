#!/usr/bin/env node
// A tiny static server for dist/.  `node tools/serve.mjs [--watch] [--port 4173]`
// With --watch, the site is rebuilt whenever content/ or src/ changes.

import { createServer } from 'node:http';
import { promises as fs, watch } from 'node:fs';
import { spawn } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const args = process.argv.slice(2);
const port = Number(args[args.indexOf('--port') + 1]) || 4173;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

function build() {
  return new Promise((resolve) => {
    spawn(process.execPath, [path.join(root, 'build.mjs')], { stdio: 'inherit' }).on('exit', resolve);
  });
}

createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  let file = path.join(dist, decodeURIComponent(url.pathname));
  if (!file.startsWith(dist)) {
    response.writeHead(403).end();
    return;
  }
  try {
    if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
    let body = await fs.readFile(file);
    const headers = { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' };
    // Compress text, as any real host would.
    if (/^(text|application\/json)/.test(headers['content-type']) && /gzip/.test(request.headers['accept-encoding'] || '')) {
      body = gzipSync(body);
      headers['content-encoding'] = 'gzip';
    }
    response.writeHead(200, headers);
    response.end(body);
  } catch {
    const body = await fs.readFile(path.join(dist, '404.html')).catch(() => 'Not found');
    response.writeHead(404, { 'content-type': 'text/html; charset=utf-8' }).end(body);
  }
}).listen(port, () => console.log(`Serving dist/ at http://localhost:${port}`));

if (args.includes('--watch')) {
  await build();
  let timer;
  for (const dir of ['content', 'src']) {
    watch(path.join(root, dir), { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(build, 120);
    });
  }
}
