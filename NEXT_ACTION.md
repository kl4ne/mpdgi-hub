# NEXT ACTION — MPDGI Digital Ecosystem

Updated: 2026-10-05

## Current validated code state

- Hub: v1.6.0 — runtime checkpoint `739d7523e50f3ad9923143c8c922cd495856fd25` (verify live `main` HEAD before mutations)
- Stats: v1.4.10 — `a1a7cd62b6fe1baaa5689cd67cb54ef7cbf44d4c`
- Digital Cards main: `4fc5ef7e07c6f5ab8e4da63015f1a0519e9aaa87`
- RSCard: v1.3.2
- NPCard: v1.0.3

Known repository-code findings from the re-audit have been repaired and validated, including real local Pages + D1 authentication E2E.

## Exact next phases

1. **Confirm Hub QA**
   - review the re-run of the latest `browser-qa` job;
   - if Lighthouse Performance again falls below 0.80, investigate the reproducible cause before changing thresholds or runtime code;
   - if it returns green, record the prior 0.63 result as transient CI variance.

2. **Finish governance/cleanup checkpoint**
   - merge the workflow update that makes merged-branch cleanup listen to both `main` and `mpdgi-stats-v1.0`;
   - verify the stale merged Stats PR branch is removed;
   - preserve production and rollback checkpoint branches.

3. **Final audit**
   - repeat the audit from zero assumptions;
   - classify accepted hosting/plan limitations separately from defects;
   - close only after no known critical/high/medium defects remain.

Use `CLOUDFLARE_FIX_RUNBOOK.md` for infrastructure changes.

Do not reset D1, rotate AUTH_PEPPER, alter card artwork, or remove verified Pages fallbacks during these phases.
