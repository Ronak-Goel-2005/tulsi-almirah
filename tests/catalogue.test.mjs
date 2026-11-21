import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildEnquiry, matchesFilter } from '../src/lib/catalogue.ts';

const publish = process.env.SITE_DIR
  ? pathToFileURL(resolve(process.env.SITE_DIR) + '/')
  : new URL('../dist/', import.meta.url);
const read = (path) => readFile(fileURLToPath(new URL(path, publish)), 'utf8');
const html = await read('index.html');
const cards = [...html.matchAll(/<article class="product" id="([^"]+)" data-categories="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)];
const almirahs = cards.filter(([, , categories]) => !matchesFilter(categories, 'storage'));
const storage = cards.filter(([, , categories]) => matchesFilter(categories, 'storage'));

async function checkWebp(path) {
  const image = await readFile(new URL(path, publish));
  assert.equal(image.toString('ascii', 0, 4), 'RIFF', path);
  assert.equal(image.toString('ascii', 8, 12), 'WEBP', path);
  return image.length;
}

test('all catalogue filters select the expected number of distinct models', () => {
  assert.equal(new Set(cards.map(([, id]) => id)).size, 20);
  const expected = { all: 12, 'two-door': 5, 'three-door': 4, 'five-door': 1, mirror: 5, dressing: 2 };
  assert.deepEqual([...html.matchAll(/data-filter="([^"]+)"/g)].map(([, filter]) => filter), Object.keys(expected));
  for (const [filter, count] of Object.entries(expected)) {
    assert.equal(almirahs.filter(([, , categories]) => matchesFilter(categories, filter)).length, count, filter);
  }
});

test('every almirah has two published WebP files and a link to its model page', async () => {
  for (const [article, id, , card] of almirahs) {
    const title = card.match(/<h3>([^<]+)<\/h3>/)[1];
    const link = card.match(/<a\b([^>]*\bdata-view-model\b[^>]*)>([^<]+)<\/a>/);
    assert.ok(link, `${id} needs a link that works without JavaScript`);
    assert.ok(link[1].includes(`href="/products/${id}/"`), id);
    assert.ok(article.includes(`data-interior-photo="assets/${id}-inside.webp"`), id);
    assert.ok(link[2].includes(title), id);
    assert.ok(!link[1].includes('aria-label'), id);
    assert.ok(card.includes(`src="assets/${id}.webp"`), id);
    for (const file of [`${id}.webp`, `${id}-inside.webp`]) {
      await checkWebp(`assets/${file}`);
    }
  }
});

test('all almirahs use the printed catalogue dimensions, size entries and model codes', () => {
  const expected = {
    '36-hero': [36, 22, 78, '1150 A', 62],
    '36-king': [36, 22, 84, '1400 A', 72],
    '42-dressing': [42, 22, 78, '1700 B', 90],
    '42-hero': [42, 22, 78, '1300 A', 70],
    '42-hero-mirror': [42, 22, 78, '1550 A', 85],
    '42-king': [42, 22, 84, '1575 A', 80],
    '48-classic': [48, 25, 78, '2150 B', 100],
    '48-classic-five-door': [48, 22, 78, '1650 B', 85],
    '48-hero': [48, 22, 78, '1650 A', 80],
    '48-hero-mirror': [48, 22, 78, '1900 B', 95],
    '48-king': [48, 22, 84, '1875 A', 90],
    '48-king-mirror': [48, 22, 84, '2050 A', 100],
  };
  assert.equal(almirahs.length, Object.keys(expected).length);
  for (const [article, id, , card] of almirahs) {
    const [width, depth, height, code, suffix] = expected[id];
    const displayedSize = card.match(/<p class="product-size">([^<]+)<\/p>/)?.[1].replaceAll('&#39;', "'");
    assert.equal(displayedSize, `${width} × ${depth} × ${height}''`, id);
    assert.equal(article.match(/data-catalogue-code="([^"]+)"/)?.[1], code, id);
    assert.equal(article.match(/data-catalogue-size="([^"]+)"/)?.[1], `${width} × ${depth} × ${height} / ${suffix}`, id);
  }
});

test('the eight additional almirah photos from the catalogue are published', async () => {
  const expected = [
    '42-dressing', '42-hero', '42-hero-mirror', '42-king',
    '48-classic', '48-classic-five-door', '48-hero', '48-hero-mirror',
  ];
  const alternate = almirahs.filter(([article]) => article.includes('data-alternate-photo='));
  assert.deepEqual(alternate.map(([, id]) => id).sort(), expected);
  for (const [article, id] of alternate) {
    const path = article.match(/data-alternate-photo="([^"]+)"/)[1];
    assert.equal(path, `assets/catalogue/${id}-alternate.webp`);
    assert.ok(article.includes('data-alternate-caption='), id);
    await checkWebp(path);
  }
});

test('steel trunks and the six other catalogue products have original photos and functioning links', async () => {
  const expected = {
    'steel-trunk-1150-b': ['1150 B', '34 × 60 × 36 / 60'],
    'steel-trunk-1050-b': ['1050 B', '34 × 52 × 36 / 55'],
    'six-door-locker': [],
    'four-drawer-cabinet': [],
    'two-door-display-cabinet': [],
    'open-shelving-rack': [],
    'glass-door-storage-cabinet': [],
    'four-tier-display-cabinet': [],
  };
  assert.ok(html.includes('href="#other-storage"'));
  assert.equal(storage.length, Object.keys(expected).length);
  for (const [article, id, , card] of storage) {
    const path = `assets/catalogue/${id}.webp`;
    const [code, sizeEntry] = expected[id];
    assert.ok(card.includes(`src="${path}"`), id);
    assert.ok(card.includes(`href="/products/${id}/" data-view-model`), id);
    assert.equal(article.match(/data-catalogue-code="([^"]+)"/)?.[1], code, id);
    assert.equal(article.match(/data-catalogue-size="([^"]+)"/)?.[1], sizeEntry, id);
    await checkWebp(path);
  }
});

test('services, showroom hours and contact links are available without JavaScript', () => {
  const services = html.match(/<section id="services"[^>]*>[\s\S]*?<\/section>/)?.[0];
  const collection = html.indexOf('<section id="collection"');
  const showroom = html.match(/<section id="showroom"[^>]*>[\s\S]*?<\/section>/)?.[0];
  const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0];
  assert.ok(services && collection > html.indexOf(services), 'services come before the collection');
  assert.deepEqual([...services.matchAll(/<h3>([^<]+)<\/h3>/g)].map(([, heading]) => heading), [
    'Powder-coated steel almirahs', 'Custom orders', 'Wall fitting',
  ]);
  for (const section of [showroom, footer]) {
    assert.ok(section?.includes('<time datetime="10:00">10 am</time>–<time datetime="18:00">6 pm</time>'));
    assert.ok(section.includes('href="tel:+917017226298"'));
    assert.ok(section.includes('G9FH+55, Hind, Shamli'));
  }
  assert.ok(footer.includes('href="https://wa.me/917017226298"'));
  assert.ok(footer.includes('href="#services"'));
});

test('removed catalogue copy, cover figure and About link stay off the storefront', () => {
  assert.doesNotMatch(html, /Compare 12 almirahs by layout and size/);
  assert.doesNotMatch(html, /Almirah from the September 2025 catalogue cover/);
  assert.doesNotMatch(html, /<section id="about"|href="#about"/);
  assert.match(html, /<a class="collection-jump" href="#other-storage">/);
});

test('every product has notes tied to the correct source catalogue page', () => {
  const expected = [
    ['42-hero', '42-king', '42-hero-mirror', '42-dressing'],
    ['48-hero', '48-hero-mirror', '48-king', '48-king-mirror'],
    ['48-classic-five-door', '48-classic', '36-hero', '36-king'],
  ].flat().map((id, index) => [id, index + 2]);
  expected.push(['steel-trunk-1150-b', 14], ['steel-trunk-1050-b', 14]);
  for (const [, id] of storage.filter(([, , categories]) => !matchesFilter(categories, 'trunk'))) {
    expected.push([id, 15]);
  }
  const pages = new Map(expected);
  const uniqueNotes = new Set();
  for (const [, id, , card] of cards) {
    const note = card.match(/<template data-catalogue-page="(\d+)">([^<]+)<\/template>/);
    assert.ok(note, `${id} has catalogue notes`);
    assert.equal(Number(note[1]), pages.get(id), id);
    assert.ok(note[2].trim().length > 30, id);
    uniqueNotes.add(note[2]);
  }
  assert.equal(uniqueNotes.size, 20);
});

test('the intro keeps its skip control and shows the manufacturing credentials', () => {
  const intro = html.match(/<button class="site-intro"[^>]*type="button"[^>]*aria-label="Skip intro"[^>]*hidden>([\s\S]*?)<\/button>/)?.[1];
  assert.ok(intro, 'intro skip button');
  assert.match(intro, /<img class="site-intro-logo" src="assets\/tulsi-logo.webp"/);
  assert.match(intro, /A VNA Industries Product[\s\S]*<span>Made in India<\/span>/);
  assert.match(intro, /<span>ISO certified company<\/span>/);
});

test('enquiry includes the full model name and the generic fallback', () => {
  assert.match(buildEnquiry('the Tulsi 48 Classic 5 Door almirah'), /Tulsi 48 Classic 5 Door/);
  assert.match(buildEnquiry(), /your steel almirahs/);
});

test('the storefront publishes the hero artwork and progressively enhances card previews', async () => {
  const hero = html.match(/<img\b[^>]*\bclass="hero-photo"[^>]*>/)?.[0] ?? '';
  assert.match(hero, /fetchpriority="high"/);
  const sources = hero.match(/srcset="([^"]+)"/)?.[1].split(/,\s*/) ?? [];
  assert.ok(sources.length >= 3, 'the browser can choose a hero image suited to its viewport');
  const imageSizes = [];
  for (const source of sources) {
    const [path, width] = source.split(' ');
    const relativePath = path.replace(/^\//, '');
    imageSizes.push([parseInt(width, 10), await checkWebp(relativePath)]);
  }
  imageSizes.sort(([left], [right]) => left - right);
  assert.ok(imageSizes[0][0] < 600 && imageSizes.at(-1)[0] === 1536);
  assert.ok(imageSizes[0][1] < imageSizes.at(-1)[1] / 2, 'the smallest hero candidate costs substantially less to download');
  const font = await readFile(new URL('assets/instrument-serif.woff2', publish));
  assert.equal(font.toString('ascii', 0, 4), 'wOF2');
  for (const [, id, , card] of almirahs) {
    assert.match(card, /<button[^>]*data-preview-photo[^>]*\bhidden\b/, id);
  }
});

test('the published files include storefront assets and consistent crawl URLs', async () => {
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)[1];
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    assert.equal(canonical, `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/`);
  }
  assert.ok(html.includes(`<meta property="og:url" content="${canonical}">`));
  const store = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1])['@graph'][1];
  assert.equal(store.url, canonical);
  assert.equal(store.logo, `${canonical}assets/tulsi-logo.webp`);
  assert.ok((await read('robots.txt')).includes(`Sitemap: ${canonical}sitemap.xml`));
  assert.ok((await read('sitemap.xml')).includes(`<loc>${canonical}</loc>`));
  const stylesheet = html.match(/<link rel="stylesheet" href="\/(_astro\/[^"]+\.css)"/)?.[1];
  const storefront = html.match(/<script type="module" src="\/(_astro\/[^"]+\.js)"/)?.[1];
  assert.ok(stylesheet, 'a built stylesheet is linked');
  assert.ok(storefront, 'a built storefront script is linked');
  assert.ok((await read(stylesheet)).includes('.site-intro'));
  assert.ok((await read(storefront)).includes('introend'));
  for (const file of ['tulsi-logo.webp', 'tulsi-cover.webp', 'potted-tulsi.svg']) {
    assert.ok((await readFile(new URL(`assets/${file}`, publish))).length > 0);
  }
});

test('every model has a canonical page with unique metadata and a sitemap entry', async () => {
  const home = html.match(/<link rel="canonical" href="([^"]+)">/)[1];
  const sitemap = await read('sitemap.xml');
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
  const expected = [home, ...cards.map(([, id]) => `${home}products/${id}/`)];
  assert.deepEqual(locations.slice().sort(), expected.sort());

  const titles = new Set();
  const descriptions = new Set();
  for (const [, id, , card] of cards) {
    const canonical = `${home}products/${id}/`;
    const page = await read(`products/${id}/index.html`);
    const name = card.match(/<h[34]>([^<]+)<\/h[34]>/)[1];
    assert.ok(page.includes(`<link rel="canonical" href="${canonical}">`), id);
    assert.ok(page.includes(`<meta property="og:url" content="${canonical}">`), id);
    assert.ok(page.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1].includes(name), id);
    assert.match(page, /<nav[^>]+aria-label="Breadcrumb"/);
    const data = JSON.parse(page.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);
    const breadcrumb = data['@graph'].find((entry) => entry['@type'] === 'BreadcrumbList');
    assert.equal(breadcrumb.itemListElement.at(-1).item, canonical);
    titles.add(page.match(/<title>([^<]+)<\/title>/)?.[1]);
    descriptions.add(page.match(/<meta name="description" content="([^"]+)">/)?.[1]);
  }
  assert.ok(!titles.has(undefined) && titles.size === cards.length);
  assert.ok(!descriptions.has(undefined) && descriptions.size === cards.length);
});
