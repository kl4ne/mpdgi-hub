# KNOWN ISSUES — MPDGI Digital Ecosystem

Updated: 2026-10-04

## Open / verified

### 1. Stats custom domain not verified
- `https://stats.mpdgi.org` was not reachable at the expected Stats v1.4.6 version from GitHub Actions.
- Verified production fallback remains `https://mpdgi-stats.pages.dev`.
- Latest external proof: GitHub Actions run `37246063157` could not retrieve the expected v1.4.7 content from `stats.mpdgi.org`.
- Required next step: inspect Cloudflare/DNS custom-domain configuration before calling `stats.mpdgi.org` active.

### 2. NPCard custom domain not verified
- `https://npcard.mpdgi.org` was not reachable from GitHub Actions during the latest card production smoke.
- Verified fallback remains `https://npcard.pages.dev` at NPCard v1.0.3.
- Latest external proof: GitHub Actions run `37241538514` could not reach `npcard.mpdgi.org`.
- Required next step: inspect Cloudflare/DNS custom-domain configuration and then real-device behavior.

### 3. Hub response-header hardening remains incomplete at hosting layer
- Hub production exposes HSTS.
- The latest header audit did not observe response-header `X-Content-Type-Options: nosniff`.
- The latest header audit did not observe response-header clickjacking protection via `X-Frame-Options` or CSP `frame-ancestors`.
- Because the Hub is on GitHub Pages/custom-domain infrastructure, adding Cloudflare Pages-style `_headers` to the repository would not solve this by itself.
- Required next step: review the actual hosting/proxy layer before changing code.

### 4. Password migration is deployed but production-user migration status is intentionally unknown
- Stats v1.4.7 supports both legacy `hmac-sha256-v1` and target `pbkdf2-sha256-v1`.
- New bootstrap users use PBKDF2.
- Successful legacy login can transparently upgrade only that authenticated user.
- No production owner login was intentionally performed during remediation, so the current owner's stored scheme is not assumed.
- `AUTH_PEPPER` remains unchanged.
- Rollback checkpoint: `checkpoint/stats-v1.4.7-dual-scheme`.
- Benchmark complete in CI/WebCrypto proxy at 600,000 iterations: p50 92.43 ms, p95 94.05 ms. This is not Cloudflare production timing.
- Required next step: keep 600,000 unchanged for now and allow migration to occur naturally on a normal successful login; do not force a production login solely for migration.

### 5. Historical Hub pinned runtime files remain
- Older version-pinned JS/CSS assets still exist.
- Some are likely historical only, but they are not yet classified safe-to-delete because old PWA clients may rely on them during update/recovery.
- Required next step: prove PWA update/recovery safety before deleting.

## Closed by remediation

- Stats root/public deployment mismatch: closed.
- Stats duplicate root static shell: closed.
- Stats inherited Hub baggage: closed.
- Collector fail-open rate control: closed.
- Collector card origin/target integrity gap: closed for known cards.
- Collector session/visitor mismatch acceptance: closed.
- Campaign POST same-origin gap: closed.
- Campaign write RBAC gap: closed.
- Bootstrap default-open lifecycle: closed.
- Stats HSTS/nosniff/X-Frame-Options/noindex: verified in production.
- Cards direct ZIP-to-main import: closed.
- Cards post-merge build-stamp writes: closed.
- Cards no browser QA: closed.
- Card generator context-escaping gap: closed.
- Cards Actions runtime warning: closed.
- Hub/Stats missing npm lockfiles: closed.
- Dead external Hub payment SVG files: closed.

## Safety constraints

- Do not delete D1 data.
- Do not rotate or change `AUTH_PEPPER` as part of routine cleanup.
- Do not delete historical Hub pinned runtime assets until PWA behavior is proven safe.
- Do not declare custom domains active without production verification.
