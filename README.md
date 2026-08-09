# Ark Secure Terminal

A dependency-free terminal-style networking and portfolio site for Ark Secure.

## Commands

`help`, `whois`, `interests`, `socials`, `projects`, `blog`, `read`, `email`, `history`, `banner`, `clear`, `about`, `theme`, plus a few Unix-style Easter eggs.

### Blog commands

- `blog` — list all articles
- `blog cybersecurity` — filter articles by topic, title, summary, or category
- `read software-security` — open an article by slug

## Customize

Edit `assets/js/config.js` to change:

- Email and social links
- Interests
- Project entries
- Owner information
- Blog post metadata

Edit `about.html` for the full biography and `projects.html` for longer project descriptions.

## Adding a blog post

1. Create a new HTML article under `blog/` using `blog/software-security.html` as the template.
2. Add its metadata to the `blogPosts` array in `assets/js/config.js`.
3. Add the new URL to `sitemap.xml`.
4. Commit and deploy normally.

The blog index reads directly from `config.js`, so you do not need to manually edit `blog.html` for each new article.

## Deploy

The project can be deployed directly to Netlify or GitHub Pages. For the existing repository, replace the current site files with this project, commit, and push to `main`.

```bash
git add .
git commit -m "Add Ark Secure blog"
git push origin main
```

## Important

Update the canonical domain in `robots.txt` and `sitemap.xml` if your production URL differs from `arksecure.net`.