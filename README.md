# MPDGI Stats — v1.4.6

Private analytics PWA for **Ministerio Plenitud de Gracia**.

This branch is intentionally separate from the public MPDGI Hub application. It is designed to deploy as a Cloudflare Pages project at:

`https://stats.mpdgi.org`

## Purpose

MPDGI Stats provides private, authenticated reporting for anonymous Hub usage:

- Sessions / Visits
- Estimated Unique Visitors
- Observed PWA Sessions
- Page Views
- NFC / QR / Link / Web attribution
- Session Entry
- New vs Returning anonymous visitors
- Saved campaigns with Link / QR / NFC URLs and per-session results
- Top Hub actions
- Devices, browsers and languages
- Professional Print / Save PDF reports
- Aggregate CSV export
- Executive summaries and period comparisons
- Hourly and weekday activity insights
- Data-quality monitoring for event delivery
- Real System Health with D1 latency, Collector activity and Event Pipeline state
- Bilingual Methodology & Privacy definitions
- Documented data-retention baseline

## Privacy

The system does **not** store visitor names, visitor email addresses, payment details, precise location, raw IP addresses or complete user-agent strings.

Anonymous visitor and session IDs exist only to deduplicate and aggregate usage. Reports describe approximate anonymous devices/browsers, not identified people.

## Security

- Dashboard APIs require an authenticated admin session.
- Mutating campaign APIs additionally enforce authorized write roles (`owner` or `admin`).
- The bootstrap endpoint is disabled unless `BOOTSTRAP_ENABLED=true` is explicitly present for initial setup.
- Session cookies are HttpOnly, Secure and SameSite=Strict.
- Password verification uses a strong user password plus a Cloudflare-only secret pepper.
- Login attempts are rate limited.
- Collector traffic is strictly validated and simple abuse is rate limited without persisting raw IP addresses.
- Search indexing is disabled with `X-Robots-Tag`.
- Private API responses use `Cache-Control: no-store`.
- The service worker never caches `/api/` responses.

## Zero-cost architecture

Designed for Cloudflare Pages Functions + D1 Free and the existing MPDGI domain. No paid service is required for the intended church-scale usage.

See `STATS_DEPLOYMENT.md` for deployment instructions.

See `ANALYTICS_METHODOLOGY.md` for metric definitions and `DATA_RETENTION_POLICY.md` for the retention baseline. v1.4.6 does not automatically delete historical analytics data.

## Important

Do not merge this branch into the GitHub Pages `main` branch. The public Hub and the private Stats PWA are separate deployments.

**Designed & Developed by Roberto S. Macfie for MPDGI**
