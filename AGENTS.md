# Store architecture
- Show post-sale jacket and accessory collections through PostSaleProducts at the bottom of /acompanhar-pedido at all times (with or without a tracking lookup), after the tracking form and help line; reuse catalog ProductCard links and prices without changing tracking or payment data.
- Load the Meta bootstrap once from public/meta-pixel.js; it owns regional advertising permission and dispatch, so every browser event obeys one decision.
- Mount MetaConsent in the store footer and keep its policy on /privacidade; the privacy notice never auto-opens — advertising permission defaults by visitor country from /api/public/region (blocked in regulated or unresolved regions, allowed elsewhere), with refusal always available in the footer.
- Forward existing product events through the tracking helper and report Purchase only after confirmed payment with a transaction event ID; this prevents purchases being inferred from PIX creation.
- HumanGate sends first-session visitors to /verificacao for the promotional entry and deterministic two-attempt wheel; the promotion is disclosed as guaranteed, not random, and finishing it always redirects to the store homepage (/). This is not authentication or bot protection.
- Keep wheel outcomes and helmet promotion eligibility pure in promotion.ts; presentation never changes catalog or checkout prices, and never fabricates comparison prices.
- Keep roulette sound in browser-only roulette-audio.ts, initialize it on a spin gesture, and dispose on unmount; optional audio and mute must never affect promotion outcomes.

- Send order-specific recovery reminders server-side after gateway PIX creation with the checkout notice and recorded legal basis; never fabricate consent, send unrelated offers or override unsubscribe. Failures must not block payment; record notice evidence in the existing sale raw payload.
- Signed recovery links validate HMAC using the server PIXRECOVER_API_KEY and re-fetch the existing transaction from BravoPay, returning no customer contact, CPF or address.
