# BRANCH CLEANUP PLAN — COMPLETED

Updated: 2026-10-05

## Status

Branch cleanup is complete and future merged-branch cleanup is automated.

## kl4ne/mpdgi-hub — retained branches

Production:
- main
- mpdgi-stats-v1.0

Rollback checkpoints:
- checkpoint/hub-v1.6.0-current
- checkpoint/stats-v1.4.10-auth-e2e
- checkpoint/stats-v1.4.7-dual-scheme

Result:
- before cleanup: 64 branches
- after cleanup: 5 deliberate branches

Automation:
- .github/workflows/cleanup-merged-branches.yml
- .github/scripts/branch-cleanup.mjs
- tests/branch-cleanup-unit.mjs

Safety:
- production branches are excluded from deletion;
- checkpoint/* branches are excluded from merged-head deletion;
- bootstrap/manual historical cleanup requires evidence that the branch was the head of a merged PR;
- open branches are excluded.

## kl4ne/mpdgi-digital-cards — retained branches

Production:
- main

Rollback checkpoint:
- checkpoint/cards-rs1.3.2-np1.0.3

Result:
- before cleanup: 14 branches
- after cleanup: 2 deliberate branches

Equivalent tested lifecycle automation is installed in the Digital Cards repository.

## Remaining governance item

Branch lifecycle cleanup is CLOSED.

Branch protection / required status checks is a separate administrative finding and remains open until configured in GitHub repository settings.
