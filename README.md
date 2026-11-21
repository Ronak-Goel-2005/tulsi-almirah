# Tulsi Almirah

A responsive storefront for Tulsi Almirah in Hind, Uttar Pradesh.

[Visit the live storefront](https://tulsi-almirah.vercel.app/)

## Features

- The opening animation shows the Tulsi logo, swaying tulsi plant, and manufacturing credentials. Click or tap anywhere, press Enter with the intro focused, or press Escape to skip it. Reduced motion skips the opening sequence.
- Browse all 20 products from the September 2025 catalogue, including 12 almirahs, two steel trunks and six other storage designs. Product details include source-page notes and front, interior and alternate photos where shown. Each model has a shareable product page and can be opened from the catalogue without JavaScript.
- Open a model-specific WhatsApp enquiry, call the shop, or get directions to the showroom.

## Run locally

Use the Node.js version in [.node-version](.node-version) and run these commands from the repository root.

```sh
npm ci
npm run dev
```

Open [http://localhost:4321](http://localhost:4321). Astro generates static HTML. Tailwind CSS handles shared layouts, and the storefront stylesheet defines the custom animations and visual details. TypeScript handles browser interactions.

Edit products in [src/data/products.ts](src/data/products.ts) and place their photos in [public/assets](public/assets). The shared product-card template uses this data to render the catalogue.

Run `npm run check` to type-check the project and `npm test` to build and check the published catalogue. Run `npm run preview` to open the production build locally.

## Hosting

The site builds to `dist/`. Astro copies the photos from `public/` and generates `robots.txt` and `sitemap.xml` from the configured site URL. Vercel builds use the project's production domain for those files and the page metadata. GitHub Actions checks the generated site.

## Catalogue imagery

Product photos, dimensions, model codes and manufacturing details come from the September 2025 Tulsi Almirah catalogue. The homepage setting is an ImageGen illustration.
