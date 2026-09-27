# MPDGI Hub — v1.0.0

Official NFC-ready digital hub for **Ministerio Plenitud de Gracia**. The project is a lightweight, mobile-first Progressive Web App designed to give members and visitors fast access to official church resources from one permanent entry point.

**Designed & Developed by Roberto S. Macfie for MPDGI**

## v1.0.0 — NFC Launch

MPDGI Hub is optimized for physical NFC cards. A visitor can tap an iPhone or Android phone and immediately use the Hub as a normal website; installation is optional and never required.

Current temporary deployment target:

`https://kl4ne.github.io/mpdgi-hub/`

Future permanent NFC target, **not configured yet**:

`https://connect.mpdgi.org`

The main `mpdgi.org` website is intentionally left unchanged.

## Design

The approved interface uses a premium church visual direction:

- Navy: `#071A36`
- Secondary navy: `#0B2A52`
- Gold: `#D4AF37`
- Light gold: `#F2C94C`
- White: `#FFFFFF`

The interface uses the official MPdG logo, two-column touch cards on normal phone widths, a one-column fallback on very narrow screens, bilingual ES/EN controls, accessible dialogs, visible keyboard focus and reduced-motion support.

## Official access cards

1. Servicio en Vivo / Watch Live — official YouTube channel.
2. Portal de Miembros / Member Portal — ChMeetings.
3. Ofrendar / Give — modal with Tithe.ly and Zelle.
4. Petición de Oración / Prayer Request — `https://mpdgi.org/oracion`.
5. Eventos / Events.
6. Recursos / Resources.
7. Ministerios / Ministries.
8. Redes Sociales / Social Media — Facebook and Instagram modal.
9. Sitio Web / Website — `https://mpdgi.org`.

The removed **Conéctate** card is intentionally not part of v1.0.0.

### Route verification note

A dedicated route for **Eventos**, **Recursos** or **Ministerios** could not be independently verified during the v1.0.0 build. Per project rules, those three cards currently use the official fallback `https://mpdgi.org` instead of inventing paths. Update them only after a real route is confirmed.

## Repository structure

```text
mpdgi-hub/
├── index.html
├── sw.js
├── manifest.json
├── README.md
├── .nojekyll
├── css/
│   └── style.css
├── js/
│   └── app.js
├── data/
│   ├── config.json
│   ├── links.json
│   └── changelog.json
├── assets/
│   ├── profile/
│   │   └── logo-mpdg.png
│   ├── icons/
│   │   ├── apple-touch-icon.png
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   ├── logos/
│   └── qr/
│       └── README.md
└── .github/
    └── workflows/
        └── validate.yml
```

`sw.js` intentionally stays at the repository root so its scope covers the full Hub.

## Configuration

Primary project settings live in `data/config.json`, including version, official URLs, default language, church information and the future custom domain.

Card definitions live in `data/links.json`. Every card has:

- unique `id` and numeric `order`;
- bilingual `title` and `subtitle`;
- `direct` or `modal` action;
- HTTPS destination for direct links;
- visual `theme` and icon key.

To update a card, modify `data/links.json`, keep both languages synchronized and let the validation workflow confirm the data model.

## PWA and offline behavior

The PWA includes:

- `manifest.json` with relative `start_url` and `scope` for portability between GitHub Pages and the future custom domain;
- official logo-derived 192 px, 512 px and Apple touch icons;
- root Service Worker;
- critical-shell precache;
- network-first navigation and JSON configuration;
- stale-while-revalidate local static assets;
- old-cache cleanup;
- silent Service Worker activation;
- offline status messaging after the first successful visit.

External services are not intercepted by the Service Worker.

## Security

The repository is public. Never commit passwords, API keys, tokens, administrative credentials, banking secrets or private service credentials.

The Hub uses a restrictive Content Security Policy, validates launch URLs as HTTPS, avoids external JavaScript dependencies, uses `noopener noreferrer` for new-window links and does not use untrusted `innerHTML`.

The Hub does not store passwords, payment information or sensitive personal information. External services are governed by their respective terms and privacy policies.

## Validation and deployment

`.github/workflows/validate.yml` checks JavaScript syntax, JSON validity, version synchronization, required files, PWA metadata, official URLs, HTTPS, Service Worker paths, CSP, card integrity, icon/logo presence, removal of legacy loose files, and confirms that a `CNAME` is not introduced before the custom-domain phase.

GitHub Pages should publish directly from `main`. Do not call a release production-ready until both validation and GitHub Pages deployment succeed.

## Future custom domain

Only after v1.0.0 is fully tested should GitHub Pages be configured for:

`https://connect.mpdgi.org`

At that time, verify GitHub's current custom-domain documentation before making DNS changes. Do not replace or redirect the existing `https://mpdgi.org` website.

## Copyright

© 2026 Ministerio Plenitud de Gracia. All Rights Reserved.
