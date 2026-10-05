# INFRASTRUCTURE EVIDENCE — MPDGI Digital Ecosystem

Updated: 2026-10-05

## Purpose

Record repository-visible evidence and the confirmed production architecture.

## Hub

Repository: `kl4ne/mpdgi-hub`  
Branch: `main`

Observed:
- root `CNAME` exists;
- value: `hub.mpdgi.org`.

Interpretation:
- Hub custom hostname is configured and production hosting is validated;
- no hosting migration is pending.

## Stats

Repository: `kl4ne/mpdgi-hub`  
Branch: `mpdgi-stats-v1.0`

Confirmed architecture:
- canonical production endpoint: `https://mpdgi-stats.pages.dev`;
- no Stats custom domain is configured or required;
- no root `CNAME` is expected for Stats.

The earlier `stats.mpdgi.org` DNS finding was based on an incorrect audit assumption and is not a real project defect.

## Digital Cards

Repository: `kl4ne/mpdgi-digital-cards`  
Branch: `main`

Observed:
- verified NPCard fallback: `https://npcard.pages.dev`;
- intended Nancy custom domain: `npcard.mpdgi.org`;
- DNS for `mpdgi.org` is managed in Namecheap.

Interpretation:
- NPCard custom-domain configuration belongs in Cloudflare Pages + Namecheap DNS;
- do not create ad-hoc per-card GitHub Pages CNAME files.

## Operational conclusion

- Hub custom hostname: configured and validated.
- Stats custom hostname: none; `mpdgi-stats.pages.dev` is canonical.
- NPCard custom hostname: real pending infrastructure configuration.
- Hub hosting/security review: complete; no unresolved critical/high/medium hosting issue.
