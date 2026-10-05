# INFRASTRUCTURE EVIDENCE — MPDGI Digital Ecosystem

Updated: 2026-10-05

## Purpose

Record repository-visible evidence that helps distinguish code/hosting configuration from DNS/custom-domain configuration.

## Hub

Repository: `kl4ne/mpdgi-hub`
Branch: `main`

Observed:
- root `CNAME` file exists
- value: `hub.mpdgi.org`

Interpretation:
- the Hub repository is explicitly configured for the GitHub Pages custom hostname `hub.mpdgi.org`
- this supports the existing conclusion that Hub response-header remediation belongs at the actual serving/proxy layer, not in a Cloudflare Pages-style `_headers` file

## Stats

Repository: `kl4ne/mpdgi-hub`
Branch: `mpdgi-stats-v1.0`

Observed:
- no root `CNAME` file is present
- verified Pages endpoint remains `https://mpdgi-stats.pages.dev`
- external diagnostics show `stats.mpdgi.org` does not currently resolve publicly

Interpretation:
- the Stats custom domain is not represented as a GitHub Pages CNAME in this branch
- this is consistent with the intended Cloudflare Pages custom-domain model
- repair should be performed in Cloudflare Pages/DNS, not by adding a GitHub Pages CNAME file

## Digital Cards

Repository: `kl4ne/mpdgi-digital-cards`
Branch: `main`

Observed:
- no root `CNAME` file
- no `cards/nancy-pagan/CNAME`
- no `cards/ruben-suarez/CNAME`
- verified NPCard fallback remains `https://npcard.pages.dev`
- external diagnostics show `npcard.mpdgi.org` does not currently resolve publicly

Interpretation:
- Digital Card custom domains are deployment-platform configuration, not per-card GitHub Pages CNAME files
- do not create ad-hoc CNAME files inside card folders as a workaround

## Operational conclusion

Repository-visible evidence supports the current split:

- Hub custom hostname: represented by GitHub Pages `CNAME`
- Stats/NPCard custom hostnames: must be fixed at Cloudflare Pages/DNS
- Hub missing security response headers: must be fixed at the actual HTTP serving/proxy layer

No repository change should be used to fake or mask these infrastructure issues.
