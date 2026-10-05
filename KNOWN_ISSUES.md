# KNOWN ISSUES — MPDGI Digital Ecosystem

Updated: 2026-10-05

## Open / verified or explicitly unverified

No known critical/high/medium defect is currently open from the remediation track. The final zero-assumption audit is complete and all 16 audit points are closed or explicitly accepted.

### Informational: transient Hub Lighthouse variance

One Hub `browser-qa` attempt reported Lighthouse Performance 0.63 while 30/30 Chromium functional tests, Accessibility 1.00 and Best Practices 1.00 passed. The failed job was re-run without code or threshold changes and workflow run `37267748275`, attempt 2 completed SUCCESS. Treat the 0.63 result as non-reproduced CI variance unless it recurs.

### 🟢 NPCard custom domain — closed

- Namecheap CNAME exists: `npcard` -> `npcard.pages.dev`.
- User confirmed `npcard.mpdgi.org` works on a real phone and validated the approved card.
- The audit environment still receives DNS resolution failure.
- Cloudflare had shown a waiting/pending state.
- Propagation is confirmed complete by the user. No additional DNS change is required.

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

### Informational: Cloudflare preview check noise on Hub `main`

The Cloudflare GitHub App can show a failed `Cloudflare Pages` check on Hub `main` because the connected Pages project is `mpdgi-stats`. Hub production is GitHub Pages, and Hub `validate`, `browser-qa`, GitHub Pages deployment and cleanup are green. This is not a Hub production failure and is not a required ruleset check.

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
