# MPDGI Stats — zero-cost deployment plan

This branch is the private **MPDGI Stats** application that supports MPDGI Hub v1.5.0.

## Non-negotiable project rules

- No Work mode is required.
- No paid plan is required.
- No passwords, API tokens, Cloudflare secrets or banking information may be committed to GitHub.
- The public MPDGI Hub must continue functioning even if Stats or D1 is unavailable.
- Analytics never stores visitor names, emails, payment details or precise location.
- Admin authentication data is stored only in D1 and server-side environment secrets.

## Cloudflare Free architecture

Create one Cloudflare Pages project from this existing GitHub repository and select:

- Repository: `kl4ne/mpdgi-hub`
- Production branch: `mpdgi-stats-v1.0`
- Framework preset: None
- Build command: `exit 0`
- Build output directory: `public`

The Stats app uses Pages Functions. Only the curated `public/` directory is deployed as static content; server code, migrations, tests and deployment notes remain outside the public web root.

Create one D1 database named approximately:

`mpdgi-stats`

Bind it to the Pages project with the binding name:

`STATS_DB`

Apply:

`migrations/0001_initial.sql`

## Required server-side secrets

Set these only in Cloudflare Pages > Settings > Environment variables / secrets:

- `AUTH_PEPPER` — a long random secret used as the server-side key for admin password verification.
- `BOOTSTRAP_SECRET` — a separate one-time setup secret used only to create the first owner account.
- `ANALYTICS_ALLOWED_ORIGIN` — `https://hub.mpdgi.org`

Never place either secret in a URL, GitHub file, client-side JavaScript or printed report.

## First owner account

After the database, migration and secrets are configured, call the one-time endpoint:

`POST /api/auth/bootstrap`

with the `X-Bootstrap-Secret` request header and a JSON body containing the approved owner email and a password of at least 16 characters.

Bootstrap closes automatically after the first admin user exists.

## Custom domain

After the Pages deployment works, add:

`stats.mpdgi.org`

as the Pages custom domain. Because this is a subdomain, the existing DNS provider can remain in place; follow the CNAME target Cloudflare displays during custom-domain setup.

The public Hub contains no Stats button or Stats link.

## Hub analytics entry URLs

- NFC: `https://hub.mpdgi.org/?src=nfc`
- QR: `https://hub.mpdgi.org/?src=qr`
- Controlled shared link: `https://hub.mpdgi.org/?src=link`
- Ordinary web / unattributed: `https://hub.mpdgi.org/`

Optional campaigns may add `&campaign=short-name`.

The Hub immediately removes `src` and `campaign` from the visible address after reading them.

## Data definitions

- **Visits / Sessions**: distinct anonymous session IDs observed in the selected period.
- **Estimated Unique Visitors**: distinct anonymous browser/device IDs observed in the selected period. This is not a count of identified people.
- **PWA Sessions**: distinct sessions observed in standalone installed-app mode.
- **Page Views**: page-view events.
- **Acquisition Source**: the first known source for the anonymous visitor and remains immutable.
- **Session Entry**: how the current session began (NFC, QR, Link, Web or PWA).
- **QR** always appears in reports even when the value is zero.

## Privacy and reliability

Event IDs are unique and inserted with `INSERT OR IGNORE`, so a retry cannot double-count the same event.

The server assigns its own timestamp and Eastern Time reporting day. Client device time is retained only as diagnostic metadata and is not used as the authoritative report day.

The collector rejects malformed events and likely automated/bot user agents. Raw IP addresses and full user-agent strings are not stored.

Dashboard and CSV use the same reporting engine so the same date range produces the same totals.
