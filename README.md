# MPDGI Hub — v1.4.0

Official NFC-ready digital hub for **Ministerio Plenitud de Gracia**.

**Designed & Developed by Roberto S. Macfie for MPDGI**

## v1.4.0 — Production Hardening & Compatibility

v1.4.0 is the production-hardening release. It preserves the approved visual identity while improving accessibility, install behavior, silent updates, PWA compatibility, automated QA and NFC/domain readiness.

Current live production / NFC target:

`https://kl4ne.github.io/mpdgi-hub/`

Planned permanent custom domain, **not configured yet**:

`https://hub.mpdgi.org`

The current GitHub Pages URL remains canonical and active until the custom domain is intentionally configured and verified. No DNS or CNAME change is part of this release.

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

The Install action is no longer in the footer. It appears inside **Acerca de / About** only when the browser exposes the PWA install prompt.

Existing installations update silently. The Service Worker checks on load, periodically while open and when the app returns to the foreground. A new worker activates automatically, but the reload is deferred while a modal is open or the app is backgrounded so users are not interrupted mid-task.

Browsers still require a user gesture for the first PWA installation.

## Accessibility and mobile compatibility

- ES/EN labels and accessibility text are language-correct.
- Modal background content becomes inert while a dialog is open.
- Very short screens hide card subtitles before shrinking primary labels further.
- Dynamic viewport units (`svh` / `dvh`) improve behavior around mobile browser chrome.
- Focus trapping, Escape-to-close, reduced-motion support and visible focus remain enabled.

## PWA assets

The manifest uses PNG 192×192 and 512×512 icons, declares `lang: es` and `dir: ltr`, and keeps standalone display. Apple devices use the dedicated Apple Touch Icon. No app shortcuts are added.

A 1200×630 branded social sharing card is available at:

`assets/social/mpdgi-hub-share.svg`

## NFC and domain plan

For NFC tags today, encode this exact NDEF URI/URL:

`https://kl4ne.github.io/mpdgi-hub/`

The planned permanent destination is `https://hub.mpdgi.org`, but it must not be programmed into production tags until DNS, TLS and GitHub Pages custom-domain behavior are configured and verified.

## Automated QA

GitHub Actions now validates:

- version/config/PWA consistency;
- HTTPS routes and the current NFC URL;
- recursive secret and `.env` detection;
- four mobile viewport sizes;
- eight cards, ES/EN switching and all modal flows;
- no horizontal or vertical overflow on the target viewports;
- no browser console errors;
- Lighthouse performance, accessibility and best-practices thresholds.

## Security

The Hub remains dependency-light at runtime, self-hosted, HTTPS-only for external navigation and protected by a restrictive same-origin Content Security Policy. No passwords, payment credentials, API keys or private data belong in the public repository.

## Copyright

© 2026 Ministerio Plenitud de Gracia. All Rights Reserved.
