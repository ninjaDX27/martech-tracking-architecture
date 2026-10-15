# Production boundaries

This reference accepts no raw financial variables, contact details or free-text form fields in its event contract. A mortgage calculator must keep income, debt, property value and credit decisions out of advertising payloads. Track the business event with an opaque ID instead.

Replace browser claims with authenticated backend conversion events and consent evidence. Validate the JSON Schema, check freshness and recipient eligibility, reserve the event in shared durable storage and enqueue it through an outbox. Recheck consent before delayed delivery. Preserve the same event name and event ID across browser/server retries.

The GTM Custom HTML forwarder is a sandbox blueprint. Configure explicit failure handling and CSP, protect the first-party endpoint, and review its current-GTM compatibility before unpausing. A successful local simulation proves payload mapping, not real match quality, attribution or compliance.

Hashed email/phone fields remain sensitive identifiers. Do not log them. Normalize email by trim/lowercase and provide a country-code phone before hashing. Do not hash fbc/fbp or fabricate these cookies from an unrelated identifier. The simulator's all-zero phone and .invalid email are fictitious fixtures.
