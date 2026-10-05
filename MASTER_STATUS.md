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
- Current stable HEAD: `7663c175b6532934924017d17eac84b153421f7f`
- Runtime version: `1.6.0`
- Production URL: `https://hub.mpdgi.org`
- Latest validated work:
  - reproducible QA dependency lock
  - pinned GitHub Actions
  - production smoke checks
  - dead external payment SVG assets removed
  - unreferenced Hub runtime assets v1.4.7 through v1.5.2 removed after current HTML/SW/CI reference audit
- CI / Pages deployment: validated green after latest merged changes.

### MPDGI Stats
- Repository: `kl4ne/mpdgi-hub`
- Branch: `mpdgi-stats-v1.0`
- Stable HEAD before benchmark utility merge: `e3b237c46350352b183d40a172eee0a0a8667319`
- Latest validated Stats HEAD: `6213978d83d57eb236422c9e10290ae61e15cd99`
- Stable runtime version: `1.4.7`
- Benchmark PR run: `37244913868` — SUCCESS
- Post-merge validation run: `37246063157` — SUCCESS
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
5. Historical Hub runtime cleanup is complete for v1.4.7–v1.5.2. Current v1.6.0 runtime remains intact. Git history retains rollback/reference copies.

## Things that must not be redone

- Do not restart the audit from zero.
- Do not redesign the Hub to solve Digital Card issues.
- Do not reset D1.
- Do not rotate or alter `AUTH_PEPPER` without an explicit migration plan.
- Do not reintroduce the postponed `workers.dev` gateway/failover unless explicitly requested.
- Do not replace Nancy's approved art with a regenerated version.
- Do not invent social URLs or contact data.
- Do not use the `GMacfie` watermark in this project.

## Security design checkpoint

- `SECURITY_MODEL.md` defines the compatibility-safe password-verifier migration.
- Target: `pbkdf2-sha256-v1`.
- Migration: dual-scheme support plus rehash after successful legacy login.
- `AUTH_PEPPER` remains unchanged.
- No production credential or D1 mutation occurred in this documentation phase.

## Exact next action

1. Benchmark PBKDF2 cost using the closest available runtime without exposing a public benchmark endpoint.
2. Record p50/p95 or repeated timing evidence and keep the 600,000-iteration floor unless evidence shows unacceptable latency.
3. Do not perform or force a production owner login solely to trigger migration.
4. Verify `stats.mpdgi.org` and `npcard.mpdgi.org` at Cloudflare/DNS when access is available.
5. Continue one atomic validated phase at a time.
