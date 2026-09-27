# MPDGI Hub — v1.3.3

Official NFC-ready digital hub for **Ministerio Plenitud de Gracia**.

**Designed & Developed by Roberto S. Macfie for MPDGI**

## v1.3.3 — Color & Header Polish

This patch gives About its own burgundy color, slightly enlarges the official logo, adds more space between the church name and scripture block, and makes the Designed & Developed credit a little larger and lower.

Live production / current NFC target:

`https://kl4ne.github.io/mpdgi-hub/`

Future custom domain, **not configured yet**:

`https://connect.mpdgi.org`

The existing `https://mpdgi.org` site and DNS remain untouched.

## Current cards

1. Portal de Miembros / Member Portal — ChMeetings.
2. Ofrendar / Give — Tithe.ly and centered Zelle information.
3. Petición de Oración / Prayer Request — `https://mpdgi.org/oracion`.
4. Biblia / Bible — RVR1960 and KJV through BibleGateway.
5. Ministerios / Ministries — `https://mpdgi.org/ministerios`.
6. Redes Sociales / Social Media — Facebook, Instagram and YouTube.
7. Sitio Web / Website — `https://mpdgi.org`.
8. About — Hub information, version, privacy, external services, developer credit and copyright.

## Silent updates

Once the Hub is being used normally or has already been installed as a PWA, the Service Worker checks for a new version on load, every 15 minutes while open, and whenever the app returns to the foreground. A waiting update is activated with `skipWaiting`, claimed immediately, and the app reloads once automatically without displaying an update prompt.

Browsers do not allow a website to perform the **first PWA installation** silently without a user gesture. The existing Install control remains available when the browser exposes installation. Subsequent Hub releases update silently through the Service Worker.

## NFC readiness

The current NFC/QR URL is:

`https://kl4ne.github.io/mpdgi-hub/`

Program the NFC tag as a standard NDEF URI/URL record using that exact HTTPS address. The Hub itself does not require NFC hardware APIs; tapping the tag opens the production URL in the device browser or installed PWA.

The planned `connect.mpdgi.org` domain is still not configured. Until it is intentionally activated, NFC tags should use the GitHub Pages production URL. Rewritable NFC tags are preferable if the destination may change later.

## PWA and security

The app retains the official logo, ES/EN support, standalone manifest, root Service Worker, offline shell caching, automatic old-cache cleanup, accessible dialogs, keyboard focus handling, reduced-motion support, HTTPS-only external navigation and a restrictive same-origin Content Security Policy.

No passwords, payment credentials, API keys or private data are stored in the public repository.

## Copyright

© 2026 Ministerio Plenitud de Gracia. All Rights Reserved.

## v1.3.3 visual refinement

Website keeps the gray treatment while About now uses a distinct burgundy gradient. The official logo is slightly larger, the scripture block has more breathing room below the church name, and the developer credit is slightly larger and lower.
