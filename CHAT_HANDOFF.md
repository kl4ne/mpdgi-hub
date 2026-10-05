# CHAT HANDOFF — MPDGI Digital Ecosystem

Updated: 2026-10-04

## Permanent rule

**do -> validate -> checkpoint -> continue**

Never restart because of timeout.

## Current state

### Hub
- repo: `kl4ne/mpdgi-hub`
- branch: `main`
- HEAD: `87aa4d8c4eb191ccf4dca695244420cb4e499d79`
- version: `1.6.0`
- historical runtime cleanup complete
- HSTS present
- nosniff/clickjacking response headers still require infrastructure-layer remediation

### Stats
- repo: `kl4ne/mpdgi-hub`
- branch: `mpdgi-stats-v1.0`
- HEAD: `2d018cd07e0ace2d8bc9ed895d6828c88776c490`
- version: `1.4.7`
- Pages endpoint verified
- dual-scheme auth deployed
- PBKDF2 target: 600,000 iterations
- benchmark proxy p50 92.43 ms / p95 94.05 ms
- AUTH_PEPPER unchanged
- no forced owner migration
- `stats.mpdgi.org` failed public DNS resolution in Stats run `37247974058` (`curl: (6) Could not resolve host`)

### Digital Cards
- repo: `kl4ne/mpdgi-digital-cards`
- branch: `main`
- HEAD: `23e6e638e442e61721f7ade6791d4ae10a8cd9dc`
- RSCard 1.3.2 verified
- NPCard Pages fallback 1.0.3 verified
- `npcard.mpdgi.org` failed public DNS resolution in Digital Cards run `37248236928` (`curl: (6) Could not resolve host`)
- Nancy custom-domain diagnostics merged in PR #10

## Completed remediation

- audit findings addressed in repository code where safely possible
- Stats source-of-truth/CI mismatch fixed
- Cards import workflow hardened
- secret scanning expanded
- lockfiles/npm ci added
- Actions pinned
- browser QA expanded
- collector integrity hardened
- RBAC/bootstrap/schema hardening completed
- PBKDF2 dual-scheme migration support completed
- Hub dead assets/historical runtime cleanup completed
- custom-domain diagnostics completed

## Remaining blockers

These are infrastructure-only until Cloudflare/DNS access exists:

1. `stats.mpdgi.org`
2. `npcard.mpdgi.org`
3. Hub response-header hardening

## Do not redo

- do not restart the audit
- do not repeat completed remediation
- do not reset D1
- do not rotate AUTH_PEPPER
- do not redesign Hub for card-specific issues
- do not invent DNS records
- do not replace Nancy artwork
