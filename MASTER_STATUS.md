# MPDGI Digital Ecosystem — MASTER STATUS

Updated: 2026-10-04

## Permanent workflow

**do -> validate -> checkpoint -> continue**

Do not restart after timeout. Resume from the last validated checkpoint. Keep long reports in files, not in chat.

## MPDGI Hub

- Repo: `kl4ne/mpdgi-hub`
- Branch: `main`
- Current repository HEAD: `b123f59278bd1791c9ab02d6c92a3ead47a0f0bc`
- Runtime version: `1.6.0`
- Production: `https://hub.mpdgi.org`

Completed:
- reproducible npm lockfile + npm ci
- pinned GitHub Actions
- production smoke and header observation
- dead external payment SVG cleanup
- historical runtime cleanup for v1.4.7 through v1.5.2
- continuity/security/infrastructure documentation

Verified infrastructure evidence:
- public response comes directly from GitHub Pages
- HSTS present
- `X-Content-Type-Options: nosniff` not observed
- response-header clickjacking protection not observed

Remaining Hub blocker:
- missing response headers require hosting/proxy/edge configuration; do not add a fake Cloudflare Pages `_headers` file to GitHub Pages

## MPDGI Stats

- Repo: `kl4ne/mpdgi-hub`
- Branch: `mpdgi-stats-v1.0`
- Current repository HEAD: `2d018cd07e0ace2d8bc9ed895d6828c88776c490`
- Runtime version: `1.4.7`
- Verified production: `https://mpdgi-stats.pages.dev`

Completed:
- `public/` is the deployed and tested source of truth
- collector integrity hardening
- HSTS / nosniff / X-Frame-Options / noindex verified in production
- campaign same-origin protection + RBAC
- bootstrap disabled by default
- inherited Hub baggage removed
- read-first schema checks + explicit migration 0003
- dual-scheme auth: legacy HMAC-SHA256 + target PBKDF2-HMAC-SHA256
- new password records use PBKDF2
- successful legacy login may transparently upgrade that user
- failed login does not mutate password fields
- PBKDF2 iteration count: 600,000
- CI WebCrypto benchmark: min 90.93 ms, p50 92.43 ms, p95 94.05 ms, max 94.05 ms
- rollback checkpoint: `checkpoint/stats-v1.4.7-dual-scheme`
- `AUTH_PEPPER` unchanged
- no D1 reset/deletion performed

Custom-domain status:
- `stats.mpdgi.org` has no public DNS resolution from GitHub Actions diagnostics
- keep `mpdgi-stats.pages.dev` as verified endpoint until Cloudflare/DNS is fixed

## MPDGI Digital Cards

- Repo: `kl4ne/mpdgi-digital-cards`
- Branch: `main`
- Current repository HEAD: `23e6e638e442e61721f7ade6791d4ae10a8cd9dc`
- RSCard: `1.3.2`
- NPCard fallback: `1.0.3`

Completed:
- PR-gated card imports
- no direct ZIP-to-main replacement
- read-only build metadata verification
- secret scanning
- Chromium + WebKit QA
- context-safe generator
- fallback-host support
- production card smoke tests
- 60-second update polling
- NPCard custom-domain diagnostics merged

Verified production:
- `https://rscard.mpdgi.org`
- `https://npcard.pages.dev`

Custom-domain status:
- `npcard.mpdgi.org` has no public DNS resolution from GitHub Actions diagnostics
- do not program Nancy NFC to the custom domain until Cloudflare/DNS + real-device verification are complete

## Remaining blockers

1. Fix `stats.mpdgi.org` in Cloudflare/DNS.
2. Fix `npcard.mpdgi.org` in Cloudflare/DNS.
3. Add Hub nosniff + clickjacking response headers at a real hosting/proxy/edge layer.
4. Do not force an owner login only to trigger password migration; allow normal successful login to migrate naturally.

## Non-negotiable safety rules

- Do not reset/delete D1.
- Do not rotate `AUTH_PEPPER` casually.
- Do not reintroduce workers.dev failover unless explicitly requested.
- Do not change Nancy's approved card art.
- Do not invent social/contact data.
- Do not use the GMacfie watermark in this project.
