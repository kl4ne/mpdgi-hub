# NFC / QR target

Current production NFC/QR destination:

`https://kl4ne.github.io/mpdgi-hub/`

For NFC, encode the address above as a standard **NDEF URI/URL record**. Use rewritable NFC tags if possible.

The future custom domain `https://connect.mpdgi.org` is intentionally **not configured yet**. Do not program that address into production tags until its DNS, TLS, redirect behavior, and GitHub Pages custom-domain configuration are intentionally activated and verified.

The production Hub is HTTPS, PWA-enabled, mobile responsive, and does not require a special NFC API: the NFC tag simply opens the Hub URL.
