# ADMIN DATA NEEDED — MPDGI Final Remediation

Updated: 2026-10-05

This file exists so the project does not forget which administrative facts still need to be collected.

## 1. Cloudflare plan/runtime for Stats

Need to determine:
- Cloudflare account plan relevant to Pages Functions / Workers used by MPDGI Stats;
- effective CPU-time limit for the production Functions runtime;
- available Functions/Workers metrics or logs for login requests;
- whether production auth requests show CPU-limit exceptions or Worker error 1102;
- actual observed production CPU duration around PBKDF2 authentication if Cloudflare exposes it.

Do not change PBKDF2 iterations or AUTH_PEPPER until this evidence is collected.

## 2. Stats custom domain

In the Cloudflare Pages project serving:
- https://mpdgi-stats.pages.dev

Need:
- custom-domain status for stats.mpdgi.org;
- exact DNS record Cloudflare requests;
- certificate/TLS status;
- deployed production branch confirmation: mpdgi-stats-v1.0;
- build output confirmation: public/.

DNS for mpdgi.org has historically been managed outside Cloudflare DNS; verify the current authoritative DNS provider before changing any record.

## 3. Nancy custom domain

In the Cloudflare Pages project serving:
- https://npcard.pages.dev

Need:
- custom-domain status for npcard.mpdgi.org;
- exact requested DNS record;
- certificate/TLS status;
- current production deployment branch/root.

After activation:
- test the approved NPCard build on a real phone;
- verify analytics target business_card:nancy-pagan;
- only then program Nancy's NFC tag to the custom-domain URL.

## 4. Hub hosting/proxy status

Need:
- current authoritative DNS record for hub.mpdgi.org;
- whether traffic is proxied through Cloudflare or goes directly to GitHub Pages;
- if Cloudflare proxy is available, whether Response Header Transform Rules are available on the account plan.

Target headers:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY (or equivalent response CSP frame-ancestors protection)

Do not migrate the Hub to another host solely for these headers without a separate migration decision.

## 5. GitHub repository administration

Need:
- whether branch protection can be enabled for kl4ne/mpdgi-hub under the current GitHub plan;
- whether required status checks can be enforced on main and mpdgi-stats-v1.0;
- for private kl4ne/mpdgi-digital-cards, whether upgrading to GitHub Pro is acceptable if stronger rulesets are desired.

Observed now:
- Hub main: protected=false
- Stats mpdgi-stats-v1.0: protected=false
- Digital Cards main: protected=false
- advanced rulesets query for the private Cards repo reports that GitHub Pro or public visibility is required.

Do not make the Digital Cards repository public merely to obtain rulesets.
