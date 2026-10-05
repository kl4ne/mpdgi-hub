# NEXT ACTION — MPDGI Digital Ecosystem

Updated: 2026-10-05

## Current validated code state

- Hub: v1.6.0 — main `739d7523e50f3ad9923143c8c922cd495856fd25`
- Stats: v1.4.10 — `a1a7cd62b6fe1baaa5689cd67cb54ef7cbf44d4c`
- Digital Cards main: `4fc5ef7e07c6f5ab8e4da63015f1a0519e9aaa87`
- RSCard: v1.3.2
- NPCard: v1.0.3

Known repository-code findings from the re-audit have been repaired and validated, including real local Pages + D1 authentication E2E.

## Exact next phases

1. **Cloudflare auth-runtime verification**
   - inspect the actual Pages/Workers plan and Functions CPU/runtime evidence;
   - confirm PBKDF2 600,000 is sustainable in the real production runtime;
   - do not change AUTH_PEPPER or credential records merely to test this.

2. **Stats custom domain**
   - attach/fix `stats.mpdgi.org`;
   - validate public DNS, TLS, v1.4.10 content, login and security headers;
   - checkpoint.

3. **Nancy custom domain**
   - attach/fix `npcard.mpdgi.org`;
   - validate approved NPCard build, TLS, headers, analytics and a real phone;
   - checkpoint.

4. **Hub response headers**
   - add nosniff + clickjacking protection at the actual proxy/hosting layer;
   - re-run Hub production QA;
   - checkpoint.

5. **GitHub governance**
   - require PR/green CI for production branches where the account/repository plan permits;
   - preserve required rollback branches;
   - remove obsolete merged audit/docs/hotfix branches.

6. **Final audit**
   - repeat the audit from zero assumptions;
   - close only after no known critical/high/medium defects or unresolved accessible configuration findings remain.

Use `CLOUDFLARE_FIX_RUNBOOK.md` for infrastructure changes.

Do not reset D1, rotate AUTH_PEPPER, alter card artwork, or remove verified Pages fallbacks during these phases.
