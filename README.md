# Tulsi Almirah

A responsive storefront for Tulsi Almirah in Hind, Uttar Pradesh.

[Visit the live storefront](https://tulsi-almirah.onrender.com/)

## Features

- Animated almirah doors frame the opening logo once per browser tab session. Click or tap anywhere to enter early, or use the keyboard. The intro is skipped on model links and when reduced motion is enabled.
- Filter the catalogue of twelve steel almirahs and compare front and interior photos for each model. Copy the URL from an open model to share it. With JavaScript disabled, each model link opens its interior photo.
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

Product photos and the logo come from the Tulsi Almirah catalogue. The homepage setting is an ImageGen illustration.
