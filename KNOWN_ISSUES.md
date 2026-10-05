# KNOWN ISSUES — MPDGI Digital Ecosystem

Updated: 2026-10-05

## Open / verified or explicitly unverified

### 1. PBKDF2 production-runtime compatibility needs direct Cloudflare evidence

Stats v1.4.10 uses PBKDF2-HMAC-SHA256 at 600,000 iterations.

Available evidence:
- CI/Node WebCrypto benchmark: p50 92.43 ms / p95 94.05 ms.
- Stats v1.4.10 validation and Pages production smoke are green.

Missing evidence:
- actual Cloudflare Pages Functions/Workers account plan CPU limit and production-runtime CPU evidence. Local workerd E2E is now green and observed successful auth requests around 79–85 ms wall time, but local wall time is not the account CPU quota.

Required:
- inspect Cloudflare plan/runtime metrics before considering KDF performance fully closed.
- do not reduce iterations or rotate AUTH_PEPPER without evidence and an explicit security decision.

### 2. Stats custom domain has no public DNS resolution

- `stats.mpdgi.org` failed public resolution in run `37247974058`.
- `curl: (6) Could not resolve host: stats.mpdgi.org`.
- Verified production fallback is `https://mpdgi-stats.pages.dev`.
- This is a Cloudflare Pages/DNS configuration blocker, not an application-code blocker.

### 3. NPCard custom domain has no public DNS resolution

- `npcard.mpdgi.org` failed public resolution in run `37248236928`.
- `curl: (6) Could not resolve host: npcard.mpdgi.org`.
- Verified fallback is `https://npcard.pages.dev` at v1.0.3.
- Real-phone/NFC validation is required after the custom domain becomes active.

### 4. Hub response-header hardening is incomplete at the hosting layer

Verified:
- HSTS present.
- Hub v1.6.0 production smoke is green.

Not observed:
- `X-Content-Type-Options: nosniff`
- clickjacking protection through `X-Frame-Options` or response CSP `frame-ancestors`

The public response is served directly by GitHub Pages. A repository-only Cloudflare Pages `_headers` file is not a valid fix.

### 5. Production branches are not protected

Observed during re-audit:
- Hub `main`: `protected:false`
- Stats `mpdgi-stats-v1.0`: `protected:false`
- Digital Cards `main`: `protected:false`
- no active ruleset was observed for the Hub repository

Required:
- enforce PR + required green checks where GitHub repository settings/plan permit it.

## Informational: production admin password scheme

Stats supports both legacy and PBKDF2 records. A normal successful legacy login may upgrade that authenticated user. The currently stored production owner's scheme is not assumed without D1 evidence.

Do not force a login or expose password_hash/password_salt merely to inspect migration status.

## Closed by remediation

- Stats root/public deployment mismatch.
- duplicate Stats root shell.
- inherited Hub baggage in Stats.
- collector fail-open rate control.
- card origin/target/action integrity gap.
- established session/visitor mismatch acceptance.
- concurrent first-request session/visitor race.
- campaign POST same-origin gap.
- campaign write RBAC gap.
- bootstrap default-open lifecycle.
- stale login-rate cleanup.
- CSV formula injection.
- misleading login 5xx/network-as-invalid-credentials behavior.
- password-upgrade write blocking a valid login.
- missing auth-handler integration coverage for principal login paths.
- missing real Pages + local D1 authentication E2E.
- Stats HSTS/nosniff/X-Frame-Options/noindex on Pages production.
- Cards direct ZIP-to-main import.
- Cards post-merge build-stamp writes.
- Cards browser QA gap.
- card generator context-escaping gap.
- Cards lockfile PR-trigger gap.
- Cards 15-vs-60-second metadata policy inconsistency.
- Hub/Stats missing npm lockfiles.
- dead Hub payment assets.
- historical Hub pinned runtime files 1.4.7–1.5.2.

## Safety constraints

- Do not delete/reset D1.
- Do not casually rotate AUTH_PEPPER.
- Do not lower password work factor without measured production evidence.
- Do not declare custom domains active without production verification.
