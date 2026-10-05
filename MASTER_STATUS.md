# MPDGI Digital Ecosystem — MASTER STATUS

Updated: 2026-10-05

## Permanent workflow

**do -> validate -> checkpoint -> continue**

Do not restart after timeout. Resume from the last validated checkpoint. Keep long reports in files, not in chat.

## MPDGI Hub

- Repo: `kl4ne/mpdgi-hub`
- Branch: `main`
- Hub v1.6.0 runtime checkpoint: `739d7523e50f3ad9923143c8c922cd495856fd25`
- Runtime version: `1.6.0`
- Production: `https://hub.mpdgi.org`

Verified:
- reproducible npm lockfile + npm ci
- pinned GitHub Actions
- Chromium/WebKit QA + production smoke
- dead payment assets removed
- historical runtime 1.4.7–1.5.2 removed
- service worker purges old MPDGI Hub caches
- HSTS present

Hub hosting/security status:
- production hosting architecture reviewed
- required Hub validation and browser QA are enforced
- no unresolved critical/high/medium hosting defect remains

## MPDGI Stats

- Repo: `kl4ne/mpdgi-hub`
- Branch: `mpdgi-stats-v1.0`
- Current HEAD: `aade3b343689b65da3de08e62d2fb02df47efc4d`
- Runtime version: `1.4.10`
- Verified production fallback: `https://mpdgi-stats.pages.dev`
- Current validation run: `37267098697` — SUCCESS

Completed:
- `public/` is the single deployed/tested static source
- collector fail-closed behavior
- card origin/target/action integrity
- session/visitor mismatch rejection
- concurrent first-request session/visitor race closed with canonical post-insert verification
- campaign same-origin + write RBAC
- bootstrap disabled by default
- read-first schema checks + explicit migrations
- stale login-rate cleanup
- CSV formula neutralization
- HSTS / nosniff / X-Frame-Options DENY / noindex verified on Pages production
- dual-scheme auth: `hmac-sha256-v1` + `pbkdf2-sha256-v1`
- PBKDF2 target: 600,000 iterations
- login-time legacy upgrade
- failed upgrade write does not block an otherwise valid login
- UI distinguishes invalid credentials, rate limiting, server failure and network failure
- auth-handler integration tests added
- real Pages + local D1 authentication E2E added with pinned Wrangler 4.147.0
- real local D1 E2E covers PBKDF2 login, legacy login, session lookup, invalid password and rate limiting
- browser coverage for 401 / 429 / 5xx / network failure
- AUTH_PEPPER unchanged
- no D1 reset/deletion

Benchmark/runtime evidence:
- CI/Node WebCrypto proxy at 600,000 iterations:
  - min 90.93 ms
  - p50 92.43 ms
  - p95 94.05 ms
  - max 94.05 ms
- local Cloudflare workerd E2E observed successful login wall times around 79–85 ms
- account plan confirmed: Workers Free
- Cloudflare production Metrics showed `Exceeded CPU Time Limits = 0`
- Pages Functions/deployments were reported healthy during the live verification
- no current evidence supports reducing PBKDF2 below 600,000 iterations

Production endpoint status:
- canonical Stats endpoint: `https://mpdgi-stats.pages.dev`
- no Stats custom domain is configured or required

## MPDGI Digital Cards

- Repo: `kl4ne/mpdgi-digital-cards`
- Branch: `main`
- Current HEAD: `95e2c806eedcffac49081a695c33a1410bcd9e98`
- RSCard: `1.3.2`
- NPCard fallback: `1.0.3`
- Current validation run: `37263172778` — SUCCESS

Completed:
- PR-gated ZIP imports
- ZIP traversal protections
- read-only build metadata verification
- secret scanning
- pinned Actions + npm ci + lockfile
- Chromium + WebKit QA
- context-safe generator
- Pages fallback host support
- production smoke
- 60-second update polling
- build metadata policy aligned to the same 60-second minimum
- lockfile changes now trigger pull-request validation

Verified production:
- `https://rscard.mpdgi.org`
- `https://npcard.pages.dev`

Custom-domain status:
- Namecheap now has `npcard` CNAME -> `npcard.pages.dev`
- user confirmed `https://npcard.mpdgi.org` loads correctly
- user completed real-phone validation of approved artwork, ES/EN, flip, Save Contact/photo, Call, Text, Directions, Website, Share and `?src=nfc`
- Cloudflare dashboard propagation/status may lag behind a functioning hostname; do not treat that UI delay as an application defect

## Remaining open findings

1. 🟢 `npcard.mpdgi.org` propagation is complete and the custom domain is confirmed active/functioning by the user.

Final zero-assumption audit completed and recorded in `FINAL_AUDIT_2026-10-05.md`: 16/16 closed or accepted, 0 critical/high/medium unresolved defects.

Latest Hub QA confirmation:
- workflow run `37267748275`, attempt 2: SUCCESS
- prior isolated Lighthouse Performance 0.63 result did not reproduce
- no Hub runtime or QA threshold change was required.

Accepted limitations / decisions:
- Hub hosting architecture is intentionally stable; no migration is pending.
- Hub `main` is protected by active ruleset `Protect Hub Main` requiring PR + `validate` + `browser-qa`.
- Stats `mpdgi-stats-v1.0` is protected by active ruleset `Protect Stats Production` requiring PR + `validate`.
- Digital Cards remains private on GitHub Free; repository rulesets are unavailable on that plan. The repo will not be made public solely to obtain rulesets.

Branch lifecycle cleanup is complete:
- Hub reduced from 64 branches to 5 deliberate branches.
- Digital Cards reduced from 14 branches to 2 deliberate branches.
- automatic merged-branch cleanup is installed in both repositories.
- protected rollback checkpoints are preserved.

## Current closure classification

- Known repository-code defects from the re-audit: **remediated**.
- Final zero-assumption audit: **completed**.
- Critical/high unresolved defects: **0**.
- Full all-green closure achieved: 16/16 audit points closed or explicitly accepted.

## Safety rules

- Do not reset/delete D1.
- Do not rotate `AUTH_PEPPER` casually.
- Do not lower PBKDF2 work factor without real runtime evidence and a documented security decision.
- Do not disable Pages fallbacks before custom-domain verification.
- Do not reintroduce workers.dev failover unless explicitly requested.
- Do not alter Nancy's approved artwork.


## Latest continuity checkpoint

- PR #52 merged successfully.
- PR #52 captured Hub v1.6.0 runtime checkpoint `739d7523e50f3ad9923143c8c922cd495856fd25`. Later documentation/governance-only merges may advance `main` without changing the Hub runtime.
- Stats remains v1.4.10 at `a1a7cd62b6fe1baaa5689cd67cb54ef7cbf44d4c`.
- Stats post-merge validation run `37258619739`: SUCCESS.


## HEAD reference policy

Do not treat a documentation-only merge SHA as a new runtime version/checkpoint.

Before any mutation:
- query the live branch HEAD from GitHub;
- use the documented runtime checkpoint only to identify the last validated application state;
- update runtime checkpoint references only when application/runtime behavior changes and is validated.

This avoids a self-invalidating loop where a documentation PR makes its own recorded main SHA stale immediately after merge.
