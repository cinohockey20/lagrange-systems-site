# Lagrange Systems — website

Static marketing site. Plain HTML, CSS and JavaScript — no build step, no dependencies.

```
index.html        page structure and copy
styles.css        design tokens (colors, fonts) at the top, then all styles
main.js           animations, orbit canvas, contact form
assets/           favicon and any images
```

## Edit

- **Copy:** everything is in `index.html`.
- **Colors / fonts:** change the variables in `:root` at the top of `styles.css` (`--accent` is the blue).
- **Contact form:** set `FORM_ENDPOINT` in `main.js` to a form service URL (Formspree, Basin, Getform…).
  Until then the form validates and shows a success message but doesn't send anything.
- **Email / social links:** search `index.html` for `hello@lagrangesystems.com` and the `LinkedIn` / `GitHub` footer links.

## Publish with GitHub Pages

1. Create a repository on GitHub (e.g. `lagrange-systems-site`) and push these files to the `main` branch.
2. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The site goes live at `https://<username>.github.io/<repo>/` within a minute or two.
   Every push to `main` redeploys automatically.

### Custom domain (e.g. lagrangesystems.com)

1. **Settings → Pages → Custom domain**: enter the domain and save (GitHub adds a `CNAME` file).
2. At your domain registrar, add DNS records:
   - apex domain: four `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www`: a `CNAME` record → `<username>.github.io`
3. Once DNS resolves, tick **Enforce HTTPS**.
