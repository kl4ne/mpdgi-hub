# MPDGI Stats — Data Retention Policy

Version: 1.4.7  
Status: documented baseline; automatic deletion is **not enabled** in this release.

## Retention baseline

- **Aggregated reports and summary metrics:** retain indefinitely for historical ministry reporting.
- **Detailed anonymous analytics events:** target maximum retention of **24 months** before any future automated purge is considered.
- **Rate-control records:** short operational retention only. Existing collector cleanup remains focused on expired rate windows.
- **Campaign records:** retain until they are administratively archived or deleted.
- **Administrative authentication/session records:** retain only as required for secure operation and existing session-expiration rules.

## Safeguards before future deletion

No historical D1 analytics data may be purged merely because this document exists. Before enabling deletion, MPDGI must review actual D1 volume, verify reports remain accurate from aggregates, test the cleanup on a non-production copy or safe branch, and obtain explicit administrative approval.

## Privacy principle

Retention does not expand the data collected. The system continues to avoid visitor names, visitor email addresses, payment data, raw IP storage, precise location and complete User-Agent storage.
