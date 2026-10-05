# CHANGELOG — MPDGI Audit Remediation

Updated: 2026-10-05

## Hub 1.6.0

- Added reproducible lockfile/npm ci.
- Pinned GitHub Actions.
- Expanded Chromium/WebKit QA and production smoke.
- Removed dead payment assets.
- Removed unreferenced historical 1.4.7–1.5.2 runtime assets.
- Added infrastructure/continuity documentation.

## Stats 1.4.7

- Introduced compatibility-safe dual password schemes.
- Added PBKDF2-HMAC-SHA256 target verifier at 600,000 iterations.
- Added login-time legacy migration support.
- Hardened collector, RBAC, bootstrap and schema behavior.

## Stats 1.4.8

- Made password-upgrade writes non-blocking after a valid authentication.
- Distinguished service-side login failures from invalid credentials.

## Stats 1.4.9

- Added explicit network-error handling in the login UI.
- Added authentication handler integration tests.
- Added browser tests for 401, 429, 5xx and network failures.

## Stats 1.4.10

- Closed the concurrent session-to-visitor collector race with a post-insert canonical-session check.
- Added regression coverage for the canonical-session invariant.

## Digital Cards

- Made ZIP import PR-gated.
- Removed post-merge build-stamp mutations.
- Added secret scanning, lockfile/npm ci and pinned Actions.
- Added Chromium/WebKit browser QA and production smoke.
- Hardened generator escaping/fallback-host support.
- Enforced a consistent 60-second update-check policy.
- Ensured lockfile changes trigger PR validation.


## Authentication test hardening after Stats 1.4.10

- Real local Pages + D1 authentication E2E added using Wrangler 4.147.0.
- Covered PBKDF2 login, legacy login, session lookup, invalid password and rate limiting against an actual local D1 binding.
- Added 16/128-character password boundary and Unicode authentication coverage.
- Added validation-run concurrency so superseded Stats PR validations are cancelled.


## Governance / branch lifecycle

- Preserved explicit current rollback checkpoints for Hub, Stats and Digital Cards.
- Cleaned Hub branches from 64 to 5 deliberate branches.
- Cleaned Digital Cards branches from 14 to 2 deliberate branches.
- Added tested automatic cleanup of merged PR head branches in both repositories.
- Production branches and rollback checkpoints are excluded from automatic deletion.
