#!/usr/bin/env node
// Requests every source URL in content/sources.json and reports the ones that
// do not answer. `node tools/check-links.mjs [--all]`
//
// Some sites refuse automated requests (403/429) although the page exists;
// those are listed separately so that a person can check them in a browser.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const sources = JSON.parse(await fs.readFile(path.join(root, 'content/sources.json'), 'utf8'));
const verbose = process.argv.includes('--all');
const UA = 'Mozilla/5.0 (compatible; hello-world-history link check)';

async function check(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const response = await fetch(url, { method, redirect: 'follow', headers: { 'user-agent': UA, accept: '*/*' }, signal: AbortSignal.timeout(25000) });
      if (response.ok) return { status: response.status };
      if (method === 'GET') return { status: response.status };
    } catch (error) {
      if (method === 'GET') return { status: 0, error: error.cause?.code || error.name };
    }
  }
  return { status: 0 };
}

const results = [];
const queue = [...sources];
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const source = queue.shift();
    results.push({ ...source, ...(await check(source.url)) });
  }
}));

const ok = results.filter((r) => r.status >= 200 && r.status < 400);
const refused = results.filter((r) => [401, 403, 429, 202].includes(r.status));
const broken = results.filter((r) => !ok.includes(r) && !refused.includes(r));
if (verbose) for (const r of ok) console.log(`ok      ${r.status}  ${r.id}`);
for (const r of refused) console.log(`refused ${r.status}  ${r.id}  ${r.url}`);
for (const r of broken) console.log(`BROKEN  ${r.status || r.error}  ${r.id}  ${r.url}`);
console.log(`\n${ok.length} reachable · ${refused.length} refused automated requests · ${broken.length} broken, of ${results.length}`);
process.exit(broken.length ? 1 : 0);
