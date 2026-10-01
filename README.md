# MPDGI Hub — v1.6.0

Official NFC-ready digital hub for **Ministerio Plenitud de Gracia**.

**Designed & Developed by Roberto S. Macfie for MPDGI**

## v1.6.0 — Sharing, Release Metadata & Quality Maturity

The About view now provides **Share Hub**, using the device's native share sheet when supported and a clipboard fallback otherwise. Shared links use `https://hub.mpdgi.org/?src=link` so MPDGI Stats records the current session entry as Link while preserving immutable first-touch acquisition.

About also displays **Last Updated / Última actualización** from the release changelog for the active Hub version. The approved v1.5.2 visual design, NFC behavior, anonymous analytics, offline support, silent updates and reduced-motion accessibility are preserved.

## v1.4.7 — Cache Reliability & Smart Navigation

This release hardens browser/PWA cache upgrades so CSS and JavaScript from different releases cannot be mixed. Runtime CSS/JS use release-pinned filenames, the Service Worker refreshes critical assets from the network during installation, old MPDGI caches are purged automatically, and cache lookups stay inside the intended release cache.

The existing church address now opens turn-by-turn directions (Apple Maps on iPhone/iPad; Google Maps on Android and desktop), and the copyright year is generated automatically from the 2026 launch year with a defensive 2026 minimum.

The approved v1.4.6 visual design and Giving presentation are unchanged.

## v1.4.6 — Payment Logo Rendering Hotfix

This hotfix restores the exact payment-logo implementation that was visually approved in v1.4.4. Credit-card marks plus Apple Pay, Google Pay and Cash App Pay are rendered inline again to avoid the regression introduced when those SVGs were externalized in v1.4.5. All unrelated v1.4.5 maintenance and QA improvements remain in place.

## v1.4.5 — Maintenance, Compatibility & Code Cleanup

This maintenance release keeps the approved visual design while improving the code underneath it:

- Added a shared runtime version source used by the app and Service Worker.
- Moved social/payment SVGs out of `app.js` into local self-hosted brand assets, reducing the main JavaScript payload substantially.
- Removed dead CSS, unused Zelle SVG code, unused route metadata and the unused `icon-512.svg` file.
- Changed config/link data caching to stale-while-revalidate so cached content appears immediately on slow connections while fresh data updates in the background.
- Added WebKit/iPhone-oriented browser QA in addition to Chromium.
- Added a real offline reload test and bilingual accessibility-label tests.
- Added a post-deployment production smoke check in the main QA pipeline for `https://hub.mpdgi.org/`.
- Updated CI to Node 24, `actions/checkout@v7`, `actions/setup-node@v7`, Playwright 1.63.0 and Lighthouse 13.5.0.
- Synchronized the package, runtime and configuration release version at 1.4.5.

## v1.4.4 — TikTok & Social Brand Refresh

The **Redes Sociales / Social Media** modal now includes the official MPDGI TikTok profile:

`https://www.tiktok.com/@mpdginc`

Facebook, Instagram, YouTube and TikTok now use recognizable platform logo shapes and brand colors inside clean, high-contrast social buttons.

## v1.4.3 — Giving UX & Digital Wallets

The **Ofrendar / Give** modal now shows Square's enabled digital-wallet options alongside its accepted card networks:

- Apple Pay
- Google Pay
- Cash App Pay

The Zelle flow now gives clear bank-app instructions, displays `mpdginc@gmail.com` at a larger, higher-contrast size, and provides a dedicated **Copiar correo / Copy email** action. A QR code is intentionally not used because the Hub and banking app are commonly used on the same phone.

Square and Tithe.ly use brand-oriented provider lockups. Zelle is presented as the standard-character **Zelle®** mark rather than a stylized logo so the Hub does not imply a brand license that has not been documented.

## v1.4.2 — Square Giving & Payment Branding

The **Ofrendar / Give** modal now supports three church giving methods:

- Tithe.ly
- Square — `https://square.link/u/8veQoUxF`
- Zelle — `mpdginc@gmail.com`

The modal includes payment-brand visuals and the six card networks documented for Square card acceptance in the U.S.: Visa, Mastercard, American Express, Discover, JCB and UnionPay.

## v1.4.1 — Custom Domain Activation

The official Hub domain is now:

`https://hub.mpdgi.org/`

The repository includes the GitHub Pages `CNAME` file for `hub.mpdgi.org`. Canonical, social sharing, Hub and NFC URLs now use the church-owned subdomain.

Legacy GitHub Pages address:

`https://kl4ne.github.io/mpdgi-hub/`

The legacy address remains documented as a fallback. New NFC tags and public references use the active HTTPS production address `https://hub.mpdgi.org/`.

## Current cards

1. Portal de Miembros / Member Portal — ChMeetings.
2. Ofrendar / Give — Tithe.ly, Square, accepted-card branding and centered Zelle information.
3. Petición de Oración / Prayer Request — `https://mpdgi.org/oracion`.
4. Biblia / Bible — RVR1960 and KJV through BibleGateway.
5. Ministerios / Ministries — `https://mpdgi.org/ministerios`.
6. Redes Sociales / Social Media — Facebook, Instagram, YouTube and TikTok.
7. Sitio Web / Website — `https://mpdgi.org`.
8. Acerca de / About — Hub information, version, privacy, developer credit and install action when supported.

## Installation and silent updates

The Install action appears inside **Acerca de / About** only when the browser exposes the PWA install prompt.

Existing installations update silently. A new Service Worker activates automatically, while reload is deferred if a modal is open or the app is backgrounded.

## NFC

For all new NFC tags, use this active HTTPS NDEF URI/URL:

`https://hub.mpdgi.org/`

The domain is church-owned and can remain stable even if the underlying hosting changes later.

## Automated QA

GitHub Actions validates version/config/PWA consistency, HTTPS routes, custom-domain configuration, recursive secret detection, Chromium and WebKit behavior, four mobile viewport sizes, offline reload, eight cards, ES/EN switching, modal flows, overflow, console errors and Lighthouse thresholds. The main QA pipeline waits for GitHub Pages propagation and verifies the deployed custom domain before the release is considered complete.

## Security

The Hub remains dependency-light at runtime, self-hosted, HTTPS-only for external navigation and protected by a restrictive same-origin Content Security Policy.

## Copyright

© 2026 Ministerio Plenitud de Gracia. All Rights Reserved.
