# NFC / QR target

Current production NFC/QR destination:

`https://kl4ne.github.io/mpdgi-hub/`

For NFC, encode the address above as a standard **NDEF URI/URL record**. Rewritable NFC tags are preferred.

Planned permanent custom domain:

`https://hub.mpdgi.org`

The custom domain is intentionally **not configured yet**. Do not program `hub.mpdgi.org` into production tags until DNS, TLS, canonical URL, redirect behavior and GitHub Pages custom-domain configuration are activated and verified.

The Hub is HTTPS, PWA-enabled, mobile responsive and does not require a special NFC API: the tag simply opens the Hub URL.
