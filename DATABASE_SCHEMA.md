# DATABASE SCHEMA — MPDGI Stats

Updated: 2026-10-05

Source of truth:
- `migrations/0001_initial.sql`
- `migrations/0002_campaigns.sql`
- `migrations/0003_collector_metrics.sql`

## Administrative tables

### admin_users
Stores admin identity and password-verifier metadata:
- id
- email
- password_hash
- password_salt
- password_scheme
- role
- active
- created_at
- updated_at

No plaintext password is stored.

### admin_sessions
Stores hashed session tokens, user association and expiration.

### login_rate
Short-lived authentication rate-control state.

## Analytics tables

### visitors
Anonymous visitor identity and immutable first-acquisition metadata.

### sessions
Anonymous session identity, visitor association, entry source, session campaign, display mode and first-seen metadata.

### events
Anonymous events with event/session/visitor identifiers, source/campaign/session context, device/browser/language categories, action/target and client/server timestamps.

### collector_rate
Anonymous collector rate-control state. Raw IP addresses are not persisted.

### collector_metrics
Aggregated received/accepted/duplicate/rejected/delayed collector counters by Eastern date.

## Campaigns

### campaigns
Saved campaign metadata including slug, source, active state, creation metadata and creator.

## Schema policy

- explicit migrations are preferred;
- runtime schema checks are read-first;
- fallback DDL is used only when required objects are missing;
- D1 must not be reset as an audit shortcut;
- future destructive retention work requires explicit administrative approval.
