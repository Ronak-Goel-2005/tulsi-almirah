# Tulsi Almirah

A responsive storefront for Tulsi Almirah in Hind, Uttar Pradesh.

[Visit the live storefront](https://tulsi-almirah.onrender.com/)

## Features

- The opening animation shows the Tulsi logo on each page load. Click or tap anywhere, press Enter with the intro focused, or press Escape to skip it. Reduced motion skips the opening sequence.
- Browse all 20 products from the September 2025 catalogue, including 12 almirahs, two steel trunks and six other storage designs. Product details include source-page notes and front, interior and alternate photos where shown. Copy the URL from an open product to share it. With JavaScript disabled, each product link opens a catalogue photo.
- Open a model-specific WhatsApp enquiry, call the shop, or get directions to the showroom.

## Run locally

With Python installed, run this from the repository root:

```sh
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000). The site uses HTML, CSS and vanilla JavaScript with no build step.

Run `node --test` with Node.js 22 to check the catalogue and crawl files. GitHub Actions runs the same checks against the Render publish directory.

## Hosting

The [Render configuration](render.yaml) serves the HTML, CSS, JavaScript and product images from `dist/`. The checked-in `dist/robots.txt` and `dist/sitemap.xml` are served at the public site root.

## Catalogue imagery

Product photos, dimensions, model codes and manufacturing details come from the September 2025 Tulsi Almirah catalogue. The homepage setting is an ImageGen illustration.
