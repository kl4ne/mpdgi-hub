# ROADMAP — MPDGI Digital Ecosystem

Updated: 2026-10-05

## Completed code-remediation track

- Hub dependency/CI hardening.
- Hub historical/dead runtime cleanup.
- Stats deployment-source cleanup.
- Stats collector integrity/rate controls.
- Stats campaign RBAC/bootstrap/schema hardening.
- Stats dual-scheme password verification and login-time migration support.
- Stats authentication error diagnostics and integration coverage.
- Digital Cards import/generator/QA/deployment hardening.
- Digital Cards CI consistency and 60-second update policy.
- Hub historical branch cleanup: 64→5 branches.
- Digital Cards historical branch cleanup: 14→2 branches.
- Automatic merged-branch lifecycle cleanup in both repositories.

## Remaining infrastructure/governance track

1. Validate PBKDF2 behavior against the actual Cloudflare runtime/plan limits.
2. Repair and validate `stats.mpdgi.org`.
3. Repair and validate `npcard.mpdgi.org`.
4. Add missing Hub response headers at the real proxy/hosting layer.
5. Enforce branch protection / required checks where the GitHub plan and repository settings permit.
7. Perform real-phone/NFC validation for Nancy after the custom domain is active.
8. Run a new zero-assumption final audit.

## Do not treat as roadmap work

- D1 reset.
- AUTH_PEPPER rotation without a dedicated credential-rotation plan.
- changing Nancy's approved artwork.
- replacing verified Pages fallbacks before custom-domain validation.
