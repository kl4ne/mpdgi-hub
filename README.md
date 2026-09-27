# MPDGI Hub — v1.1.0

Official NFC-ready digital hub for **Ministerio Plenitud de Gracia**.

**Designed & Developed by Roberto S. Macfie for MPDGI**

## v1.1.0 — Reference UI Refresh

This release aligns the live PWA much more closely with the approved mobile mockup while preserving the official circular MPdG logo supplied by the church.

Live deployment target:

`https://kl4ne.github.io/mpdgi-hub/`

Future NFC custom domain, **not configured yet**:

`https://connect.mpdgi.org`

The existing `https://mpdgi.org` site and DNS are intentionally untouched.

## Visual system

- Primary navy: `#071A36`
- Secondary navy: `#0B2A52`
- Gold: `#D4AF37`
- Light gold: `#F2C94C`
- White: `#FFFFFF`
- UI fonts: SF Pro / Segoe UI / Roboto / Helvetica / Arial
- Institutional heading fallback: Georgia / Times New Roman

The mobile interface now uses a larger official logo, stronger two-column gradient cards, a gold/navy wave separator, compact address/service information, a single language pill, and a four-item bottom navigation.

## Current cards

1. Portal de Miembros / Member Portal — ChMeetings.
2. Ofrendar / Give — Tithe.ly and centered Zelle information.
3. Petición de Oración / Prayer Request — `https://mpdgi.org/oracion`.
4. Conéctate / Connect — visitor/newcomer entry point using the official-site fallback `https://mpdgi.org` until a dedicated route is confirmed.
5. Ministerios / Ministries — `https://mpdgi.org/ministerios`.
6. Redes Sociales / Social Media — Facebook, Instagram and YouTube in one modal.
7. Sitio Web / Website — `https://mpdgi.org`.

The standalone **Servicio en Vivo / YouTube**, **Eventos**, and **Recursos** cards were removed in v1.1.0. YouTube remains available inside Redes Sociales.

## PWA

The app includes relative manifest paths, a root Service Worker, offline shell caching, old-cache cleanup, silent updates, ES/EN language support, keyboard/focus accessibility and reduced-motion support.

The supplied official circular logo is used for the hero and PWA icon assets.

## Security

This public repository must never contain passwords, API keys, tokens, banking credentials or private service credentials. The Hub stores no passwords or payment data. External services are governed by their own terms and privacy policies.

A restrictive same-origin Content Security Policy is applied and external navigation is HTTPS-only with `noopener noreferrer`.

## Validation

`.github/workflows/validate.yml` checks JavaScript syntax, JSON, semantic version synchronization, required assets, official routes, card integrity, removal of the deprecated cards, YouTube placement inside the social modal, logo presence, PWA metadata, Service Worker paths, CSP and the absence of a premature `CNAME`.

## Copyright

© 2026 Ministerio Plenitud de Gracia. All Rights Reserved.
