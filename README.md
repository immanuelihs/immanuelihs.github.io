# immanuelihs.github.io

Personal portfolio site for Santhiya Rajan — applied AI research scientist. Static HTML/CSS/JS,
no build tooling, no framework, no npm dependencies. Hosted on GitHub Pages.

## Preview locally

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173/`.

## Structure

```
index.html          all content, semantic HTML, renders fully with JS disabled
404.html             not-found page
css/tokens.css       design tokens (color / type / space / motion variables)
css/style.css        reset, layout, components, responsive, print
js/main.js           vanilla JS progressive enhancement (<4KB)
assets/img/          favicon only — no photos, no screenshots
```

## Editing content

All copy lives inline in `index.html`, organized by numbered `<section>` blocks (`§00` hero
through `§09` contact). To update a section, find its `id` (e.g. `#experience`, `#patents`,
`#publications`) and edit the markup directly — there is no separate data file or templating
layer.

Design tokens (colors, fonts, spacing, motion timing) live in `css/tokens.css`; component and
layout rules live in `css/style.css`.

## Adding a custom domain later

1. Add a `CNAME` file at the repo root containing the domain, e.g. `example.com`.
2. Update the DNS records for the domain (A/ALIAS records to GitHub Pages IPs, or a CNAME record
   to `immanuelihs.github.io` for a subdomain) per GitHub's Pages documentation.
3. In the repo's Settings → Pages, set the custom domain and enable "Enforce HTTPS" once the
   certificate provisions.
4. Update the `canonical`, Open Graph `url`, and `sitemap.xml`/`robots.txt` URLs in this repo to
   the new domain.

## License

MIT — see `LICENSE`.
