# NEXT ACTION — MPDGI Digital Ecosystem

Updated: 2026-10-04

## Current checkpoint

Hub:
- main HEAD: `b123f59278bd1791c9ab02d6c92a3ead47a0f0bc`
- runtime: `1.6.0`

Stats:
- branch HEAD: `2d018cd07e0ace2d8bc9ed895d6828c88776c490`
- runtime: `1.4.7`
- verified endpoint: `https://mpdgi-stats.pages.dev`

Digital Cards:
- main HEAD: `23e6e638e442e61721f7ade6791d4ae10a8cd9dc`
- RSCard: `1.3.2`
- NPCard fallback: `1.0.3`

## Exact next action

The remaining unresolved items require infrastructure access, not more repository guessing.

When Cloudflare/DNS access is available:

1. Inspect and attach/repair `stats.mpdgi.org`.
2. Validate DNS, TLS, Stats v1.4.7 content and security headers.
3. Checkpoint.
4. Inspect and attach/repair `npcard.mpdgi.org`.
5. Validate Nancy's approved build, headers, analytics target and real-phone NFC.
6. Checkpoint.
7. Inspect how `hub.mpdgi.org` can receive:
   - `X-Content-Type-Options: nosniff`
   - clickjacking protection via `X-Frame-Options: DENY` or CSP `frame-ancestors 'none'`
8. Validate production after one infrastructure change at a time.

Do not invent CNAME targets or Cloudflare state.
