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
2. Repair and validate `npcard.mpdgi.org`.
3. Add missing Hub response headers at the real proxy/hosting layer.
4. Enforce branch protection / required checks where the GitHub plan and repository settings permit.
5. Perform real-phone/NFC validation for Nancy after the custom domain is active.
6. Run a new zero-assumption final audit.

## Do not treat as roadmap work

- D1 reset.
- AUTH_PEPPER rotation without a dedicated credential-rotation plan.
- changing Nancy's approved artwork.
- replacing verified Pages fallbacks before custom-domain validation.


## Post-audit Hub v1.6.1 (2026-10-10)

- A v1.6.1 patch is prepared in `fix/hub-v1.6.1-post-audit` with social PNG, maskable icon, release-pinned assets and QA checks. Deployment is pending PR checks and merge.
- Privacy and analytics are explicitly **out of scope** by owner decision; retain existing behavior and data with no consent banners, DNT/GPC changes, cookie changes or Stats modifications.
- Hosting security-header gaps (nosniff, clickjacking) are confirmed by the October 5 runner. GitHub Pages does not provide repository-level HTTP headers; no DNS/proxy/hosting changes are authorized. Keep as an explicit hosting limitation until a separately approved infrastructure change.
- External link health checks, physical NFC / WhatsApp previews and mobile-device accessibility checks are recommended follow-up verification, not inferred code defects.
- The older Infrastructure/Governance track above is historical: Hub/Stats branch protection, NPCard domain and phone testing are already completed; do not rerun those tasks.


### Completion evidence — Hub v1.6.1

PR #67 was merged into `main` at `eb15695a5c8181b6d312c14cb571cb677ea261b9`. Post-merge GitHub Pages, validation and browser QA passed; production smoke verified v1.6.1. The earlier phase marked "deployment pending" is now complete. Real-device share-preview and platform HTTP-header follow-up remain distinct external checks, not application blockers.
