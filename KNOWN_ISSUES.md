# KNOWN ISSUES — MPDGI Digital Ecosystem

Updated: 2026-10-05

## Open / verified or explicitly unverified

### 1. Latest Hub Lighthouse performance result requires confirmation

A recent Hub `browser-qa` run reported:
- Chromium functional tests: 30/30 passed
- Accessibility: 1.00
- Best Practices: 1.00
- Lighthouse Performance: 0.63, below the configured 0.80 threshold

The failed job has been re-run to determine whether this is reproducible before changing application code or thresholds.

## Accepted residual risks / plan limitations

### Hub response headers

The Hub remains on GitHub Pages by explicit architecture decision.

Not observed at the HTTP response layer:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options` or response CSP `frame-ancestors`

This is accepted as a low residual hosting limitation. The Hub will not be migrated solely to add these two headers.

### Digital Cards branch ruleset

Hub and Stats now have active branch rulesets with required CI.

The private Digital Cards repository cannot use repository rulesets on the current GitHub Free plan. The repository will remain private and will not be made public solely for rulesets. Existing PR-gated workflows, validation and merged-branch cleanup remain in place.

## Informational: production admin password scheme

Stats supports both legacy and PBKDF2 records. A normal successful legacy login may upgrade that authenticated user. The currently stored production owner's scheme is not assumed without D1 evidence.

Do not force a login or expose password_hash/password_salt merely to inspect migration status.

## Closed by remediation

- PBKDF2 production-runtime concern: Workers Free confirmed, Cloudflare Metrics showed `Exceeded CPU Time Limits = 0`, and no active CPU-limit failure was reproduced.
- NPCard custom domain: Namecheap CNAME is present and the user completed real-phone functional validation on `npcard.mpdgi.org`.
- Hub `main` branch protection: active ruleset requires PR, `validate`, and `browser-qa`.
- Stats production branch protection: active ruleset requires PR and `validate`.

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
