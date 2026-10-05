# ADMIN DATA NEEDED — MPDGI Final Remediation

Updated: 2026-10-05

## Closed: Stats runtime/plan data

Confirmed:
- Workers plan: Free;
- Stats production: `https://mpdgi-stats.pages.dev`;
- Cloudflare Metrics showed `Exceeded CPU Time Limits = 0`;
- no Stats custom domain is used.

No change to PBKDF2 600,000 or `AUTH_PEPPER` is required from the current evidence.

## 1. Nancy custom domain

For the Cloudflare Pages project serving `https://npcard.pages.dev`, still need:
- custom-domain status for `npcard.mpdgi.org`;
- exact DNS record Cloudflare requests;
- certificate/TLS status;
- current production deployment branch/root.

DNS for `mpdgi.org` is managed in Namecheap.

After activation:
- test the approved NPCard build on a real phone;
- verify analytics target `business_card:nancy-pagan`;
- only then program Nancy's NFC tag to the custom-domain URL.

## 2. Hub hosting/proxy status

Need:
- current Namecheap DNS record for `hub.mpdgi.org`;
- whether traffic goes directly to GitHub Pages or through a proxy capable of injecting response headers;
- availability of a response-header rule at the actual serving layer.

Target headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` or equivalent response CSP protection.

## 3. GitHub repository administration

Need:
- enable branch protection / required checks for Hub `main` and Stats `mpdgi-stats-v1.0` where the plan permits;
- decide the strongest available protection for private Digital Cards without making it public merely for rulesets.

Observed:
- Hub `main`: `protected=false`
- Stats `mpdgi-stats-v1.0`: `protected=false`
- Digital Cards `main`: `protected=false`
