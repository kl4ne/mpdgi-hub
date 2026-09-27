# MPDGI Hub — v1.3.0

Official NFC-ready digital hub for **Ministerio Plenitud de Gracia**.

**Designed & Developed by Roberto S. Macfie for MPDGI**

## v1.3.0 — About Card & Ultra Compact Grid

This release restructures the final row so Website and About are equal-size cards, moves the existing About information into the new About card, removes the footer version/About controls, and reduces card height again for a tighter single-screen mobile layout.

Live deployment target:

`https://kl4ne.github.io/mpdgi-hub/`

Future NFC custom domain, **not configured yet**:

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
8. About — opens the Hub information previously accessed from the footer.

## Footer

The visible version badge and footer About button were removed. The footer now keeps only the optional install control when available, the developer credit, and copyright. The current version remains visible inside About.

## Layout

All eight cards are equal-size two-column cards. Card height, icon size, padding and gaps were reduced again, including extra short-screen rules, to improve the one-glance mobile fit.

## PWA and accessibility

The app retains the official logo, ES/EN support, root Service Worker, offline shell caching, silent updates, accessible dialogs, keyboard focus handling, reduced-motion support and HTTPS-only external links.

## Security

The Hub stores no passwords or payment information. A restrictive same-origin Content Security Policy remains active. No DNS or custom-domain settings are changed.

## Copyright

© 2026 Ministerio Plenitud de Gracia. All Rights Reserved.
