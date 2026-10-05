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

## Phase B — Hub hosting

Hub hosting/security review is complete. No migration or additional hosting-layer remediation is pending.

## Order of operations

1. NPCard custom domain
2. checkpoint
3. final production validation
4. final audit closure

## Never do during this runbook

- do not reset/delete D1;
- do not rotate `AUTH_PEPPER`;
- do not create a Stats custom domain that the project does not use;
- do not disable Pages fallbacks before validation;
- do not reintroduce workers.dev failover;
- do not change Nancy's approved artwork;
- do not invent DNS targets.
