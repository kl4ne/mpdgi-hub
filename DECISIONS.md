# DECISIONS — MPDGI Digital Ecosystem

Updated: 2026-10-04

## Architecture decisions

1. **Hub, Stats and Digital Cards remain separate concerns.**
   - Hub = institution.
   - Digital Cards = people.
   - Stats = intelligence/reporting.

2. **The Hub must not be modified merely to solve Digital Card issues.**

3. **Stats static source of truth is `public/`.**
   - Cloudflare Pages deploys `public/`.
   - CI validates the exact deployed root.

4. **Digital Card imports are PR-gated.**
   - No automatic ZIP replacement directly into `main`.

5. **Digital Card build metadata verification is read-only.**
   - No post-merge bot commit that mutates `main`.

6. **New Digital Cards start from the master template/generator.**
   - Do not create ad-hoc production copies.

7. **Card runtime deployments remain independent.**
   - Shared template/runtime rules may be enforced, but production cards are still separately deployable.

## Security decisions

8. **Do not rotate `AUTH_PEPPER` casually.**
   - Any future change requires a deliberate migration plan.

9. **Do not reset or delete D1 analytics during hardening.**

10. **Collector CORS is not treated as authentication.**
    - Known card origins are also bound server-side to allowed card targets/actions.

11. **Stats bootstrap is disabled by default.**
    - `BOOTSTRAP_ENABLED=true` is only for the short initial setup window.
    - Remove/disable bootstrap secrets afterward.

12. **Campaign writes require write-capable roles.**
    - Current allowed roles: `owner`, `admin`.

13. **Stats schema handling is read-first.**
    - Normal requests inspect schema without DDL.
    - Idempotent runtime DDL remains only as compatibility fallback when required objects are missing.
    - Explicit migrations are the authoritative schema path.

## CI/CD decisions

14. **GitHub Actions are pinned to reviewed commit SHAs.**

15. **Hub, Stats and Cards use reproducible npm lockfiles where Node dependencies exist.**

16. **Browser QA is required for Hub, Stats and Digital Cards.**
    - Chromium + WebKit coverage is retained.

17. **Production smoke tests are part of release proof.**
    - Hub and Stats verify production after merge.
    - Cards verify RSCard and NPCard Pages fallback.

## Product / content decisions

18. **Do not reintroduce the postponed `workers.dev` gateway/failover unless explicitly requested.**

19. **Do not invent contact or social URLs/data.**

20. **Do not use the `GMacfie` watermark in this project.**

21. **Developer credit rule:**
    - Text: `Designed & Developed by Roberto S. Macfie for MPDGI`
    - Only `Roberto S. Macfie` is linked.
    - Link target: `https://rmcard.pages.dev`

22. **Nancy's approved card art must not be regenerated into a different-looking design.**

## Workflow decisions

23. **Permanent anti-timeout process:**
    - do -> validate -> checkpoint -> continue

24. **Never restart from zero after timeout.**
    - Resume from the last validated checkpoint.

25. **Long audits/plans/handoffs belong in files.**
    - Prefer `.md` and ZIP bundles.
    - Keep chat concise.


## Password verifier migration decision

26. **Stats will migrate by dual-scheme login-time rehash, not by bulk rewrite.**
    - Legacy: `hmac-sha256-v1`.
    - Target: `pbkdf2-sha256-v1`.
    - Target algorithm: PBKDF2-HMAC-SHA256.
    - Initial security floor: 600,000 iterations, subject to target-runtime benchmarking.
    - Existing `AUTH_PEPPER` remains unchanged.
    - A successful legacy login may transparently rehash that user's supplied plaintext password into the new scheme.
    - Failed logins must never mutate password fields.
    - Legacy support remains until every active admin is migrated or deliberately reset.
    - Production rollout requires a dual-scheme rollback checkpoint first.


## Hub v1.6.1 scope decision — 2026-10-10

- The owner explicitly rejected all privacy changes: preserve cookies, localStorage, analytics identifiers, collection, retention, Stats and privacy UI *exactly as implemented*.
- Approved corrections other than privacy, including bumping the Hub patch version to 1.6.1.
- Preserve GitHub Pages as hosting; no Namecheap, DNS, Cloudflare or production D1 changes.
- Preserve approved branding, visual layout, ES/EN, NFC/QR attribution and giving links.
- The unversioned files remain canonical mirrors of release-pinned files by existing enforced CI design. Removing just one side of each pair would break validation, so do not delete these intentional mirrors.
