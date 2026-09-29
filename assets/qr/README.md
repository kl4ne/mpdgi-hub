# NFC / QR analytics targets

MPDGI Hub v1.5.0 uses source-tagged entry URLs so NFC, QR and shared-link traffic can be measured without changing the destination application.

## NFC

Program physical NFC credentials with this permanent URL:

`https://hub.mpdgi.org/?src=nfc`

Encode it as a standard **NDEF URI/URL record**. After the Hub reads the source, it removes the `src` parameter from the visible address so normal sharing uses the clean Hub URL.

## QR Code

Generate official QR codes with:

`https://hub.mpdgi.org/?src=qr`

Optional campaign names may be added, for example:

`https://hub.mpdgi.org/?src=qr&campaign=youth-campaign-2026`

Campaign values should use short lowercase letters, numbers, hyphens or underscores.

## Controlled shared links

When MPDGI intentionally distributes a trackable link, use:

`https://hub.mpdgi.org/?src=link`

A campaign may also be appended.

## Unattributed web traffic

The clean public address remains:

`https://hub.mpdgi.org/`

Visits to the clean address are intentionally reported as **Web / Unattributed** unless an earlier anonymous acquisition source is already known for that browser/device.

## Reliability

The Hub itself remains the destination for every source-tagged URL. Analytics is not allowed to block navigation: if the Stats collector is unavailable, the Hub continues to open and function normally.

Legacy GitHub Pages fallback:

`https://kl4ne.github.io/mpdgi-hub/`

Before programming a large batch of NFC tags or printing QR codes, test the final encoded URL on at least one iPhone and one Android device.
