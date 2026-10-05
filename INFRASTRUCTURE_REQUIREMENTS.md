# INFRASTRUCTURE REQUIREMENTS — MPDGI Digital Ecosystem

Updated: 2026-10-05

## 1. Hub response-header hardening

Verified public state:
- HSTS present;
- `X-Content-Type-Options: nosniff` not observed;
- response-header clickjacking protection not observed.

Required target:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` or equivalent response CSP `frame-ancestors 'none'`

The Hub is served through GitHub Pages/custom-domain infrastructure. A Cloudflare Pages-style repository `_headers` file is not a valid GitHub Pages fix.

## 2. Stats production endpoint

Canonical production endpoint:

`https://mpdgi-stats.pages.dev`

No Stats custom domain is configured or required.

Current Stats:
- v1.4.10
- dual-scheme authentication deployed;
- PBKDF2 target 600,000 iterations;
- `AUTH_PEPPER` unchanged;
- no D1 reset/deletion.

Do not create or troubleshoot `stats.mpdgi.org`.

## 3. Nancy Digital Card custom domain

Verified fallback:

`https://npcard.pages.dev`

Pending:
- attach/verify `npcard.mpdgi.org` in the intended Cloudflare Pages project;
- use the exact DNS target Cloudflare provides;
- add the DNS record in Namecheap;
- validate TLS, approved build, security headers, analytics and real-phone behavior.

Only after those checks should Nancy's NFC tag be programmed to the custom-domain URL.

## 4. Password runtime status

The account uses Workers Free.

Current Cloudflare metrics supplied by the account owner show:
- `Exceeded CPU Time Limits = 0`;
- no active/reproducible CPU-limit failure during the current verification;
- historical errors were categorized as `Script Threw Exception`, not CPU-limit exhaustion.

Do not reduce PBKDF2 iterations or rotate `AUTH_PEPPER` without new evidence.

## Exact next infrastructure action

1. configure/validate `npcard.mpdgi.org`;
2. inspect the actual serving/proxy path for `hub.mpdgi.org`;
3. add/validate the missing Hub response headers;
4. complete branch-protection administration;
5. run the final audit.
