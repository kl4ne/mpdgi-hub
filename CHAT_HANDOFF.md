# CHAT HANDOFF — MPDGI Digital Ecosystem

Updated: 2026-10-05

## Permanent rule

**do -> validate -> checkpoint -> continue**

Never restart because of timeout.

## Current state

### Hub
- repo: `kl4ne/mpdgi-hub`
- branch: `main`
- v1.6.0 runtime checkpoint: `739d7523e50f3ad9923143c8c922cd495856fd25`
- version: `1.6.0`
- production smoke/Chromium/WebKit green
- HSTS present
- nosniff/clickjacking response headers still require infrastructure-layer remediation

### Stats
- repo: `kl4ne/mpdgi-hub`
- branch: `mpdgi-stats-v1.0`
- HEAD: `a1a7cd62b6fe1baaa5689cd67cb54ef7cbf44d4c`
- version: `1.4.10`
- post-merge run `37258619739`: SUCCESS
- verified production fallback: `mpdgi-stats.pages.dev`
- dual-scheme auth deployed
- PBKDF2 target: 600,000 iterations
- auth network/service/credential errors are separated
- real login-handler integration tests exist
- real Pages + local D1 auth E2E is merged and post-merge CI is green
- failed password-upgrade write cannot block a valid login
- concurrent session/visitor collector race closed
- AUTH_PEPPER unchanged
- no D1 reset
- canonical Stats production endpoint is `https://mpdgi-stats.pages.dev`; no Stats custom domain is used

### Digital Cards
- repo: `kl4ne/mpdgi-digital-cards`
- branch: `main`
- HEAD: `4fc5ef7e07c6f5ab8e4da63015f1a0519e9aaa87`
- RSCard v1.3.2 verified
- NPCard Pages v1.0.3 verified
- latest Cards post-merge validation `37256341259`: SUCCESS
- lockfile PR trigger and 60-second policy consistency repaired
- `npcard.mpdgi.org` still lacks public DNS resolution

## Re-audit repairs completed

- Stats v1.4.9 auth diagnostics + integration coverage
- Stats v1.4.10 canonical session/visitor race protection
- Digital Cards lockfile-trigger + 60-second metadata policy alignment
- historical/dead Hub runtime cleanup
- branch lifecycle cleanup closed: Hub 64→5 branches; Digital Cards 14→2 branches
- automatic merged-branch cleanup installed in both repositories
- prior Stats/Cards/Hub audit remediations remain intact

## Remaining findings

1. Actual Cloudflare runtime/plan PBKDF2 verification.
2. `npcard.mpdgi.org` DNS/custom-domain repair.
3. Hub response-header hardening.
4. Branch protection / required checks.

## Do not redo

- do not restart the completed code audit work;
- do not reset D1;
- do not rotate AUTH_PEPPER;
- do not invent DNS records;
- do not replace Nancy artwork;
- do not disable Pages fallbacks prematurely.

Read next:
- MASTER_PROJECT_PLAN.md
- MASTER_STATUS.md
- NEXT_ACTION.md
- KNOWN_ISSUES.md
- ARCHITECTURE.md
- DATABASE_SCHEMA.md
- SECURITY_MODEL.md
- CLOUDFLARE_FIX_RUNBOOK.md


## Latest continuity checkpoint

PR #52 captured Hub v1.6.0 runtime checkpoint `739d7523e50f3ad9923143c8c922cd495856fd25`. Later docs/governance merges may advance `main`; always query the live branch HEAD before making changes. Stats remains v1.4.10 at `a1a7cd62b6fe1baaa5689cd67cb54ef7cbf44d4c`.


## HEAD handling rule

The SHA in this handoff identifies the last validated runtime checkpoint, not a promise that `main` still points to that exact commit after documentation-only merges.

Always verify live Hub/Stats/Cards branch HEADs before changing code.
