# ARCHITECTURE — MPDGI Digital Ecosystem

Updated: 2026-10-05

## MPDGI Hub

Repository: `kl4ne/mpdgi-hub`  
Production branch: `main`  
Production hostname: `hub.mpdgi.org`

The Hub is a static PWA served through GitHub Pages. The repository root `CNAME` contains `hub.mpdgi.org`. The current service worker owns Hub caching/offline behavior.

Hub analytics are sent anonymously to the Stats collector at the verified Cloudflare Pages endpoint.

## MPDGI Stats

Repository: `kl4ne/mpdgi-hub`  
Production branch: `mpdgi-stats-v1.0`  
Canonical production endpoint: `mpdgi-stats.pages.dev`  
No Stats custom domain is configured or required.

Static assets live only under `public/`. Dynamic endpoints are Cloudflare Pages Functions under `functions/`.

Primary bindings/secrets:
- `STATS_DB`: D1 database binding.
- `AUTH_PEPPER`: server-side authentication secret.
- optional bootstrap controls are disabled by default.

The application stores anonymous analytics, campaigns, admin users and expiring admin sessions in D1.

## Digital Cards

Repository: `kl4ne/mpdgi-digital-cards`

Verified deployments:
- RSCard: `rscard.mpdgi.org`
- NPCard fallback: `npcard.pages.dev`

Intended Nancy custom domain:
- `npcard.mpdgi.org`

Cards are generated from a master template, remain independently deployable, and report only approved anonymous events to Stats.

## Trust boundaries

- Browser input is untrusted.
- Analytics origins are allowlisted.
- Known card origins are bound to expected business-card targets/actions.
- Admin authentication is server-side.
- Password hashes/salts live in D1; AUTH_PEPPER remains outside D1.
- Production infrastructure configuration is not inferred from repository files when administrative evidence is unavailable.
