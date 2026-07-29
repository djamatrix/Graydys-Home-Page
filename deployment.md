# Deploy Graydys homepage (GitHub Pages + Cloudflare + custom domain)

This site is static (`index.html` at the repo root). No build step is required.

**What you’ll end up with**

- Site files hosted on **GitHub Pages**
- DNS and HTTPS handled by **Cloudflare**
- Visitors reach the site on **your own domain** (e.g. `graydys.com`)

---

## Prerequisites

1. A GitHub account
2. A Cloudflare account ([dash.cloudflare.com](https://dash.cloudflare.com))
3. A registered domain name (any registrar is fine)
4. This project committed and pushed to a GitHub repository

---

## Part 1 — Push the site to GitHub

If the repo is not on GitHub yet:

```bash
cd /path/to/graydys-home-page
git init
git add .
git commit -m "Initial Graydys homepage"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repository name.

---

## Part 2 — Enable GitHub Pages

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Set **Branch** to `main` and **Folder** to `/ (root)`.
5. Click **Save**.

GitHub will publish the site at:

`https://YOUR_USERNAME.github.io/YOUR_REPO/`

(If the repo is named `YOUR_USERNAME.github.io`, it publishes at `https://YOUR_USERNAME.github.io/`.)

Wait 1–2 minutes, then open that URL to confirm the homepage loads.

---

## Part 3 — Add your domain to Cloudflare

### 3a. Add the site in Cloudflare

1. Log in to Cloudflare.
2. Click **Add a site** and enter your domain (e.g. `graydys.com`).
3. Choose a plan (the **Free** plan is enough for this).
4. Cloudflare will scan existing DNS records — continue through the wizard.

### 3b. Point your domain’s nameservers to Cloudflare

1. Cloudflare shows two nameservers (example format):
   - `ada.ns.cloudflare.com`
   - `bob.ns.cloudflare.com`
2. At your domain registrar, find **Nameservers** / **DNS** and replace the current nameservers with Cloudflare’s.
3. Save. Propagation can take from a few minutes up to 24–48 hours.
4. In Cloudflare, wait until the domain status shows **Active**.

---

## Part 4 — Connect the custom domain to GitHub Pages

### 4a. Create a `CNAME` file in this repo

In the **root** of the project (same folder as `index.html`), create a file named `CNAME` with **only** your domain (no `https://`):

```text
graydys.com
```

Or use `www.graydys.com` if you prefer `www` as the canonical host.

Commit and push:

```bash
git add CNAME
git commit -m "Add custom domain for GitHub Pages"
git push origin main
```

### 4b. Tell GitHub about the domain

1. Repo → **Settings → Pages**.
2. Under **Custom domain**, enter the same domain as in the `CNAME` file.
3. Click **Save**.
4. GitHub will check DNS. It may show a warning until DNS (next step) is correct.
5. Optionally enable **Enforce HTTPS** once the certificate is ready (can take a short while after DNS works).

---

## Part 5 — DNS records in Cloudflare

In Cloudflare → your domain → **DNS → Records**, add records that point to GitHub Pages.

### Option A — Apex domain (`graydys.com`)

GitHub Pages supports apex domains with `A` records. Add these **four** `A` records (name `@` = root domain):

| Type | Name | Content           | Proxy status                          |
|------|------|-------------------|---------------------------------------|
| A    | `@`  | `185.199.108.153` | DNS only (grey cloud) initially       |
| A    | `@`  | `185.199.109.153` | DNS only (grey cloud) initially       |
| A    | `@`  | `185.199.110.153` | DNS only (grey cloud) initially       |
| A    | `@`  | `185.199.111.153` | DNS only (grey cloud) initially       |

Also add a `www` CNAME if you want both:

| Type  | Name  | Content                         | Proxy status                    |
|-------|-------|---------------------------------|---------------------------------|
| CNAME | `www` | `YOUR_USERNAME.github.io`       | DNS only (grey cloud) initially |

### Option B — `www` only (`www.graydys.com`)

| Type  | Name  | Content                   | Proxy status                    |
|-------|-------|---------------------------|---------------------------------|
| CNAME | `www` | `YOUR_USERNAME.github.io` | DNS only (grey cloud) initially |

Then set GitHub Pages custom domain to `www.graydys.com` and put that same value in the repo `CNAME` file.

> **Important:** Use **DNS only** (grey cloud) first so GitHub can verify the domain and issue HTTPS. After the site works on `https://yourdomain.com`, you can turn the Cloudflare proxy **on** (orange cloud) if you want CDN/WAF features.

Confirm current GitHub Pages IPs in GitHub’s docs if needed:  
[Configuring an apex domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

---

## Part 6 — Cloudflare SSL settings

1. Cloudflare → **SSL/TLS → Overview**.
2. Set encryption mode to **Full** (or **Full (strict)** after GitHub HTTPS is active).
3. Avoid **Flexible** — it can cause redirect loops with GitHub Pages.

Optional but useful:

- **SSL/TLS → Edge Certificates**: turn on **Always Use HTTPS**
- **Rules → Redirect Rules** (or Page Rules on older accounts): redirect `www` → apex (or the reverse) so only one hostname is canonical

---

## Part 7 — Verify

1. Open `https://YOUR_DOMAIN` — the Graydys homepage should load.
2. Confirm brands tabs still switch and the page looks correct on mobile.
3. In GitHub → **Settings → Pages**, confirm the custom domain shows a valid DNS check and HTTPS is enabled.

---

## Updating the site later

After any content or code change:

```bash
git add .
git commit -m "Update homepage"
git push origin main
```

GitHub Pages redeploys automatically from `main`. Allow a minute or two for the live site to refresh (Cloudflare cache may add a short delay if the proxy is orange).

To purge Cloudflare cache: **Caching → Configuration → Purge Everything** (use sparingly).

---

## Troubleshooting

| Problem | What to try |
|---------|-------------|
| GitHub says “Domain does not resolve” | Wait for nameserver/DNS propagation; confirm `A`/`CNAME` records match Part 5; keep proxy **DNS only** until verified |
| HTTPS not available on Pages | Wait for GitHub’s certificate; ensure custom domain is saved and DNS is correct |
| Redirect loop | Set Cloudflare SSL to **Full**; disable conflicting Page Rules |
| Old design still showing | Hard-refresh the browser; purge Cloudflare cache if proxied |
| 404 on custom domain | Confirm Pages source is `main` / `(root)` and `index.html` is at the repo root |
| Wrong site / repo | Apex `CNAME` file and Pages custom domain must match exactly |

---

## Quick checklist

- [ ] Repo pushed to GitHub on `main`
- [ ] Pages enabled: branch `main`, folder `/ (root)`
- [ ] Domain added to Cloudflare; nameservers updated at registrar
- [ ] `CNAME` file in repo root with your domain
- [ ] Custom domain saved in GitHub Pages settings
- [ ] Cloudflare DNS `A` / `CNAME` records pointing to GitHub Pages
- [ ] Proxy grey (DNS only) until HTTPS works, then optional orange cloud
- [ ] Cloudflare SSL set to **Full**
- [ ] Site loads on `https://your-domain`
