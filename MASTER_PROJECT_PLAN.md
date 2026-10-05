# MASTER PROJECT PLAN — MPDGI Digital Ecosystem

Updated: 2026-10-05

## Goal

Maintain a secure, testable and recoverable digital ecosystem for MPDGI without destructive production changes.

## Components

1. MPDGI Hub — public institutional PWA.
2. MPDGI Stats — private analytics application backed by Cloudflare Pages Functions and D1.
3. MPDGI Digital Cards — independent leader cards with NFC/QR/link attribution.

## Permanent workflow

**do -> validate -> checkpoint -> continue**

Every material change should:
1. start from the current verified branch;
2. remain small and reviewable;
3. run automated validation;
4. merge only after green evidence;
5. update continuity documentation when state changes.

## Safety constraints

- never reset or delete D1 as routine remediation;
- never rotate AUTH_PEPPER casually;
- never expose password hashes, salts, session tokens or secrets;
- preserve verified Pages fallbacks until custom domains are validated;
- do not reintroduce workers.dev failover without explicit approval;
- do not alter approved Digital Card artwork during infrastructure/security work.

## Current remediation objective

Close all known audit findings that are controllable from repository code, then close the remaining DNS/hosting/governance items through their real administrative layers.

## Completion criteria

A final audit should report:
- no known critical/high/medium code defects;
- current production versions validated;
- DNS/custom domains validated;
- required response headers validated;
- branch/deployment governance documented and enforced where the GitHub plan permits;
- continuity files synchronized with actual repository HEADs and production state.
