# CLOUDFLARE FIX RUNBOOK — MPDGI Digital Ecosystem

Updated: 2026-10-05

## Purpose

This runbook covers the remaining infrastructure items that actually exist:

1. `npcard.mpdgi.org`
2. Hub response-header hardening for `hub.mpdgi.org`

MPDGI Stats does **not** use a custom domain. Its canonical production endpoint is:

`https://mpdgi-stats.pages.dev`

Do not create or troubleshoot `stats.mpdgi.org`.

Use the permanent workflow:

**do -> validate -> checkpoint -> continue**

---

## Phase A — Fix `npcard.mpdgi.org`

### Current evidence

- Verified fallback: `https://npcard.pages.dev`
- Approved NPCard runtime version currently documented: `1.0.3`
- `npcard.mpdgi.org` does not currently resolve publicly.
- DNS for `mpdgi.org` is managed in Namecheap.

### Safe procedure

1. Open Cloudflare Dashboard.
2. Go to **Workers & Pages**.
3. Open the Pages project serving `npcard.pages.dev`.
4. Open **Custom domains**.
5. Select **Set up a domain**.
6. Enter `npcard.mpdgi.org`.
7. Complete the custom-domain association first.
8. Use the exact DNS target Cloudflare provides.
9. Add only the required DNS record in Namecheap.
10. Do not disable `npcard.pages.dev`.

### Validation

Confirm:
- public DNS resolves;
- TLS certificate is valid;
- the custom domain serves the exact approved Nancy card build;
- Nancy's artwork is unchanged;
- card version matches the approved release;
- HSTS is present;
- `X-Content-Type-Options: nosniff` is present;
- clickjacking protection is present;
- analytics target remains `business_card:nancy-pagan`;
- browser QA remains green;
- the card is tested on a real phone.

### NFC rule

Do not program Nancy's NFC tag to `npcard.mpdgi.org/?src=nfc` until the custom domain passes all validation above.

---

## Phase B — Harden `hub.mpdgi.org` response headers

### Current evidence

Hub QA confirms:
- HSTS is present;
- `X-Content-Type-Options: nosniff` was not observed;
- response-header clickjacking protection was not observed.

The Hub is served from GitHub Pages/custom-domain infrastructure.

### Required prerequisite

1. Inspect the Namecheap DNS record for `hub.mpdgi.org`.
2. Confirm whether traffic is direct to GitHub Pages or passes through a proxy capable of modifying response headers.
3. Do not change the origin target blindly.

### Target response headers

`X-Content-Type-Options: nosniff`

and either:

`X-Frame-Options: DENY`

or an equivalent response CSP with `frame-ancestors 'none'`.

### Validation

Confirm:
- Hub still loads normally;
- HSTS remains present;
- nosniff is present;
- clickjacking protection is present;
- Chromium functional tests pass;
- WebKit production smoke passes;
- Lighthouse thresholds remain green;
- NFC attribution and existing Hub flows remain unchanged.

---

## Order of operations

1. NPCard custom domain
2. checkpoint
3. Hub response-header fix
4. checkpoint
5. final production validation
6. final audit closure

## Never do during this runbook

- do not reset/delete D1;
- do not rotate `AUTH_PEPPER`;
- do not create a Stats custom domain that the project does not use;
- do not disable Pages fallbacks before validation;
- do not reintroduce workers.dev failover;
- do not change Nancy's approved artwork;
- do not invent DNS targets.
