# ADMIN DATA NEEDED — MPDGI Final Remediation

Updated: 2026-10-05

## Closed: Stats runtime/plan data

Confirmed:
- Workers plan: Free;
- Stats production: `https://mpdgi-stats.pages.dev`;
- Cloudflare Metrics showed `Exceeded CPU Time Limits = 0`;
- no Stats custom domain is used.

No change to PBKDF2 600,000 or `AUTH_PEPPER` is required from the current evidence.

## NPCard custom domain — functional, propagation pending externally

Confirmed:
- Namecheap CNAME: `npcard` -> `npcard.pages.dev`;
- `https://npcard.mpdgi.org` works for the user;
- real-phone validation of the approved Nancy card completed successfully.

Still pending:
- audit-environment DNS resolution / Cloudflare Active propagation state.

Action: wait; do not change the working DNS record unless propagation fails persistently after the normal waiting period.

## Closed by decision: Hub hosting/proxy

Confirmed:
- Namecheap CNAME: `hub` -> `kl4ne.github.io`;
- Hub is served directly by GitHub Pages;
- the Hub will remain on GitHub Pages;
- missing `nosniff` and response-level anti-clickjacking headers are accepted as low residual hosting risk.

## Closed to strongest available level: GitHub governance

Confirmed:
- `Protect Hub Main` active: PR + `validate` + `browser-qa`;
- `Protect Stats Production` active: PR + `validate`;
- Digital Cards is private on GitHub Free, where repository rulesets are unavailable;
- Digital Cards will remain private rather than being made public solely for rulesets.

No additional administrative data is currently required for these three findings.
