# MPDGI Hub — v1.4.1

Official NFC-ready digital hub for **Ministerio Plenitud de Gracia**.

**Designed & Developed by Roberto S. Macfie for MPDGI**

## v1.4.1 — Custom Domain Activation

The official Hub domain is now:

`https://hub.mpdgi.org/`

The repository includes the GitHub Pages `CNAME` file for `hub.mpdgi.org`. Canonical, social sharing, Hub and NFC URLs now use the church-owned subdomain.

Legacy GitHub Pages address:

`https://kl4ne.github.io/mpdgi-hub/`

The legacy address remains documented as a fallback, but new NFC tags and public references should use `https://hub.mpdgi.org/` after DNS/TLS propagation is complete.

## Current cards

1. Portal de Miembros / Member Portal — ChMeetings.
2. Ofrendar / Give — Tithe.ly and centered Zelle information.
3. Petición de Oración / Prayer Request — `https://mpdgi.org/oracion`.
4. Biblia / Bible — RVR1960 and KJV through BibleGateway.
5. Ministerios / Ministries — `https://mpdgi.org/ministerios`.
6. Redes Sociales / Social Media — Facebook, Instagram and YouTube.
7. Sitio Web / Website — `https://mpdgi.org`.
8. Acerca de / About — Hub information, version, privacy, developer credit and install action when supported.

## Installation and silent updates

The Install action appears inside **Acerca de / About** only when the browser exposes the PWA install prompt.

Existing installations update silently. A new Service Worker activates automatically, while reload is deferred if a modal is open or the app is backgrounded.

## NFC

For all new NFC tags, use this NDEF URI/URL after the domain resolves successfully over HTTPS:

`https://hub.mpdgi.org/`

The domain is church-owned and can remain stable even if the underlying hosting changes later.

## Automated QA

GitHub Actions validates version/config/PWA consistency, HTTPS routes, custom-domain configuration, recursive secret detection, four mobile viewport sizes, eight cards, ES/EN switching, modal flows, overflow, console errors and Lighthouse thresholds.

## Security

The Hub remains dependency-light at runtime, self-hosted, HTTPS-only for external navigation and protected by a restrictive same-origin Content Security Policy.

## Copyright

© 2026 Ministerio Plenitud de Gracia. All Rights Reserved.
