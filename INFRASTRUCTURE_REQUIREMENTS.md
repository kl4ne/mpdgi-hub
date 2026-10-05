# INFRASTRUCTURE REQUIREMENTS — MPDGI Digital Ecosystem

Updated: 2026-10-04

## Purpose

This file records the remaining audit items that cannot be honestly completed from repository code alone.

The evidence below comes from the project's validated GitHub Actions production probes. It must not be replaced with assumptions about Cloudflare/DNS state.

## 1. Hub response-header hardening

### Verified public state

GitHub Actions QA observed on `https://hub.mpdgi.org`:

- HSTS: present
- `X-Content-Type-Options: nosniff`: not observed
- response-header clickjacking protection: not observed
  - no `X-Frame-Options`
  - no response CSP containing `frame-ancestors`

Latest confirming QA evidence:
- run `37246903612`
- header probe produced warnings for missing nosniff and clickjacking response headers

### Important limitation

The Hub is served through GitHub Pages/custom-domain infrastructure.

A Cloudflare Pages-style repository `_headers` file is not a valid fix for GitHub Pages and must not be added merely to silence the audit.

A meta CSP cannot provide an effective `frame-ancestors` directive. Clickjacking protection must be delivered as an HTTP response header.

### Required target state

At the actual HTTP serving/proxy layer, ensure:

```
X-Content-Type-Options: nosniff
```

and one of:

```
X-Frame-Options: DENY
```

or:

```
Content-Security-Policy: ...; frame-ancestors 'none'; ...
```

Do not weaken the current HTTPS/HSTS behavior.

### Valid implementation options

Choose only after inspecting actual hosting/DNS configuration:

1. **Cloudflare reverse-proxy / Transform Rule**
   - Keep GitHub Pages as origin.
   - Proxy `hub.mpdgi.org` through Cloudflare.
   - Add the missing security headers at the edge.
   - Re-run Hub QA against production.

2. **Cloudflare Worker at the edge**
   - Keep current origin.
   - Worker forwards the response and injects the required headers.
   - Use only if a Transform Rule is unavailable or insufficient.
   - Do not reintroduce the previously postponed workers.dev failover architecture; this would be an edge-header role for the existing custom domain only.

3. **Move Hub hosting to Cloudflare Pages**
   - Only consider as a deliberate hosting migration.
   - Requires full regression/rollback plan.
   - Not justified solely to add two headers if a proxy/header rule can solve the problem safely.

### Acceptance proof

After configuration:
- `curl -I https://hub.mpdgi.org/` shows HSTS
- `X-Content-Type-Options: nosniff` is present
- clickjacking protection is present as response header
- Hub Validate remains green
- Hub QA remains green
- Chromium functional tests remain green
- WebKit production smoke remains green
- Lighthouse thresholds remain green

## 2. Stats custom domain

### Verified state

`https://stats.mpdgi.org` is currently missing public DNS resolution from the GitHub Actions network.

Diagnostic run `37247974058` produced no address from `getent ahosts stats.mpdgi.org` and `curl` reported:

```
Could not resolve host: stats.mpdgi.org
```

This narrows the blocker to DNS/custom-domain attachment before HTTP application behavior can be tested.

Verified production remains:

```
https://mpdgi-stats.pages.dev
```

### Code readiness

Stats already supports its verified Pages production endpoint.

The current blocker is not a repository-code defect. It is custom-domain/DNS/project configuration until proven otherwise.

### Required Cloudflare/DNS inspection

When administrative access is available, verify:

- the intended Cloudflare Pages project for MPDGI Stats
- whether `stats.mpdgi.org` is attached as a custom domain to that project
- DNS record generated/required by Cloudflare
- certificate status
- proxy/SSL mode
- whether the hostname resolves publicly
- whether the deployed branch is `mpdgi-stats-v1.0`
- whether the deployed build output remains `public/`

### Acceptance proof

`https://stats.mpdgi.org/js/stats-version.js` must expose:

```
MPDGI_STATS_VERSION='1.4.7'
```

Then verify the same Stats security headers already proven on the Pages endpoint.

Do not retire `mpdgi-stats.pages.dev` until the custom domain has passed production smoke.

## 3. Nancy Digital Card custom domain

### Verified state

`https://npcard.mpdgi.org` is currently missing public DNS resolution from the GitHub Actions network.

Diagnostic run `37248236928` produced no address from `getent ahosts npcard.mpdgi.org` and `curl` reported:

```
Could not resolve host: npcard.mpdgi.org
```

Verified fallback remains:

```
https://npcard.pages.dev
```

at NPCard v1.0.3.

### Code readiness

The Nancy card runtime already recognizes both:

- `npcard.mpdgi.org`
- `npcard.pages.dev`

The Stats collector allowlist also recognizes both origins.

Therefore the current blocker is custom-domain/DNS/deployment configuration, not a missing hostname in application code.

### Required Cloudflare/DNS inspection

When administrative access is available, verify:

- the Cloudflare Pages project serving NPCard
- `npcard.mpdgi.org` custom-domain attachment
- DNS record and proxy status
- certificate status
- deployment branch/build directory
- that the custom hostname serves the exact same approved Nancy card build as the Pages fallback

### Acceptance proof

The custom domain must:

- load NPCard v1.0.3 or the later approved release
- preserve Nancy's approved artwork
- expose HSTS, nosniff and clickjacking protection
- pass card browser QA
- send analytics with target `business_card:nancy-pagan`
- be tested on a real phone using the intended NFC URL

Only after those checks should Nancy's NTAG215 be programmed to the custom-domain NFC URL.

## 4. Password migration infrastructure status

No infrastructure change is required now.

Current validated Stats v1.4.7:
- supports legacy and PBKDF2 password records
- uses 600,000 PBKDF2 iterations for new/rehash records
- keeps `AUTH_PEPPER` unchanged
- has a rollback checkpoint at `checkpoint/stats-v1.4.7-dual-scheme`

CI WebCrypto benchmark:
- min 90.93 ms
- p50 92.43 ms
- p95 94.05 ms
- max 94.05 ms

These timings are proxy evidence only and must not be mislabeled as Cloudflare production timing.

Do not force an owner login solely to trigger migration. Let a normal successful login perform the transparent upgrade.

## 5. Infrastructure work that is explicitly NOT authorized by this document

This document does not authorize:

- DNS deletion
- changing nameservers
- changing `AUTH_PEPPER`
- deleting/resetting D1
- moving the Hub to a different host without a migration plan
- introducing a workers.dev failover/gateway
- replacing Nancy's approved card art
- disabling the Pages fallbacks before custom-domain verification

## Exact next infrastructure action

When Cloudflare/DNS administrative access is available:

1. attach/verify `stats.mpdgi.org` on the intended Cloudflare Pages project and allow Cloudflare to create/require the correct DNS record;
2. attach/verify `npcard.mpdgi.org` on the intended card Pages project and allow Cloudflare to create/require the correct DNS record;
3. inspect whether `hub.mpdgi.org` is proxied through a layer capable of injecting response headers;
4. make one infrastructure change at a time;
5. validate public behavior;
6. checkpoint;
7. continue.
