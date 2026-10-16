# GLOINEX: Corporate Landing Page

One-page B2B website for **GLOINEX**, an India sourcing & export partner connecting Indian manufacturers with global buyers.

It's a static site (plain HTML/CSS/JS) with no build step, database, or server, so it's free to host and simple to edit.

## Features
- Interactive 3D dotted globe (drag to spin) with animated trade routes radiating from India
- GSAP scroll animations, word-by-word heading reveals, smooth scrolling (Lenis)
- Animated SVG illustrations for each service and industry
- Scroll-driven "route" timeline with a sailing cargo ship (How We Work)
- 3D tilt cards, magnetic buttons, custom cursor, floating WhatsApp button
- Indigo / saffron palette, fully responsive, respects `prefers-reduced-motion`
- SEO: title, meta description, Open Graph, JSON-LD organization schema, favicon

## Structure
```
index.html              All page content (sections 1–6)
assets/css/style.css    Styles & colours (palette variables at the top under :root)
assets/js/main.js       Animations, globe, interactions
assets/img/             Logo (gloinex-logo.jpg), header logo (gloinex-logo-horizontal.png), favicon.svg
vercel.json             Hosting config
```

## How to update content
All text lives in `index.html`; each section is marked with a comment like `<!-- ============ 3. SERVICES ============ -->`.

- **Change text:** edit the words directly in `index.html`.
- **Add/remove a product category:** in the *Products & Industries* section, copy or delete one `<li class="tile">…</li>` block. The grid adjusts automatically.
- **Contact details:** search `index.html` for `917083033528` (WhatsApp, 3 places), `batiaev@gloinex.com` (email), and `t.me/globalindianexport` (Telegram).
- **Colours:** edit the variables at the top of `assets/css/style.css` (`--saffron`, `--bg`, etc.).
- **Header logo:** the top nav shows `assets/img/gloinex-logo-horizontal.png`, the GX mark with the GLOINEX wordmark beside it on the right, cropped from the main logo (no underline or tagline) on a transparent background. It displays 30px tall (26px on phones), close to the original 34px icon and 15px text. If you replace it, use a new filename: `/assets` files are cached by browsers for 7 days (see `vercel.json`), so reusing a name can leave visitors seeing the old image. Size is set by `.brand-logo` in `style.css`; after editing CSS or JS, bump the `?v=` number on their links in `index.html` for the same reason.
- **Logo:** replace `assets/img/gloinex-logo.jpg` (keep the same filename).

Committing to `main` on GitHub redeploys the site on Vercel automatically.

## Run locally
```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deployment
- Hosted on **Vercel**, connected to this GitHub repo (auto-deploy on push, HTTPS included).
- **Custom domain (later):** Vercel → Project → Settings → Domains → add `gloinex.com`, then set the DNS records Vercel shows at your registrar. SSL is issued automatically.
