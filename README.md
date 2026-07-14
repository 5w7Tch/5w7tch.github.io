# Mona Lisa — download page

Static landing page for [Mona Lisa](https://github.com/5w7Tch/Mona-Lisa), the
macOS face-recognition security agent. Plain HTML/CSS/JS — no build step, no
dependencies (only Google Fonts at runtime).

## Structure

- `index.html` — the whole page (hero, how-it-works, features, install, versions)
- `styles.css` — dark slate + gold theme, responsive, `prefers-reduced-motion` aware
- `script.js` — copy-to-clipboard buttons and footer year

## Preview locally

Just open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy

Any static host works (GitHub Pages, Netlify, Cloudflare Pages). For GitHub
Pages: push this folder to a repo and enable Pages on the `main` branch root.

## Updating for a new release

The main download buttons point at
`releases/latest/download/MonaLisa.dmg`, so they always serve the newest
release automatically. For each new version, add an entry to the **Versions**
timeline in `index.html` (move the `Latest` badge, link the versioned `.dmg`).
