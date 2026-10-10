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

## Accepted platform limitations

### Hub hosting

The current hosting architecture has been reviewed and accepted. No unresolved critical/high/medium hosting issue is open, and no hosting migration is pending.

### Digital Cards branch ruleset

Hub and Stats now have active branch rulesets with required CI.

The private Digital Cards repository cannot use repository rulesets on the current GitHub Free plan. The repository will remain private and will not be made public solely for rulesets. Existing PR-gated workflows, validation and merged-branch cleanup remain in place.

### Informational: non-required integration check

A non-required external integration check can report independently of the Hub's required checks. The required `validate` and `browser-qa` checks remain the governance source of truth.

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


## New audit 2026-10-10 — explicit status

- **Known security-header limitation (medium/configuration):** Hub `hub.mpdgi.org` GitHub Pages QA logged missing `X-Content-Type-Options: nosniff` and both `X-Frame-Options` / header CSP `frame-ancestors` (QA 37388089277). HSTS was observed. Github Pages does not process Cloudflare Pages `_headers`; do not pretend this is repaired without an authorized hosting change.
- **Social preview (planned v1.6.1 patch):** PNG 1200x630 generated and metadata targeted in PR, subject to CI and live-social-platform verification.
- **Owner privacy decision:** all privacy/cookies/analytics behavior intentionally remains as previously implemented; no changes authorized or attempted.
- **Optional follow-up:** periodic real-provider URL checks, Android/iOS share previews, offline NFC and physical-device accessibility. Not confirmed failures.
