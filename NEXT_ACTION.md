# NEXT ACTION — MPDGI Digital Ecosystem

Updated: 2026-10-04

## Last validated checkpoint

- Stats stable branch: `mpdgi-stats-v1.0`
- Stable HEAD: `5684a15a24837bcf70846cbc4e1a9425019ae1f3`
- Stats version: `1.4.6`
- Validation run: `37243600952`
- Result: SUCCESS
- Production smoke: SUCCESS
- PBKDF2 helper/parser support is present and tested.
- Production login still uses legacy `hmac-sha256-v1`.
- No production credential has been migrated.
- `AUTH_PEPPER` is unchanged.

## Exact next phase

Wire dual-scheme password authentication on a small Stats branch.

Scope only:
1. Accept both legacy and PBKDF2 password schemes.
2. On successful legacy authentication, rehash only that user's submitted password into PBKDF2.
3. Failed authentication must not update password fields.
4. Modern PBKDF2 authentication must not downgrade.
5. Bootstrap must create PBKDF2 users.
6. Add focused tests for migration behavior and malformed modern metadata.
7. Do not perform a real production owner login yet.
8. Validate and checkpoint before benchmark/rollout.

## Later

- Benchmark PBKDF2 in target runtime.
- Controlled production owner migration after rollback checkpoint exists.
- Verify `stats.mpdgi.org` and `npcard.mpdgi.org`.
- Review Hub hosting-layer response headers.
- Review historical Hub runtime files only after PWA safety proof.
