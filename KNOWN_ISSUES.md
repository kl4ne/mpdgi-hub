# KNOWN ISSUES — MPDGI Digital Ecosystem

Updated: 2026-10-04

## Open / verified

### 1. Stats custom domain not verified
- `https://stats.mpdgi.org` was not reachable at the expected Stats v1.4.6 version from GitHub Actions.
- Verified production fallback remains `https://mpdgi-stats.pages.dev`.
- Required next step: verify Cloudflare/DNS custom-domain configuration before calling `stats.mpdgi.org` active.

### 2. NPCard custom domain not verified
- `https://npcard.mpdgi.org` was not reachable from GitHub Actions during the latest card production smoke.
- Verified fallback remains `https://npcard.pages.dev` at NPCard v1.0.3.
- Required next step: verify Cloudflare/DNS custom-domain configuration and then real-device behavior.

### 3. Hub response-header hardening remains incomplete at hosting layer
- Hub production exposes HSTS.
- The latest header audit did not observe response-header `X-Content-Type-Options: nosniff`.
- The latest header audit did not observe response-header clickjacking protection via `X-Frame-Options` or CSP `frame-ancestors`.
- Because the Hub is on GitHub Pages/custom-domain infrastructure, adding Cloudflare Pages-style `_headers` to the repository would not solve this by itself.
- Required next step: review the actual hosting/proxy layer before changing code.

### 4. Password verifier still uses the legacy HMAC-SHA256 scheme
- Current scheme: `hmac-sha256-v1`.
- This is not an active authentication break.
- It remains a hardening opportunity because a slow password KDF would provide better offline resistance.
- Required next step: design a compatibility-safe migration that does not lock out the current owner account.

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
