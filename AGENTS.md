# Store architecture
- Load the Meta bootstrap once from public/meta-pixel.js; it owns regional advertising permission and dispatch, so every browser event obeys one decision.
- Mount MetaConsent in the store footer and keep its policy on /privacidade; this keeps withdrawal accessible on all store pages.
- Forward existing product events through the tracking helper and report Purchase only after confirmed payment with a transaction event ID; this prevents purchases being inferred from PIX creation.
