# BRANCH CLEANUP PLAN — MPDGI Digital Ecosystem

Updated: 2026-10-05

## Goal

Reduce branch clutter without losing production history or required rollback checkpoints.

## Keep — kl4ne/mpdgi-hub

Production:
- main
- mpdgi-stats-v1.0

Current deliberate rollback checkpoints:
- checkpoint/hub-v1.6.0-current
- checkpoint/stats-v1.4.10-auth-e2e
- checkpoint/stats-v1.4.7-dual-scheme

Reason for retaining the v1.4.7 checkpoint:
- it is the compatibility rollback point that understands both legacy HMAC and PBKDF2 password records.

## Safe cleanup candidates — kl4ne/mpdgi-hub

The following branches correspond to already merged PR work or superseded historical development and are not production branches:

- audit-fix/hub-dead-assets-cleanup
- audit-fix/hub-historical-runtime-cleanup
- audit-fix/hub-quality-hardening
- audit-fix/stats-auth-integration-v1.4.9
- audit-fix/stats-auth-v1.4.7
- audit-fix/stats-benchmark-v1.4.7
- audit-fix/stats-cleanup
- audit-fix/stats-kdf-dual-scheme
- audit-fix/stats-kdf-helpers
- audit-fix/stats-ops-hardening
- audit-fix/stats-real-d1-auth-e2e
- audit-fix/stats-schema-hardening
- audit-fix/stats-session-integrity-v1.4.10
- audit-fix/stats-v1.4.5-hardening
- docs/audit-remediation-refresh-2026-10-05
- docs/checkpoint-after-pr52-2026-10-05
- docs/checkpoint-after-real-d1-auth-e2e
- docs/checkpoint-custom-domain-verification-2026-10-04
- docs/checkpoint-dns-diagnostics-2026-10-04
- docs/checkpoint-hub-origin-evidence-2026-10-04
- docs/checkpoint-hub-runtime-cleanup-2026-10-04
- docs/checkpoint-infra-diagnostics-2026-10-05
- docs/checkpoint-kdf-benchmark-2026-10-04
- docs/checkpoint-kdf-helpers-2026-10-04
- docs/checkpoint-main-905c911-2026-10-05
- docs/checkpoint-main-bb4d895-2026-10-05
- docs/checkpoint-public-dns-failures-2026-10-04
- docs/checkpoint-stats-v1.4.7-auth
- docs/cloudflare-fix-runbook-2026-10-05
- docs/final-checkpoint-2026-10-04
- docs/final-merge-checkpoint-2026-10-05
- docs/infra-evidence-2026-10-05
- docs/infra-evidence-v2-2026-10-05
- docs/project-continuity-2026-10-04
- docs/remediation-status-2026-10-04
- docs/repository-remediation-complete-2026-10-05
- docs/security-kdf-plan-2026-10-04
- hotfix/stats-login-upgrade-nonblocking
- hub-v1.5.2-campaign-session
- hub-v1.6.0-quality-maturity
- mpdgi-stats-v1.1.0
- mpdgi-stats-v1.2.0-dev
- ops/stats-custom-domain-diagnostics
- stats-v1.1.1-campaign-fix
- stats-v1.2.1-data-hotfix
- stats-v1.2.2-auto-update
- stats-v1.3.0-quality-maturity
- stats-v1.4.0-digital-cards
- stats-v1.4.1-brand-version-sync
- stats-v1.4.1-digital-card-tooltips
- stats-v1.4.2-name-only-signature-link
- stats-v1.4.3-npcard
- stats-v1.4.4-npcard-pages-fallback
- v1.5.0-analytics
- v1.5.1-device-detection

Older Stats checkpoints that are superseded by the current compatibility checkpoint and current v1.4.10 checkpoint:
- checkpoint/stats-v1.4.2
- checkpoint/stats-v1.4.3
- checkpoint/stats-v1.4.4

## Keep — kl4ne/mpdgi-digital-cards

Production:
- main

Current deliberate rollback checkpoint:
- checkpoint/cards-rs1.3.2-np1.0.3

Optional legacy checkpoints to remove after confirming the current checkpoint exists:
- checkpoint/npcard-v1.0.2
- checkpoint/rscard-v1.3.1

## Safe cleanup candidates — kl4ne/mpdgi-digital-cards

- audit-fix/cards-ci-consistency
- audit-fix/cards-production-smoke
- audit-fix/cards-quality-hardening
- audit-fix/cards-runtime-hardening
- card/nancy-pagan
- fix/npcard-hd-card
- fix/npcard-pages-analytics
- ops/npcard-custom-domain-diagnostics
- template/generator-smoke-test
- template/leader-card-v1

## Important

Deleting these branches does not delete merged commits from production history. Do not delete the production branches or the three deliberate current rollback checkpoints above.

This connector does not expose a branch-delete operation, so deletion must be performed through GitHub UI/API with administrative write access.
