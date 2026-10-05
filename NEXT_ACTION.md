# NEXT ACTION — MPDGI Digital Ecosystem

Updated: 2026-10-04

## Last validated checkpoints

### Hub
- Stable HEAD: `7663c175b6532934924017d17eac84b153421f7f`
- Version: `1.6.0`
- Historical runtime cleanup PR #33: merged after Validate + QA success
- v1.4.7–v1.5.2 unreferenced runtime assets removed
- Current v1.6.0 PWA/runtime remains intact

### Stats
- Latest validated HEAD: `6213978d83d57eb236422c9e10290ae61e15cd99`
- Version: `1.4.7`
- PBKDF2 benchmark: 600,000 iterations; p50 92.43 ms, p95 94.05 ms in CI WebCrypto proxy
- Dual-scheme authentication remains deployed
- No forced owner migration
- `AUTH_PEPPER` unchanged

## Remaining blockers / next exact phase

1. Hub security-response headers remain incomplete at the hosting layer:
   - HSTS present
   - X-Content-Type-Options: nosniff not observed
   - response-header clickjacking protection not observed
2. Because GitHub Pages does not consume Cloudflare Pages-style `_headers`, do not add a fake repository fix.
3. `stats.mpdgi.org` and `npcard.mpdgi.org` remain unresolved until Cloudflare/DNS admin configuration can be inspected.
4. Next safe phase: document the infrastructure changes required for these blockers and stop short of inventing DNS/Cloudflare state.
