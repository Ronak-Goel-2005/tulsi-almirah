# Tulsi Almirah

A responsive storefront for Tulsi Almirah in Hind, Uttar Pradesh.

[Visit the live storefront](https://tulsi-almirah.onrender.com/)

## Features

- Animated almirah doors frame the opening logo. Click or tap anywhere to enter early, or use the keyboard. The intro is skipped when reduced motion is enabled.
- Filter the catalogue of twelve steel almirahs and compare front and interior photos for each model.
- Open a model-specific WhatsApp enquiry, call the shop, or get directions to the showroom.

## Run locally

With Python installed, run this from the repository root:

```sh
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000). The site uses HTML, CSS and vanilla JavaScript with no build step.

## Hosting

The [Render configuration](render.yaml) serves the HTML, CSS, JavaScript and product images from `dist/`. The checked-in `dist/robots.txt` and `dist/sitemap.xml` are served at the public site root.

## Catalogue imagery

Product photos and brand artwork come from the Tulsi Almirah catalogue.
