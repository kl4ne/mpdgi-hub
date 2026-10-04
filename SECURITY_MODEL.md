# SECURITY MODEL — MPDGI Stats Password Verification

Updated: 2026-10-04

## Scope

This document designs a compatibility-safe migration away from the legacy Stats password verifier without changing any existing credential yet.

Current production scheme:
- `password_scheme = hmac-sha256-v1`
- per-user random salt
- Cloudflare-only `AUTH_PEPPER`
- constant-time comparison
- password length 16–128
- login rate limiting

The current scheme is not treated as an active compromise. The migration is a hardening change.

## Target design

Preferred target for the current Cloudflare/Web Crypto architecture:

`pbkdf2-sha256-v1`

Target properties:
- PBKDF2-HMAC-SHA256
- minimum 600,000 iterations, subject to production benchmark
- unique random per-user salt
- existing `AUTH_PEPPER` retained as a server-side secret
- constant-time verifier comparison
- work factor encoded/versioned so it can be increased later
- no plaintext password storage
- no forced password reset for a successful legacy user

OWASP currently recommends PBKDF2-HMAC-SHA256 with 600,000 or more iterations when PBKDF2 is selected and recommends upgrading password hashes when the user next authenticates.

## Pepper construction

Do not append or concatenate the pepper directly into a public salt string.

For `pbkdf2-sha256-v1`:

1. Compute a pre-hash using HMAC-SHA256:
   `peppered_password = HMAC-SHA256(key=AUTH_PEPPER, data=password)`
2. Feed the resulting bytes as PBKDF2 key material.
3. Use the user's random password salt as PBKDF2 salt.
4. Derive 32 bytes with HMAC-SHA256 at the configured iteration count.
5. Store the derived verifier, scheme, salt and work factor metadata.

This keeps `AUTH_PEPPER` outside D1 and preserves the current defense-in-depth model.

## Storage format

No destructive D1 schema rewrite is required.

Current columns already provide:
- `password_hash`
- `password_salt`
- `password_scheme`

Recommended representation:

- `password_scheme = pbkdf2-sha256-v1`
- `password_salt = <base64url random salt>`
- `password_hash = i=600000$<base64url derived verifier>`

This avoids adding a mandatory new column solely for the work factor and allows future users to carry different work factors during upgrades.

If implementation testing shows a dedicated iteration column materially improves maintainability, add it only through an explicit migration; do not alter production schema ad hoc.

## Compatibility-safe login flow

The login endpoint must temporarily support both schemes.

Pseudo-flow:

1. Look up user.
2. Inspect `password_scheme`.
3. If `hmac-sha256-v1`:
   - verify with the existing function unchanged;
   - if verification fails, return invalid credentials;
   - if verification succeeds, compute a fresh `pbkdf2-sha256-v1` verifier from the plaintext password supplied for that successful login;
   - update only that user's `password_hash`, `password_salt`, `password_scheme`, and `updated_at`;
   - continue issuing the session normally.
4. If `pbkdf2-sha256-v1`:
   - parse and validate the work-factor metadata;
   - reject malformed metadata;
   - verify using PBKDF2;
   - if stored iterations are below the current target, transparently rehash after successful authentication.
5. Any unknown scheme:
   - return `unsupported_password_scheme`;
   - do not silently reinterpret the stored value.

## Bootstrap behavior

Once migration code exists, all newly bootstrapped users must be created directly with `pbkdf2-sha256-v1`.

Do not create new `hmac-sha256-v1` users after the migration release.

## Rollout phases

### Phase 0 — documentation only
- This document.
- No production code change.
- No credential change.
- No D1 mutation.

### Phase 1 — implementation behind dual-scheme support
- Add `LEGACY_PASSWORD_SCHEME='hmac-sha256-v1'`.
- Add `PASSWORD_SCHEME='pbkdf2-sha256-v1'`.
- Keep the legacy verifier function intact for migration compatibility.
- Add PBKDF2 helper, parser and tests.
- Do not remove legacy support.

### Phase 2 — exhaustive tests before merge
Required test cases:
- known legacy verifier succeeds with correct password
- legacy verifier fails with wrong password
- PBKDF2 verifier succeeds with correct password
- PBKDF2 verifier fails with wrong password
- malformed PBKDF2 metadata fails safely
- unsupported scheme remains 503/controlled failure
- successful legacy login upgrades exactly one user
- failed legacy login performs no upgrade
- successful modern login does not downgrade
- lower stored work factor upgrades after successful login
- Unicode password round-trip
- 16-character lower boundary
- 128-character upper boundary
- login rate limiting behavior unchanged
- existing session issuance unchanged

### Phase 3 — benchmark
Before choosing the final iteration count:
- benchmark PBKDF2 in the actual Cloudflare runtime;
- start at 600,000 iterations;
- keep normal verification comfortably below one second;
- record p50/p95 observed duration;
- never reduce below the security floor merely to make a microbenchmark faster without documenting the reason.

### Phase 4 — controlled production release
- deploy dual-scheme code;
- do not rotate `AUTH_PEPPER`;
- do not force password reset;
- log only scheme-transition counts, never password/hash/pepper values;
- perform one owner login through the normal Stats UI;
- verify login succeeds;
- verify session issuance succeeds;
- verify that owner's `password_scheme` changed to `pbkdf2-sha256-v1`;
- verify subsequent login uses the new scheme.

### Phase 5 — legacy retirement
Do not remove `hmac-sha256-v1` support immediately.

Retire it only after:
- every active admin user has migrated, or
- remaining legacy users are deliberately reset by an administrator,
- a stable checkpoint exists,
- rollback procedure is documented.

## Rollback model

A code rollback must remain possible without credential loss.

Therefore, before the first production migration:
- keep a code checkpoint that understands both schemes;
- do not deploy a rollback target that only understands the old scheme after users have migrated;
- the minimum safe rollback target is the first dual-scheme release.

Once a user is upgraded to PBKDF2, restoring code that understands only `hmac-sha256-v1` would lock that user out. This must be prevented operationally.

## D1 mutation rules

Allowed during migration:
- update the authenticated user's password verifier fields after a successful legacy login.

Not allowed:
- bulk rewriting password hashes without plaintext passwords;
- replacing all hashes with hashes-of-hashes as the final design;
- deleting admin users;
- deleting sessions merely to perform this migration;
- altering analytics tables;
- rotating `AUTH_PEPPER` as part of the migration.

## Failure handling

If PBKDF2 computation throws or metadata parsing fails:
- fail authentication safely;
- return a controlled server error for invalid server-side scheme state;
- do not create a session;
- do not partially update the user;
- do not fall back from a malformed PBKDF2 record to the legacy algorithm.

## Observability

Allowed:
- aggregate counts by password scheme
- migration success count
- migration failure count
- PBKDF2 verification timing distribution

Never log:
- plaintext password
- `AUTH_PEPPER`
- `password_hash`
- `password_salt`
- session tokens

## Acceptance criteria before coding is considered production-ready

- Dual-scheme implementation passes unit tests.
- Existing Stats browser tests remain green.
- Bootstrap creates PBKDF2 users.
- Successful legacy login transparently upgrades the user.
- Failed login never mutates password fields.
- No `AUTH_PEPPER` change.
- No D1 reset.
- Production smoke remains green.
- A rollback checkpoint that supports both schemes is recorded.
- `MASTER_STATUS.md`, `NEXT_ACTION.md`, and `CHAT_HANDOFF.md` are updated after validation.

## Decision

Proceed with a dual-scheme, login-time migration to PBKDF2-HMAC-SHA256.

Do not implement the production credential migration until the implementation branch has:
1. unit coverage,
2. benchmark evidence from the target runtime,
3. green Stats browser QA,
4. an explicit rollback checkpoint.
