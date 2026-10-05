# ADMIN DATA NEEDED — MPDGI Final Remediation

Updated: 2026-10-05

## Closed: Stats runtime/plan data

Confirmed:
- Workers plan: Free;
- Stats production: `https://mpdgi-stats.pages.dev`;
- Cloudflare Metrics showed `Exceeded CPU Time Limits = 0`;
- no Stats custom domain is used.

No change to PBKDF2 600,000 or `AUTH_PEPPER` is required from the current evidence.

## NPCard custom domain — closed

Confirmed:
- Namecheap CNAME: `npcard` -> `npcard.pages.dev`;
- `https://npcard.mpdgi.org` works for the user;
- real-phone validation of the approved Nancy card completed successfully.

Still pending:
- propagation is now confirmed complete by the user; no further activation data is required.

Action: none. Preserve the working DNS record unless a future concrete failure is observed.

## Closed by decision: Hub hosting

Confirmed:
- current production hosting architecture is stable and reviewed;
- required Hub validation and browser QA are enforced;
- no hosting migration or further administrative action is pending.

## Closed to strongest available level: GitHub governance

Confirmed:
- `Protect Hub Main` active: PR + `validate` + `browser-qa`;
- `Protect Stats Production` active: PR + `validate`;
- Digital Cards is private on GitHub Free, where repository rulesets are unavailable;
- Digital Cards will remain private rather than being made public solely for rulesets.

No additional administrative data is currently required for these three findings.
