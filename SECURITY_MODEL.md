# SECURITY MODEL — MPDGI Stats Authentication

Updated: 2026-10-05

## Current implementation

Current Stats release: `1.4.10`

Supported password schemes:
- legacy: `hmac-sha256-v1`
- target: `pbkdf2-sha256-v1`

PBKDF2 target:
- PBKDF2-HMAC-SHA256
- 600,000 iterations
- unique random per-user salt
- existing `AUTH_PEPPER` retained outside D1
- HMAC-SHA256 pepper pre-hash
- 32-byte derived verifier
- work factor encoded in `password_hash`

Stored representation:
- `password_scheme = pbkdf2-sha256-v1`
- `password_salt = <base64url random salt>`
- `password_hash = i=600000$<base64url verifier>`

## Login behavior

1. User is looked up by normalized email.
2. Unknown/inactive users return invalid credentials.
3. Legacy verifier:
   - verify with the legacy HMAC scheme;
   - wrong password returns 401 and performs no credential write;
   - successful login may transparently create a PBKDF2 record;
   - failure of that upgrade write is deferred and does not block an otherwise valid login.
4. PBKDF2 verifier:
   - parse/validate encoded work factor;
   - reject malformed records safely;
   - verify with PBKDF2;
   - lower supported work factors may be upgraded after successful authentication.
5. Unknown scheme returns a controlled service failure.
6. A successful login creates a random session token; D1 stores only its SHA-256 hash.
7. Session cookie is HttpOnly, Secure and SameSite=Strict.

## Rate limiting

- login window: 10 minutes
- maximum attempts before blocking: 8
- rate key is derived from IP + normalized email + AUTH_PEPPER
- old rate rows are cleaned
- successful authentication clears the current rate key

Raw IP addresses are not persisted in the login-rate table.

## Integration coverage added in v1.4.9

Automated handler-level tests cover:
- correct legacy password + transparent upgrade
- correct PBKDF2 password without rewrite
- incorrect password with no session/credential mutation
- failed transparent-upgrade write while valid login still succeeds
- rate limiting
- unsupported scheme
- missing auth configuration

Browser tests cover:
- invalid credentials (401)
- rate limiting (429)
- service failure (5xx)
- connection/network failure

This prevents a network/service problem from being falsely presented as a bad password.

## Pepper rules

Never log or expose:
- plaintext password
- AUTH_PEPPER
- password_hash
- password_salt
- raw session token

AUTH_PEPPER must not be rotated as routine cleanup. A pepper rotation requires a dedicated credential-migration plan.

## Benchmark evidence and remaining runtime question

Available proxy benchmark at 600,000 iterations:
- min 90.93 ms
- p50 92.43 ms
- p95 94.05 ms
- max 94.05 ms

This benchmark was executed in CI/Node WebCrypto. It is useful implementation evidence but is **not** the same as measuring the actual Cloudflare Pages Functions/Workers runtime under the account's real CPU limits.

Before authentication performance is considered fully closed:
- inspect the actual Cloudflare plan/runtime limits;
- observe production Function behavior/timing;
- do not reduce the work factor merely to satisfy a guessed limit.

## Bootstrap

Bootstrap is disabled unless `BOOTSTRAP_ENABLED=true`.

When intentionally enabled it also requires:
- STATS_DB
- AUTH_PEPPER
- BOOTSTRAP_SECRET
- same-origin request
- zero existing admin users

New bootstrap users are created directly with the target PBKDF2 scheme.

## Rollback

Safe rollback must understand both password schemes.

Required compatibility checkpoint:
- `checkpoint/stats-v1.4.7-dual-scheme`

Do not roll back to code that understands only the old HMAC verifier after any user has migrated to PBKDF2.

## D1 mutation rules

Allowed:
- update only the successfully authenticated user's verifier fields during a compatible migration.

Not allowed as routine remediation:
- reset/delete D1
- bulk rewrite password hashes without plaintext passwords
- delete admin users
- rotate AUTH_PEPPER
- expose credential fields for troubleshooting

## Remaining security/configuration work

1. Verify PBKDF2 behavior in the actual Cloudflare runtime/plan.
2. Protect production Git branches with required checks where repository settings permit.
3. Close custom-domain and Hub response-header findings at the infrastructure layer.
