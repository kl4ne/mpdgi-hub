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
- Current stable HEAD: `28641cd96c54b3885edcfcc8f0fa09122ba75da1`
- Current stable version: `1.4.5`
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
- Branch: `audit-fix/stats-schema-hardening`
- Goal:
  - make schema handling read-first
  - keep DDL only as compatibility fallback
  - add explicit `migrations/0003_collector_metrics.sql`
  - align documentation with the current release
- This work must be validated before merge.
- Do not apply destructive D1 operations.

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

1. Check the latest HEAD and CI result for `audit-fix/stats-schema-hardening`.
2. If green, merge it to `mpdgi-stats-v1.0`.
3. Wait for post-merge Stats production smoke to complete.
4. Record the new stable Stats HEAD/version here.
5. Create/update `CHAT_HANDOFF.md` and `NEXT_ACTION.md`.
6. Only then continue to the next audit remediation item.
