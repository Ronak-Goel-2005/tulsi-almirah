# Tulsi Almirah

Tulsi Almirah is a steel furniture showroom in Hind, Shamli, Uttar Pradesh. This storefront showcases the VNA Industries catalogue and helps customers compare models before contacting the shop.

[Live storefront](https://tulsi-almirah.vercel.app/) · [Browse the catalogue](https://tulsi-almirah.vercel.app/#collection) · [Sitemap](https://tulsi-almirah.vercel.app/sitemap.xml)

## Catalogue and storefront

- Combine 36″, 42″, or 48″ widths with door count, mirror, and dressing filters across 12 almirah models. The results count updates as you filter, and **Clear filters** resets both selections.
- Use **Collection** to browse dedicated catalogue pages, jump to the homepage storage section, or open the [steel almirah buying guide](https://tulsi-almirah.vercel.app/guides/steel-almirah/en/). The guide is available in English and Hindi.
- Select the navbar logo to scroll back to the top of the homepage or return there from a catalogue, product, or guide page.
- Browse two steel trunks and six other storage designs, including lockers, cabinets, and shelving.
- Open a quick view or a shareable product page with available photos, dimensions, model codes, and notes from the September 2025 catalogue. Product pages work without JavaScript.
- Send a model-specific WhatsApp enquiry, call the shop, or get directions to the showroom.
- Select **Skip intro** or press Escape to continue to the storefront. Direct links to catalogue sections and model quick views, internal returns to the homepage, and reduced-motion visits bypass the intro.

## Stack

Astro generates the static pages and responsive WebP artwork. TypeScript handles filtering and quick views, and Tailwind CSS and custom CSS handle the layout and animations. Nunito Sans and Noto Sans Devanagari are self-hosted.

## Run locally

Use the Node.js version in [.node-version](.node-version) and run these commands from the repository root.

```sh
npm ci
npm run dev
```

Open [the development server](http://localhost:4321/).

| Command | Purpose |
| --- | --- |
| `npm run check` | Type-check the Astro and TypeScript code |
| `npm test` | Build and test the catalogue, product pages, and crawl files |
| `npm run build` | Generate the static site in `dist/` |
| `npm run preview` | Serve the latest production build locally |

## Catalogue updates

Edit models in [src/data/products.ts](src/data/products.ts) and place model photos in [public/assets](public/assets). The same catalogue data drives the storefront cards, individual product pages, and sitemap.

## Deployment

Vercel serves the static build. Astro uses the production domain for canonical links, social previews, `robots.txt`, and `sitemap.xml`. GitHub Actions builds, type-checks, and tests the site on pull requests and pushes to `main`.

## Catalogue imagery

Product photos, dimensions, model codes, and manufacturing details come from the September 2025 Tulsi Almirah catalogue. The homepage setting and intro branch artwork were created with ImageGen.
