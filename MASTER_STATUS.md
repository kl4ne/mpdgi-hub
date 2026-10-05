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

Open Hub infrastructure finding:
- production does not currently expose `X-Content-Type-Options: nosniff`
- production does not currently expose clickjacking protection as an HTTP response header
- public response is served directly by GitHub Pages, so a Cloudflare Pages-style repository `_headers` file is not a valid fix

## MPDGI Stats

- Repo: `kl4ne/mpdgi-hub`
- Branch: `mpdgi-stats-v1.0`
- Current HEAD: `a1a7cd62b6fe1baaa5689cd67cb54ef7cbf44d4c`
- Runtime version: `1.4.10`
- Verified production fallback: `https://mpdgi-stats.pages.dev`
- Post-merge validation run: `37258619739` — SUCCESS

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

Benchmark evidence:
- CI/Node WebCrypto proxy at 600,000 iterations:
  - min 90.93 ms
  - p50 92.43 ms
  - p95 94.05 ms
  - max 94.05 ms
- local Cloudflare workerd E2E observed login request wall times around 79–85 ms for successful password verification in the validated run; this still does not prove the account's production CPU-plan compatibility

Production endpoint status:
- canonical Stats endpoint: `https://mpdgi-stats.pages.dev`
- no Stats custom domain is configured or required

## MPDGI Digital Cards

- Repo: `kl4ne/mpdgi-digital-cards`
- Branch: `main`
- Current HEAD: `4fc5ef7e07c6f5ab8e4da63015f1a0519e9aaa87`
- RSCard: `1.3.2`
- NPCard fallback: `1.0.3`
- Post-merge validation run: `37256341259` — SUCCESS

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
- `npcard.mpdgi.org` failed public DNS resolution in run `37248236928`
- do not program Nancy NFC to the custom hostname until DNS/TLS + real-device validation pass

## Remaining open findings

1. Verify PBKDF2 600,000 behavior against the actual Cloudflare runtime/plan CPU limits before declaring auth performance fully closed.
2. Repair/validate `npcard.mpdgi.org` in Cloudflare Pages/DNS.
3. Add Hub nosniff + clickjacking response headers at the actual hosting/proxy layer.
4. Enforce branch protection / required CI checks where repository settings and plan allow it.

Branch lifecycle cleanup is complete:
- Hub reduced from 64 branches to 5 deliberate branches.
- Digital Cards reduced from 14 branches to 2 deliberate branches.
- automatic merged-branch cleanup is installed in both repositories.
- protected rollback checkpoints are preserved.

## Current closure classification

- Known repository-code defects from the re-audit: **remediated**.
- Full ecosystem audit: **not yet closed** because infrastructure/runtime/governance findings remain.

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
