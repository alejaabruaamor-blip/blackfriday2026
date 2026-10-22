# Store architecture
- Load the Meta bootstrap once from public/meta-pixel.js; it owns regional advertising permission and dispatch, so every browser event obeys one decision.
- Mount MetaConsent in the store footer and keep its policy on /privacidade; this keeps withdrawal accessible on all store pages.
- Forward existing product events through the tracking helper and report Purchase only after confirmed payment with a transaction event ID; this prevents purchases being inferred from PIX creation.
- HumanGate sends first-session visitors to /verificacao for the promotional entry and deterministic two-attempt wheel; the promotion is disclosed as guaranteed, not random, and returns to a validated same-origin path preserving campaign parameters. This is not authentication or bot protection.
- Keep wheel outcomes and helmet promotion eligibility pure in promotion.ts; presentation never changes catalog or checkout prices, and never fabricates comparison prices.

- Send order-specific recovery reminders server-side after gateway PIX creation with the checkout notice and recorded legal basis; never fabricate consent, send unrelated offers or override unsubscribe. Failures must not block payment; record notice evidence in the existing sale raw payload.
- Signed recovery links validate HMAC using the server PIXRECOVER_API_KEY and re-fetch the existing transaction from BravoPay, returning no customer contact, CPF or address.
