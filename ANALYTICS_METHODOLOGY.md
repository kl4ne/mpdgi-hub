# MPDGI Stats — Analytics Methodology

Version: 1.4.8  
Official reporting timezone: `America/New_York`

## Core definitions

- **Session / Visit:** an anonymous active-visit identifier. The Hub starts a new session after 30 minutes of inactivity, when a tagged source starts a new attributed visit, or when the browser/PWA context changes.
- **Estimated Visitor:** an approximate anonymous browser/device identifier. It is not an identified person and must never be presented as an exact count of people.
- **Acquisition Source:** the anonymous visitor's first known source (NFC, QR, Link or Web/Unattributed). First-touch acquisition is immutable.
- **Session Entry:** how the current session began (NFC, QR, Link, Web or PWA).
- **Campaign:** the tag attached to the current session. A later campaign can change session attribution without changing first-touch acquisition.
- **PWA Session:** a session observed while the Hub runs in installed standalone mode.
- **New vs Returning:** derived from the anonymous visitor's first-seen date relative to the selected reporting range.

## Data authority

Server timestamps and Eastern Time reporting days are authoritative. Client timestamps are diagnostic only. Dashboard, CSV and printable reports use the same server reporting engine.

## Privacy boundary

MPDGI Stats does not store visitor names, visitor email addresses, payment information, raw IP addresses, precise location or complete User-Agent strings. Raw IP may be read transiently by Cloudflare for hashed rate control and is not persisted.

## System Health semantics

- **Operational:** the component passed its real check and recent activity is consistent with normal operation.
- **No recent activity:** the system is reachable but no recent collector activity is available. This is not treated as a failure.
- **Degraded:** the database responds but exceeds the current response-latency threshold.
- **Error:** observed data indicates the event pipeline is not storing received events, or the dashboard request itself fails its database health check.
