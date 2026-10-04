# NEXT ACTION — MPDGI Digital Ecosystem

Updated: 2026-10-04

## Last validated checkpoint

- Stats stable: v1.4.6 / `c492355da3849e656e722a90927f7ade92814c16`.
- Password-verifier migration design is documented in `SECURITY_MODEL.md`.
- No credential, `AUTH_PEPPER`, or D1 data has been changed by the design phase.

## Exact next phase

Implement dual-scheme password verification on a small Stats branch.

Scope for that phase only:
1. Keep legacy `hmac-sha256-v1` verification intact.
2. Add `pbkdf2-sha256-v1` helper/parser.
3. Add unit tests for correct/wrong password, malformed metadata, Unicode and password bounds.
4. Add login-time upgrade logic only after successful legacy authentication.
5. Make bootstrap create the new scheme.
6. Do not merge until Stats unit/browser QA is green.
7. Do not perform a production owner login/migration yet.
8. Checkpoint before benchmarking/rollout.

## Later phases

- Benchmark PBKDF2 on the target runtime.
- Controlled owner migration only after a dual-scheme rollback checkpoint exists.
- Verify `stats.mpdgi.org` and `npcard.mpdgi.org` at Cloudflare/DNS.
- Review Hub hosting-layer response headers.
- Review historical Hub pinned runtime files only after PWA safety proof.

## Never redo

Do not restart the audit or repeat already merged remediation work.
