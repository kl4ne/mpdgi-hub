# AUDIT REMEDIATION STATUS — MPDGI Digital Ecosystem

Updated: 2026-10-05

## Overall status

Repository-level audit remediation is substantially complete.

The remaining unresolved findings require infrastructure access rather than additional repository code.

## Closed / remediated

### Hub
- reproducible dependency lock and npm ci
- pinned GitHub Actions
- production QA/smoke
- dead external payment SVG assets removed
- historical v1.4.7–v1.5.2 runtime assets removed after reference/PWA review
- validator guards added against dead/historical asset reintroduction

### Stats
- deployed source of truth aligned to `public/`
- root/public duplication removed
- inherited Hub branch baggage removed
- collector fail-closed rate control
- origin/target/action integrity for known cards
- session/visitor mismatch rejection
- same-origin campaign writes
- write RBAC
- bootstrap disabled by default
- HSTS, nosniff, X-Frame-Options DENY and noindex verified on Pages production
- explicit schema migration path + read-first schema checks
- stale login-rate cleanup
- CSV formula neutralization
- reproducible lockfile / npm ci
- secret scanning
- dual-scheme password verification
- PBKDF2-HMAC-SHA256 target with 600,000 iterations
- login-time legacy upgrade support
- rollback checkpoint `checkpoint/stats-v1.4.7-dual-scheme`
- non-production KDF benchmark completed successfully

### Digital Cards
- direct ZIP-to-main import removed
- imports changed to PR-gated review flow
- post-merge build-stamp mutation removed
- browser QA added for Chromium + WebKit
- secret scanning added
- generator made context-safe
- fallback hostname support added
- runtime drift checks added
- production card smoke tests added
- update polling reduced
- custom-domain diagnostics added

## Remaining infrastructure-only blockers

### 1. Stats custom domain
`stats.mpdgi.org`

Evidence:
- GitHub Actions run `37247974058`
- public resolution failed:
  `curl: (6) Could not resolve host: stats.mpdgi.org`

Verified fallback:
- `https://mpdgi-stats.pages.dev`

Required:
- Cloudflare Pages custom-domain attachment/DNS/TLS inspection

### 2. Nancy card custom domain
`npcard.mpdgi.org`

Evidence:
- Digital Cards run `37248236928`
- public resolution failed:
  `curl: (6) Could not resolve host: npcard.mpdgi.org`

Verified fallback:
- `https://npcard.pages.dev`

Required:
- Cloudflare Pages custom-domain attachment/DNS/TLS inspection
- real-phone verification before programming Nancy NFC to the custom URL

### 3. Hub response-header hardening
`https://hub.mpdgi.org`

Verified:
- HSTS present

Not observed:
- `X-Content-Type-Options: nosniff`
- response-header clickjacking protection

Required:
- actual hosting/proxy/edge configuration
- do not use a Cloudflare Pages-style repository `_headers` file as a fake GitHub Pages fix

## Security constraints still active

- do not reset/delete D1
- do not rotate `AUTH_PEPPER` casually
- do not force a production owner login only to trigger password migration
- do not disable Pages fallbacks before custom domains are validated
- do not reintroduce workers.dev failover unless explicitly requested
- do not alter Nancy's approved artwork

## Completion condition

The audit remediation can be considered fully closed when all three infrastructure blockers above are independently fixed and revalidated in production.

## Repository closure checkpoint

PR #39 merged after Validate + QA success. Repository remediation is complete pending the three infrastructure-only blockers documented above.


## Closure status

- Repository-level remediation: CLOSED.
- Latest checkpoint: `905c9114f2130ab8a624590926c68cc0783d3a7b`.
- PR #40 and #41 merged after green validation/QA.
- Full audit closure now depends only on the three infrastructure items documented in `CLOUDFLARE_FIX_RUNBOOK.md`.
