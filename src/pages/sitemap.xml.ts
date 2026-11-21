import type { APIRoute } from 'astro';
import { products } from '../data/products';
import { productPath } from '../lib/catalogue';

export const GET: APIRoute = ({ site }) => new Response(
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['/', ...products.map(({ id }) => productPath(id))]
  .map((path) => `  <url><loc>${new URL(path, site)}</loc></url>`)
  .join('\n')}
</urlset>
`,
  { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
);
