# Ark Secure Terminal

A dependency-free terminal-style networking and portfolio site for Ark Secure.

## Commands

`help`, `whois`, `interests`, `socials`, `projects`, `email`, `history`, `banner`, `clear`, `about`, `theme`, plus a few Unix-style Easter eggs.

## Customize

Edit `assets/js/config.js` to change:

- Email and social links
- Interests
- Project entries
- Owner information

Edit `about.html` for the full biography and `projects.html` for longer project descriptions.

## Deploy

The project can be deployed directly to Netlify or GitHub Pages. For the existing repository, replace the current site files with this project, commit, and push to `main`.

```bash
git clone https://github.com/JCilenti/arksecure.git
cd arksecure
# Copy these files into the repository, then:
git add .
git commit -m "Pivot Ark Secure to terminal networking hub"
git push origin main
```

## Important

Add your LinkedIn URL in `assets/js/config.js`. Update the canonical domain in `robots.txt` and `sitemap.xml` if your production URL differs from `arksecure.net`.
