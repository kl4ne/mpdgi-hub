# MPDGI Digital Ecosystem — MASTER STATUS

Updated: 2026-10-04

## Permanent work protocol

All future work on this project follows:

**do -> validate -> checkpoint -> continue**

Large tasks must be split into small, atomic, verifiable phases. A timeout must never trigger a restart from zero. Resume from the last validated checkpoint.

Long technical reports should be delivered as `.md` files, and grouped in a ZIP when useful, instead of filling the chat.

## Current production / stable state

### MPDGI Hub
- Repository: `kl4ne/mpdgi-hub`
- Branch: `main`
- Current stable HEAD: `a3ecd2636f4a816d38e29a5035e0af393ee85d6d`
- Runtime version: `1.6.0`
- Production URL: `https://hub.mpdgi.org`
- Latest validated work:
  - reproducible QA dependency lock
  - pinned GitHub Actions
  - production smoke checks
  - dead external payment SVG assets removed
- CI / Pages deployment: validated green after latest merged changes.

### MPDGI Stats
- Repository: `kl4ne/mpdgi-hub`
- Branch: `mpdgi-stats-v1.0`
- Stable HEAD: `c492355da3849e656e722a90927f7ade92814c16`
- Stable version: `1.4.6`
- Post-merge validation run: `37242557183` — SUCCESS
- Production endpoint: `https://mpdgi-stats.pages.dev`
- Latest validated work:
  - `public/` is the single deployed static source
  - collector integrity hardening
  - HSTS / nosniff / clickjacking / noindex response headers verified
  - same-origin campaign mutations
  - role guard for campaign writes
  - bootstrap disabled by default unless explicitly enabled
  - inherited Hub dead code removed from the Stats branch
  - reproducible npm lock + pinned GitHub Actions
- No D1 data was deleted or reset.
- `AUTH_PEPPER` was not changed.

### MPDGI Digital Cards
- Repository: `kl4ne/mpdgi-digital-cards`
- Branch: `main`
- Current stable HEAD: `452f2c4096aa782c3be4fa77bc0f50d34487851b`
- RSCard: `1.3.2`
- NPCard Pages fallback: `1.0.3`
- Latest validated work:
  - imports are manual and PR-gated
  - no direct ZIP-to-main replacement
  - build metadata workflow is read-only
  - secret scanning
  - Chromium + WebKit browser QA
  - hardened master generator
  - production card smoke tests
  - 60-second version polling
- Verified production:
  - `https://rscard.mpdgi.org` at RSCard v1.3.2
  - `https://npcard.pages.dev` at NPCard v1.0.3
- Nancy custom domain `https://npcard.mpdgi.org` was not reachable from GitHub Actions during the last production smoke; Pages fallback remains verified.

## In progress

### Stats schema hardening
- PR #22 was merged to `mpdgi-stats-v1.0` as `c492355da3849e656e722a90927f7ade92814c16`.
- Implemented:
  - read-first schema checks
  - DDL only as compatibility fallback
  - explicit `migrations/0003_collector_metrics.sql`
  - documentation aligned to v1.4.6
- Post-merge GitHub Actions run `37242557183` completed successfully.
- Production smoke verified `mpdgi-stats.pages.dev` at v1.4.6 with HSTS, nosniff, X-Frame-Options DENY and noindex.
- `stats.mpdgi.org` was not reachable at the expected version from GitHub Actions; Pages remains the verified production endpoint.
- No destructive D1 operation was performed.

## Open audit items

1. Finish and validate Stats schema-hardening PR.
2. Decide whether to migrate password verification from fast HMAC-SHA256 to a slow password KDF; this requires a controlled compatibility/migration plan and must not invalidate existing access.
3. Verify Nancy custom domain `npcard.mpdgi.org` from a real browser / Cloudflare configuration before declaring it active.
4. Hub production currently exposes HSTS, but the last header audit reported no response-header `X-Content-Type-Options: nosniff` and no response-header clickjacking protection. Because Hub is served through GitHub Pages/custom-domain infrastructure, remediation needs hosting-layer review rather than adding a useless `_headers` file.
5. Historical Hub runtime files may still exist. Do not remove old pinned runtime assets blindly because installed PWA clients may depend on them during update/recovery.

## Things that must not be redone

- Do not restart the audit from zero.
- Do not redesign the Hub to solve Digital Card issues.
- Do not reset D1.
- Do not rotate or alter `AUTH_PEPPER` without an explicit migration plan.
- Do not reintroduce the postponed `workers.dev` gateway/failover unless explicitly requested.
- Do not replace Nancy's approved art with a regenerated version.
- Do not invent social URLs or contact data.
- Do not use the `GMacfie` watermark in this project.

## Exact next action

1. Create/update `KNOWN_ISSUES.md` and `DECISIONS.md` with the remaining verified items.
2. Do not start password-KDF migration yet; first design a compatibility-safe migration plan.
3. Verify `stats.mpdgi.org` and `npcard.mpdgi.org` at the Cloudflare/DNS layer before declaring those custom domains active.
4. Review Hub hosting-layer security headers; do not add a useless `_headers` file to GitHub Pages.
5. Continue remediation one small validated phase at a time.
