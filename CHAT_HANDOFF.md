# CHAT HANDOFF — MPDGI Digital Ecosystem

Updated: 2026-10-04

## Project

MPDGI Digital Ecosystem:
- MPDGI Hub
- MPDGI Stats
- MPDGI Digital Cards

## Permanent workflow rules

Use:

**do -> validate -> checkpoint -> continue**

Never restart after a timeout. Resume from the last validated checkpoint.

Long reports belong in `.md` / ZIP artifacts; chat should contain only a short summary, decisions needing attention, links, and the next exact step.

## Current stable production state

### Hub
- Repo: `kl4ne/mpdgi-hub`
- Branch: `main`
- Stable HEAD: `a3ecd2636f4a816d38e29a5035e0af393ee85d6d`
- Version: `1.6.0`
- URL: `https://hub.mpdgi.org`
- Latest Hub validation and deployment were green.

### Stats
- Repo: `kl4ne/mpdgi-hub`
- Branch: `mpdgi-stats-v1.0`
- Stable HEAD: `5684a15a24837bcf70846cbc4e1a9425019ae1f3`
- Stable version: `1.4.6`
- Post-merge validation run: `37243600952` — SUCCESS.
- 26 browser tests passed.
- Production Pages endpoint verified with HSTS, nosniff, X-Frame-Options DENY and noindex.
- Production Pages endpoint: `https://mpdgi-stats.pages.dev`

### Digital Cards
- Repo: `kl4ne/mpdgi-digital-cards`
- Branch: `main`
- Stable HEAD: `452f2c4096aa782c3be4fa77bc0f50d34487851b`
- RSCard: `1.3.2` at `https://rscard.mpdgi.org`
- NPCard Pages fallback: `1.0.3` at `https://npcard.pages.dev`
- Last production smoke passed for both.
- Nancy custom domain `https://npcard.mpdgi.org` was not reachable from GitHub Actions at the last check.

## Audit remediation already completed

- Stats CI now validates the deployed `public/` source.
- Stats root/public duplication and inherited Hub baggage were cleaned.
- Stats collector integrity was hardened.
- Stats HSTS/nosniff/X-Frame-Options/noindex were verified in production.
- Campaign POST same-origin protection added.
- Campaign write RBAC added.
- Bootstrap is disabled by default unless explicitly enabled.
- Hub and Stats use reproducible npm lockfiles and pinned GitHub Actions.
- Digital Card imports are manual and PR-gated.
- Digital Cards have Chromium + WebKit QA.
- Card generator has context-aware escaping and fallback-host support.
- Build metadata workflow no longer writes a second bot commit to main.
- Production card smoke tests were added and passed.
- Dead external payment SVG assets were removed from the Hub.
- Stats schema hardening PR #22 was merged:
  - read-first schema inspection
  - DDL compatibility fallback only when schema objects are missing
  - explicit `migrations/0003_collector_metrics.sql`
  - Stats release bumped to `1.4.6`

## Open issues / intentionally deferred work

1. Finish production validation of Stats v1.4.6.
2. Password verifier migration to a slow KDF remains deferred because it requires a carefully controlled compatibility plan.
3. Verify `npcard.mpdgi.org` from real Cloudflare/browser context before declaring it active.
4. Hub production header audit showed HSTS but did not show response-header nosniff/clickjacking protection. Hosting-layer remediation remains open.
5. Historical Hub pinned runtime files must not be deleted until old PWA update/recovery behavior is verified.

## Password migration design checkpoint

`SECURITY_MODEL.md` defines the approved migration:
- legacy `hmac-sha256-v1` remains readable during transition;
- target `pbkdf2-sha256-v1`;
- PBKDF2-HMAC-SHA256 with a 600,000-iteration floor subject to runtime benchmark;
- unchanged `AUTH_PEPPER`;
- successful legacy login upgrades only that user;
- failed login never mutates password fields;
- rollback must use code that understands both schemes.

PBKDF2 helper/parser support is merged and validated, but production login still remains legacy-only. No production credential has been migrated.

## Exact next action

Create a small Stats branch from `5684a15...` and wire dual-scheme login plus bootstrap behavior with focused migration tests. Validate and checkpoint before any real production owner login.

## Approved decisions that must not be re-asked or redone

- Hub and Digital Cards stay separate.
- Hub must not be modified merely to solve a card-specific issue.
- Do not reset D1.
- Do not rotate/change `AUTH_PEPPER` casually.
- Do not reintroduce workers.dev failover unless explicitly requested.
- New cards come from the master template/generator.
- No invented social/contact data.
- No GMacfie watermark.
- Developer credit remains: `Designed & Developed by Roberto S. Macfie for MPDGI`, with only Roberto's name linked to `https://rmcard.pages.dev`.
