# NEXT ACTION — MPDGI Digital Ecosystem

Updated: 2026-10-04

## Latest validated repository state

### Hub
- Runtime version: `1.6.0`
- Historical runtime cleanup is complete and validated.
- Remaining header gap is hosting-layer/infrastructure work.

### Stats
- Runtime version: `1.4.7`
- Runtime checkpoint: `6213978d83d57eb236422c9e10290ae61e15cd99`
- Diagnostics-only HEAD: `2d018cd07e0ace2d8bc9ed895d6828c88776c490`
- Production Pages endpoint remains verified.
- `stats.mpdgi.org` does not currently resolve publicly from GitHub Actions.
- Diagnostic run: `37247974058`.

### Digital Cards
- RSCard: `1.3.2`
- NPCard fallback: `1.0.3`
- Diagnostics-only HEAD: `ccf8940930e82cf67330488bf706a7c51e87f8ec`
- `npcard.mpdgi.org` does not currently resolve publicly from GitHub Actions.
- Diagnostic run: `37248236928`.

## Exact next action

The remaining custom-domain work requires Cloudflare/DNS administrative access.

When that access is available:
1. Attach/verify `stats.mpdgi.org` on the intended Stats Pages project.
2. Confirm the public DNS record exists.
3. Validate version/security headers.
4. Checkpoint.
5. Attach/verify `npcard.mpdgi.org` on the intended NPCard Pages project.
6. Confirm the public DNS record exists.
7. Validate approved Nancy build, headers, analytics and real-device NFC.
8. Checkpoint.
9. Review whether `hub.mpdgi.org` is behind a layer that can inject the two missing security response headers.

Until Cloudflare/DNS access is available, do not invent or guess DNS records.
