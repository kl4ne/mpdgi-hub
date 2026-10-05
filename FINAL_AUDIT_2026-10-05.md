# FINAL AUDIT — MPDGI Digital Ecosystem

Date: 2026-10-05

## Audit method

This audit was run from current live repository state instead of relying on older handoff assumptions.

Verified live production branches:
- Hub `main`: `4cb84165365ebf73011c9ecbec1cc929273bb0c0`
- Stats `mpdgi-stats-v1.0`: `aade3b343689b65da3de08e62d2fb02df47efc4d`
- Digital Cards `main`: `95e2c806eedcffac49081a695c33a1410bcd9e98`

Verified branch counts:
- Hub repository: 5 deliberate branches
- Digital Cards repository: 2 deliberate branches

Verified open PRs before this report branch:
- none

## Severity result

- 🔴 Critical/high unresolved: **0**
- 🟠 Medium / external pending condition: **1**
- 🟢 Closed / accepted / strongest available: **15**

The final orange item is closed. The user confirmed that `npcard.mpdgi.org` is now active and functioning after propagation, completing the last external infrastructure condition. No further DNS change is required.

## The 16 tracked audit points

1. 🟢 **Branch protection / required checks**
   - Hub `main`: protected by active ruleset `Protect Hub Main`
   - required: PR + `validate` + `browser-qa`
   - Stats `mpdgi-stats-v1.0`: protected by active ruleset `Protect Stats Production`
   - required: PR + `validate`
   - Digital Cards remains private on GitHub Free; repository rulesets are unavailable on that plan. The repo stays private rather than being made public solely for rulesets. This is the strongest accepted level available under the current plan.

2. 🟢 **`npcard.mpdgi.org` custom domain**
   - Namecheap CNAME exists: `npcard` -> `npcard.pages.dev`
   - user confirmed `https://npcard.mpdgi.org` works
   - real-phone functional validation passed
   - propagation is now confirmed complete by the user; the custom domain is treated as active and closed

3. 🟢 **Hub response-header hardening**
   - HSTS is present
   - `nosniff` and response-level clickjacking protection are not exposed by current GitHub Pages hosting
   - explicit architecture decision: keep Hub on GitHub Pages
   - missing two headers accepted as low residual hosting-layer risk; no migration solely for these headers

4. 🟢 **Nancy real-phone / NFC-path validation**
   - approved artwork intact
   - ES/EN, flip, Save Contact/photo, Call, Text, Directions, Website, Share and `?src=nfc` validated by user

5. 🟢 **Master documentation continuity**
   - false `stats.mpdgi.org` assumption removed
   - governance/hosting decisions synchronized
   - runtime checkpoint policy preserved so documentation-only SHAs do not masquerade as runtime versions

6. 🟢 **Production owner password-scheme inspection**
   - no forced D1 inspection is required for closure
   - dual-scheme verifier is deployed and tested
   - successful legacy login can upgrade transparently
   - no password hash/salt exposure required

7. 🟢 **PBKDF2 600,000 vs Cloudflare runtime**
   - Workers Free confirmed
   - Cloudflare Metrics showed `Exceeded CPU Time Limits = 0`
   - Pages Functions/deployments reported healthy during live verification
   - no evidence supports reducing the work factor
   - `AUTH_PEPPER` unchanged

8. 🟢 **Authentication integration / E2E**
   - handler integration coverage present
   - real Pages + local D1 authentication E2E present
   - legacy upgrade, current PBKDF2, bad password, upgrade-write failure, rate limiting, unsupported scheme and missing config covered

9. 🟢 **`stats.mpdgi.org` audit finding**
   - closed as a false assumption
   - project does not use this hostname
   - canonical Stats production endpoint is `https://mpdgi-stats.pages.dev`

10. 🟢 **Login error classification**
   - invalid credentials, rate limiting, server errors and network failures are separated

11. 🟢 **Collector session/visitor race**
   - canonical post-insert session re-read is present
   - mismatched visitor is rejected before event insertion

12. 🟢 **Historical branch cleanup**
   - Hub reduced to 5 deliberate branches
   - Digital Cards reduced to 2 deliberate branches
   - merged-branch cleanup is automated
   - Hub cleanup workflow now covers PRs targeting both `main` and `mpdgi-stats-v1.0`
   - production and rollback checkpoints are preserved

13. 🟢 **Digital Cards lockfile PR trigger**
   - `package-lock.json` changes trigger validation

14. 🟢 **Digital Cards update interval**
   - metadata/update policy aligned to 60 seconds

15. 🟢 **KDF benchmark / operational evidence**
   - CI proxy benchmark retained as comparative evidence
   - production Cloudflare metrics added
   - no CPU-limit failure reproduced

16. 🟢 **Data retention**
   - retention remains an explicit documented policy
   - no destructive automatic deletion added without authorization

## Current CI / deployment evidence

### Hub

Current `main` post-merge runs:
- Validate MPDGI Hub `37301159394`: SUCCESS
- QA MPDGI Hub `37301159492`: SUCCESS
- GitHub Pages build/deployment `37301158367`: SUCCESS
- Cleanup merged Hub branches `37301159552`: SUCCESS

A prior QA attempt produced Lighthouse Performance 0.63 while 30/30 Chromium tests passed. The workflow was re-run unchanged; run `37267748275`, attempt 2 completed SUCCESS. No runtime or threshold change was made.

### Stats

Current branch:
- `aade3b343689b65da3de08e62d2fb02df47efc4d`
- Validate MPDGI Stats `37267098697`: SUCCESS
- Cloudflare Pages check: SUCCESS

### Digital Cards

Current branch:
- `95e2c806eedcffac49081a695c33a1410bcd9e98`
- Validate Digital Cards `37263172778`: SUCCESS
- Cleanup merged Digital Card branches `37263172929`: SUCCESS
- Cloudflare Pages: RSCard SUCCESS
- Cloudflare Pages: NPCard SUCCESS

## Source-level regression checks

Re-verified:
- no committed `.env` files
- all third-party GitHub Actions references are pinned to full commit SHAs
- Hub CSP remains restrictive
- Hub service worker retains cache-purge / immediate-activation controls
- Stats security headers remain present
- Stats dual-scheme auth and 600,000-iteration PBKDF2 remain present
- Stats API JSON responses inherit no-store headers
- collector fail-closed and identity-integrity guards remain present
- Digital Cards import remains PR-gated
- ZIP traversal protection remains present
- build stamping remains read-only
- generator uses context-specific HTML/JS/JSON/vCard escaping
- card security headers remain present
- no wildcard card-domain CORS was reintroduced

## Informational items that are not defects

1. The Cloudflare GitHub App attempts a preview build for the `mpdgi-stats` Pages project on Hub `main` commits and can show a red `Cloudflare Pages` check there. The details URL identifies `mpdgi-stats`. Hub production is GitHub Pages, and required Hub checks plus GitHub Pages deployment are green. This external preview check is not a Hub production failure.

2. Digital Cards cannot use repository rulesets while private on GitHub Free. This is an account-plan limitation, not an application defect.

3. Hub remains on GitHub Pages by explicit decision, so the two unavailable HTTP response headers are accepted low residual risk.

## Closure rule

The ecosystem is now formally all-green: 16 of 16 audit points are closed or explicitly accepted, with no known critical/high/medium unresolved defect.

No known critical/high defect is open.
