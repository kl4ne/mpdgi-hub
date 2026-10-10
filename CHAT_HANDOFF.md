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
- Hub hosting architecture reviewed and intentionally stable
- production security baseline validated
- active ruleset `Protect Hub Main`: PR + `validate` + `browser-qa`
- one Hub QA attempt reported Lighthouse Performance 0.63 while 30 Chromium tests passed; workflow run `37267748275`, attempt 2 then completed SUCCESS without code or threshold changes, so the result is treated as transient unless it recurs

### Stats
- repo: `kl4ne/mpdgi-hub`
- branch: `mpdgi-stats-v1.0`
- current branch HEAD after the Stats custom-domain documentation correction: `aade3b343689b65da3de08e62d2fb02df47efc4d`
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
- HEAD: `95e2c806eedcffac49081a695c33a1410bcd9e98`
- RSCard v1.3.2 verified
- NPCard Pages v1.0.3 verified
- current Cards validation `37263172778`: SUCCESS
- lockfile PR trigger and 60-second policy consistency repaired
- Namecheap CNAME `npcard` -> `npcard.pages.dev`
- user confirmed `npcard.mpdgi.org` works and completed real-phone functional validation
- Digital Cards stays private on GitHub Free; repository rulesets are unavailable on this plan

## Re-audit repairs completed

- Stats v1.4.9 auth diagnostics + integration coverage
- Stats v1.4.10 canonical session/visitor race protection
- Digital Cards lockfile-trigger + 60-second metadata policy alignment
- historical/dead Hub runtime cleanup
- branch lifecycle cleanup closed: Hub 64→5 branches; Digital Cards 14→2 branches
- automatic merged-branch cleanup installed in both repositories; Hub-repo cleanup covers PRs to both `main` and `mpdgi-stats-v1.0`
- prior Stats/Cards/Hub audit remediations remain intact

## Remaining finding

1. 🟢 `npcard.mpdgi.org` propagation is complete and the custom domain is confirmed active/functioning by the user. Do not change the working CNAME without a new concrete reason.

Final zero-assumption audit is complete: 0 critical/high unresolved defects. See `FINAL_AUDIT_2026-10-05.md`.

Closed/accepted:
- PBKDF2 runtime concern closed with Workers Free + `Exceeded CPU Time Limits = 0`.
- NPCard custom domain is working and phone-tested.
- Hub hosting architecture is intentionally stable; no hosting migration is pending.
- Hub and Stats production branches have active required-check rulesets.
- Digital Cards ruleset limitation is accepted under private GitHub Free.

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

PR #52 captured Hub v1.6.0 runtime checkpoint `739d7523e50f3ad9923143c8c922cd495856fd25`. Later docs/governance merges may advance `main`; always query the live branch HEAD before making changes. Stats remains v1.4.10 at `aade3b343689b65da3de08e62d2fb02df47efc4d`.


## HEAD handling rule

The SHA in this handoff identifies the last validated runtime checkpoint, not a promise that `main` still points to that exact commit after documentation-only merges.

Always verify live Hub/Stats/Cards branch HEADs before changing code.


## Hub v1.6.1 checkpoint — 2026-10-10

- Repository `kl4ne/mpdgi-hub`; patch branch `fix/hub-v1.6.1-post-audit` targeting `main`.
- Base pre-patch main SHA `9c49994aec423307eae4cb4bff72c22f118b3082`, Hub production v1.6.0 before patch.
- Patch: social OpenGraph/Twitter PNG 1200×630 rendered from existing SVG, maskable 512 PNG with safe padding, app/manifest/service worker references and 1.6.1 version aligned, validator/browser QA extended, original v1.6.0 pinned assets retired.
- Duplicated canonical/release-pinned app/CSS/version files are **intentional** and validated by CI; do not delete unversioned variants.
- Owner explicitly rejected privacy changes. Keep existing cookies/analytics/Stats behavior and privacy UI unchanged. No user reapproval needed for this prohibition.
- No DNS/Namecheap/Cloudflare/Pages hosting migration authorized; nosniff + clickjacking headers remain unresolved GitHub Pages hosting limitations.
- Next: PR -> checks -> merge -> live verification -> final checkpoint. Do not restart, use do -> validate -> checkpoint -> continue.
