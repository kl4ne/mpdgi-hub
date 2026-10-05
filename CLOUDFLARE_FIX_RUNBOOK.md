# CLOUDFLARE FIX RUNBOOK — MPDGI Digital Ecosystem

Updated: 2026-10-05

## Purpose

This runbook covers the three remaining infrastructure-only audit blockers:

1. `stats.mpdgi.org`
2. `npcard.mpdgi.org`
3. Hub response-header hardening for `hub.mpdgi.org`

Use the permanent workflow:

**do -> validate -> checkpoint -> continue**

Do not make all three infrastructure changes at once.

---

## Phase A — Fix `stats.mpdgi.org`

### Current evidence

- Verified production fallback: `https://mpdgi-stats.pages.dev`
- GitHub Actions run `37247974058` could not resolve `stats.mpdgi.org` in public DNS.

### Safe procedure

1. Open Cloudflare Dashboard.
2. Go to **Workers & Pages**.
3. Open the Pages project that serves `mpdgi-stats.pages.dev`.
4. Open **Custom domains**.
5. Select **Set up a domain**.
6. Enter:
   `stats.mpdgi.org`
7. Let Cloudflare complete the custom-domain association before manually changing DNS.
8. If the zone is already managed by Cloudflare, confirm the expected DNS record is created/recognized automatically.
9. If Cloudflare requires a manual subdomain CNAME, point only the requested hostname to the existing Pages project hostname:
   `mpdgi-stats.pages.dev`
10. Do not remove or redirect the `pages.dev` fallback yet.

### Validation

After Cloudflare reports the domain active:

- DNS resolves publicly.
- TLS certificate is valid.
- `https://stats.mpdgi.org/js/stats-version.js` exposes the approved Stats version.
- Login shell loads.
- HSTS is present.
- `X-Content-Type-Options: nosniff` is present.
- `X-Frame-Options: DENY` is present.
- `X-Robots-Tag` includes `noindex`.
- Existing Stats CI remains green.

### Checkpoint

Only after all validation passes:
- update `MASTER_STATUS.md`
- update `CHAT_HANDOFF.md`
- mark `stats.mpdgi.org` verified active

---

## Phase B — Fix `npcard.mpdgi.org`

### Current evidence

- Verified fallback: `https://npcard.pages.dev`
- Approved NPCard runtime version currently documented: `1.0.3`
- Digital Cards run `37248236928` could not resolve `npcard.mpdgi.org` in public DNS.

### Safe procedure

1. Open Cloudflare Dashboard.
2. Go to **Workers & Pages**.
3. Open the Pages project serving `npcard.pages.dev`.
4. Open **Custom domains**.
5. Select **Set up a domain**.
6. Enter:
   `npcard.mpdgi.org`
7. Complete the custom-domain association first.
8. If Cloudflare requires a manual CNAME, point only the requested hostname to:
   `npcard.pages.dev`
9. Do not disable the Pages fallback.

### Validation

Confirm:

- DNS resolves publicly.
- TLS certificate is valid.
- The custom domain serves the exact approved Nancy card build.
- Nancy's artwork is unchanged.
- Card version matches the approved release.
- HSTS is present.
- `X-Content-Type-Options: nosniff` is present.
- clickjacking protection is present.
- analytics target remains:
  `business_card:nancy-pagan`
- browser QA remains green.
- test the card on a real phone.

### NFC rule

Do not program Nancy's NTAG215 to `npcard.mpdgi.org/?src=nfc` until the custom domain has passed all validation above.

---

## Phase C — Harden `hub.mpdgi.org` response headers

### Current evidence

Hub QA confirms:

- HSTS is present.
- `X-Content-Type-Options: nosniff` was not observed.
- response-header clickjacking protection was not observed.

The Hub is served from GitHub Pages/custom-domain infrastructure. A repository `_headers` file is not a valid GitHub Pages response-header fix.

### Required prerequisite

Cloudflare Response Header Transform Rules require the hostname to be proxied through Cloudflare.

Before creating a rule:

1. Inspect the DNS record for `hub.mpdgi.org`.
2. Confirm whether it is proxied through Cloudflare.
3. Do not change the origin target blindly.

### Preferred edge rule

If `hub.mpdgi.org` is safely proxied through Cloudflare:

1. Go to **Rules**.
2. Choose **Create rule** > **Response Header Transform Rule**.
3. Name it:
   `MPDGI Hub Security Headers`
4. Match only:
   `http.host eq "hub.mpdgi.org"`
5. Add/Set these static response headers:

   `X-Content-Type-Options: nosniff`

   `X-Frame-Options: DENY`

6. Deploy the rule.
7. Do not alter the existing HSTS header unless there is a documented reason.

### Why X-Frame-Options is used here

The current repository already has a meta CSP for content restrictions. A `frame-ancestors` directive must be delivered as an HTTP response header to be effective. Adding a full response CSP without first reconciling it with the existing meta CSP creates unnecessary regression risk.

Using `X-Frame-Options: DENY` provides a narrow, low-risk clickjacking fix without replacing the current CSP behavior.

### Validation

Confirm:

- Hub still loads normally.
- HSTS remains present.
- `X-Content-Type-Options: nosniff` is present.
- `X-Frame-Options: DENY` is present.
- Chromium functional tests pass.
- WebKit production smoke passes.
- Lighthouse thresholds remain green.
- NFC attribution still works.
- sharing/giving/directions/payment flows remain unchanged.

### Checkpoint

After validation:
- update `MASTER_STATUS.md`
- update `KNOWN_ISSUES.md`
- update `CHAT_HANDOFF.md`
- mark Hub header blocker closed

---

## Order of operations

Do not combine phases.

Recommended order:

1. Stats custom domain
2. checkpoint
3. NPCard custom domain
4. checkpoint
5. Hub response-header rule
6. checkpoint
7. final production validation
8. final audit closure

---

## Rollback rules

### Custom domains

If a custom domain fails:
- keep the corresponding `pages.dev` endpoint active
- remove only the failed custom-domain attachment/DNS record that was just added
- do not alter application code to compensate for a DNS problem

### Hub headers

If the Transform Rule causes unexpected behavior:
- disable or revert only that Transform Rule
- do not change Hub runtime files
- re-run production QA

---

## Never do during this runbook

- do not reset/delete D1
- do not rotate `AUTH_PEPPER`
- do not disable Pages fallbacks before validation
- do not reintroduce workers.dev failover
- do not change Nancy's approved artwork
- do not invent DNS targets
- do not migrate the Hub to a different host solely to add two headers
