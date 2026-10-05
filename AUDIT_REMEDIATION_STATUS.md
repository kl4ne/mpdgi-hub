# AUDIT REMEDIATION STATUS — MPDGI Digital Ecosystem

Updated: 2026-10-05

## Current classification

Known repository-code findings from the latest re-audit have been remediated and validated.

Full ecosystem audit closure is **not yet declared** because infrastructure/runtime/governance findings remain.

## Hub — closed code findings

- reproducible dependency lock + npm ci
- pinned Actions
- Chromium/WebKit QA
- production smoke
- dead payment asset cleanup
- historical runtime cleanup
- service-worker cache cleanup guards

Accepted Hub hosting limitation:
- GitHub Pages remains the selected host.
- Missing `nosniff` and response-level clickjacking headers are accepted as low residual risk rather than a migration requirement.
- The isolated Lighthouse Performance 0.63 result was re-run without code/threshold changes; workflow run `37267748275`, attempt 2 completed SUCCESS, so no reproducible performance defect is currently open.

## Stats — closed code findings

Current release:
- v1.4.10
- HEAD `a1a7cd62b6fe1baaa5689cd67cb54ef7cbf44d4c`
- post-merge run `37258619739`: SUCCESS

Closed:
- deployed source-of-truth mismatch
- duplicate static shell
- inherited Hub baggage
- collector fail-closed rate control
- card origin/target/action integrity
- established + concurrent session/visitor mismatch paths
- campaign same-origin + RBAC
- bootstrap explicit enable
- schema/migration hardening
- stale login-rate cleanup
- CSV formula neutralization
- lockfile/npm ci/secret scanning
- dual-scheme password verification
- login-time PBKDF2 upgrade
- failed-upgrade nonblocking behavior
- 401/429/5xx/network login diagnostics
- auth handler integration coverage
- real Pages + local D1 authentication E2E
- Pages production security headers

Stats runtime verification:
- Workers Free confirmed.
- Cloudflare Metrics showed `Exceeded CPU Time Limits = 0`.
- No active/reproducible CPU-limit failure was observed.
- PBKDF2 remains at 600,000 iterations and `AUTH_PEPPER` remains unchanged.

## Digital Cards — closed code findings

Current main:
- `4fc5ef7e07c6f5ab8e4da63015f1a0519e9aaa87`
- post-merge run `37256341259`: SUCCESS

Closed:
- direct ZIP-to-main import
- ZIP traversal risk
- post-merge metadata writes
- missing secret scanning
- missing browser QA
- generator escaping/fallback-host gaps
- missing production smoke
- lockfile PR-trigger gap
- update-interval policy mismatch

NPCard custom-domain status:
- Namecheap CNAME for `npcard` points to `npcard.pages.dev`.
- User confirmed `npcard.mpdgi.org` works on a real phone and validated the approved card functions.

## Governance status

- Hub `main`: active ruleset requires PR + `validate` + `browser-qa`.
- Stats `mpdgi-stats-v1.0`: active ruleset requires PR + `validate`.
- Digital Cards: private GitHub Free repository; rulesets unavailable without Pro/public visibility. This plan limitation is accepted and the repo stays private.
- merged-branch cleanup is automated; this checkpoint extends Hub-repo cleanup to merged Stats PR branches as well.

## Full closure condition

Do not call the full audit closed until:
1. the current Hub QA/Lighthouse status is resolved;
2. governance/cleanup automation is validated after the latest changes;
3. a final zero-assumption audit is green.

Accepted hosting/plan limitations do not count as unresolved defects once documented and explicitly accepted.
