import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const publish = process.env.SITE_DIR
  ? pathToFileURL(resolve(process.env.SITE_DIR) + '/')
  : new URL('../', import.meta.url);
const read = (path) => readFile(fileURLToPath(new URL(path, publish)), 'utf8');
const html = await read('index.html');
const { buildEnquiry, matchesFilter } = await import(new URL('catalogue.mjs', publish));
const cards = [...html.matchAll(/<article class="product" id="([^"]+)" data-categories="([^"]+)">([\s\S]*?)<\/article>/g)];

test('all catalogue filters select the expected number of distinct models', () => {
  assert.equal(new Set(cards.map(([, id]) => id)).size, 12);
  const expected = { all: 12, 'two-door': 5, 'three-door': 4, 'five-door': 1, mirror: 5, dressing: 2 };
  assert.deepEqual([...html.matchAll(/data-filter="([^"]+)"/g)].map(([, filter]) => filter), Object.keys(expected));
  for (const [filter, count] of Object.entries(expected)) {
    assert.equal(cards.filter(([, , categories]) => matchesFilter(categories, filter)).length, count, filter);
  }
});

test('every model has two published WebP files and a usable fallback link', async () => {
  for (const [, id, , card] of cards) {
    const title = card.match(/<h3>([^<]+)<\/h3>/)[1];
    const link = card.match(/<a\b([^>]*\bdata-view-model\b[^>]*)>([^<]+)<\/a>/);
    assert.ok(link, `${id} needs a link that works without JavaScript`);
    assert.ok(link[1].includes(`href="assets/${id}-inside.webp"`), id);
    assert.ok(link[2].includes(title), id);
    assert.ok(!link[1].includes('aria-label'), id);
    assert.ok(card.includes(`src="assets/${id}.webp"`), id);
    for (const file of [`${id}.webp`, `${id}-inside.webp`]) {
      const image = await readFile(new URL(`assets/${file}`, publish));
      assert.equal(image.toString('ascii', 0, 4), 'RIFF', file);
      assert.equal(image.toString('ascii', 8, 12), 'WEBP', file);
    }
  }
});

test('enquiry includes the full model name and the generic fallback', () => {
  assert.match(buildEnquiry('the Tulsi 48 Classic 5 Door almirah'), /Tulsi 48 Classic 5 Door/);
  assert.match(buildEnquiry(), /your steel almirahs/);
});

test('the storefront publishes the hero artwork and progressively enhances card previews', async () => {
  assert.ok(/<img class="hero-photo" src="assets\/hero-showroom\.webp"[^>]*fetchpriority="high">/.test(html), 'hero artwork is loaded with high priority');
  const hero = await readFile(new URL('assets/hero-showroom.webp', publish));
  assert.equal(hero.toString('ascii', 8, 12), 'WEBP');
  const font = await readFile(new URL('assets/instrument-serif.woff2', publish));
  assert.equal(font.toString('ascii', 0, 4), 'wOF2');
  for (const [, id, , card] of cards) {
    assert.match(card, /<button[^>]*data-preview-photo[^>]*\bhidden\b/, id);
  }
});

test('the published files include storefront assets and consistent crawl URLs', async () => {
  const crawl = process.env.SITE_DIR ? '' : 'dist/';
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)[1];
  assert.ok((await read(`${crawl}robots.txt`)).includes(`Sitemap: ${canonical}sitemap.xml`));
  assert.ok((await read(`${crawl}sitemap.xml`)).includes(`<loc>${canonical}</loc>`));
  assert.ok((await read('styles.css')).length > 0);
  for (const file of ['tulsi-logo.webp', 'tulsi-cover.webp']) {
    assert.ok((await readFile(new URL(`assets/${file}`, publish))).length > 0);
  }
});
