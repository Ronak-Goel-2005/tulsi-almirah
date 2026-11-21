import type { APIRoute } from 'astro';
import { collections, collectionPath } from '../data/collections';
import { products } from '../data/products';
import { guides, guidePath, type GuideLanguage } from '../data/steel-almirah-guide';
import { productPath } from '../lib/catalogue';

export const GET: APIRoute = ({ site }) => {
  const xmlUrl = (path: string) => new URL(path, site).href.replaceAll('&', '&amp;');
  const pages = [
    '/',
    ...collections.map(({ id }) => collectionPath(id)),
    ...(Object.keys(guides) as GuideLanguage[]).map(guidePath),
  ];
  const pageEntries = pages.map((path) => `  <url><loc>${xmlUrl(path)}</loc></url>`);
  const productEntries = products.map(({ id, photo, interiorPhoto, alternatePhoto }) => {
    const imageEntries = [photo.src, interiorPhoto, alternatePhoto?.src]
      .filter((src) => src !== undefined)
      .map((src) => `    <image:image><image:loc>${xmlUrl(`/${src}`)}</image:loc></image:image>`)
      .join('\n');

    return `  <url>
    <loc>${xmlUrl(productPath(id))}</loc>
${imageEntries}
  </url>`;
  });

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[...pageEntries, ...productEntries].join('\n')}
</urlset>
`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
