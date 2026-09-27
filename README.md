# MPDGI Hub — v1.2.1

Official NFC-ready digital hub for **Ministerio Plenitud de Gracia**.

**Designed & Developed by Roberto S. Macfie for MPDGI**

## v1.2.1 — Single-Screen Compact Layout

This patch keeps the v1.2.0 functionality and compresses the mobile layout so the complete Hub is designed to fit in one screen on common phone viewports without routine up/down scrolling.

Live deployment target:

`https://kl4ne.github.io/mpdgi-hub/`

Future NFC custom domain, **not configured yet**:

`https://connect.mpdgi.org`

The existing `https://mpdgi.org` site and DNS remain untouched.

## Current cards

1. Portal de Miembros / Member Portal — ChMeetings.
2. Ofrendar / Give — Tithe.ly and centered Zelle information.
3. Petición de Oración / Prayer Request — `https://mpdgi.org/oracion`.
4. Biblia / Bible — modal with:
   - Reina-Valera 1960 (RVR1960): `https://www.biblegateway.com/versions/Reina-Valera-1960-RVR1960-Biblia/`
   - King James Version (KJV): `https://www.biblegateway.com/versions/King-James-Version-KJV-Bible/`
5. Ministerios / Ministries — `https://mpdgi.org/ministerios`.
6. Redes Sociales / Social Media — Facebook, Instagram and YouTube, each shown with its recognizable platform mark.
7. Sitio Web / Website — `https://mpdgi.org`.

The standalone **Servicio en Vivo / YouTube**, **Eventos**, **Recursos**, and **Conéctate** cards are not part of v1.2.0. YouTube remains inside Redes Sociales.

## Footer

The four-item bottom navigation introduced in v1.1.0 was removed. The visible footer once again contains:

- current version;
- optional PWA install button when the browser supports installation;
- Acerca de / About;
- developer credit;
- copyright.

## Icon direction

The card icons use a custom monoline system designed for MPDGI Hub rather than attempting to imitate the reference mockup. Social-media buttons intentionally use recognizable brand marks because those buttons identify external platforms.

## Visual system

- Primary navy: `#071A36`
- Secondary navy: `#0B2A52`
- Gold: `#D4AF37`
- Light gold: `#F2C94C`
- White: `#FFFFFF`
- UI fonts: SF Pro / Segoe UI / Roboto / Helvetica / Arial
- Institutional heading fallback: Georgia / Times New Roman

## PWA and accessibility

The app retains relative manifest paths, a root Service Worker, offline shell caching, old-cache cleanup, silent updates, ES/EN language support, keyboard focus management, Escape-to-close dialogs, focus trapping and reduced-motion support.

## Security

This public repository must never contain passwords, API keys, tokens, banking credentials or private service credentials. The Hub stores no passwords or payment data.

A restrictive same-origin Content Security Policy is applied. External navigation is HTTPS-only and uses `noopener noreferrer`.

## Validation

`.github/workflows/validate.yml` verifies JavaScript syntax, JSON, version synchronization, required assets, official routes, BibleGateway version links, the seven-card model, removal of deprecated cards/navigation, social-platform presentation, centered Zelle styling, PWA metadata, Service Worker paths, CSP and the absence of a premature `CNAME`.

## Copyright

© 2026 Ministerio Plenitud de Gracia. All Rights Reserved.

## Compact viewport target

The header, cards, decorative wave, church-info strip and footer use responsive compact sizing. A shorter-screen media query further reduces vertical spacing on phone-height viewports while retaining the same content and two-column card structure.
