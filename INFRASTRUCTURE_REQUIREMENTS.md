# INFRASTRUCTURE REQUIREMENTS — MPDGI Digital Ecosystem

Updated: 2026-10-05

## 1. Hub hosting decision

Verified:
- Namecheap `hub` CNAME points to `kl4ne.github.io`;
- Hub is served directly by GitHub Pages;
- HSTS is present;
- `X-Content-Type-Options: nosniff` is not observed;
- response-level clickjacking protection is not observed.

Decision:
- keep Hub on GitHub Pages;
- do not migrate solely for these two headers;
- accept the missing response headers as low residual hosting-layer risk;
- retain existing CSP-in-page, HTTPS/HSTS, CI, QA and branch-protection controls.

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

Verified:
- fallback: `https://npcard.pages.dev`;
- Namecheap `npcard` CNAME points to `npcard.pages.dev`;
- `https://npcard.mpdgi.org` works for the user;
- approved Nancy card completed real-phone functional validation, including `?src=nfc`.

Keep the Pages fallback active as rollback.

## 4. Password runtime status

The account uses Workers Free.

Current Cloudflare metrics supplied by the account owner show:
- `Exceeded CPU Time Limits = 0`;
- no active/reproducible CPU-limit failure during the current verification;
- historical errors were categorized as `Script Threw Exception`, not CPU-limit exhaustion.

Do not reduce PBKDF2 iterations or rotate `AUTH_PEPPER` without new evidence.

## Exact next infrastructure action

No further DNS/hosting migration is required by the current decisions.

Next:
1. confirm the Hub QA/Lighthouse re-run;
2. validate Stats merged-branch cleanup coverage;
3. run the final zero-assumption audit.
