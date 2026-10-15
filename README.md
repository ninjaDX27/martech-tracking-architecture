# MarTech Tracking Architecture

A consent-aware acquisition event contract, GTM container blueprint and executable GA4/Meta payload simulator. Synthetic examples only; no platform credentials or live delivery.

```text
Frontend: accepted lead
        ↓
GTM dataLayer (generate_lead + stable event_id)
        ├── analytics consent → GA4 (allowlisted non-identity parameters)
        ├── advertising consent → first-party webhook → Meta CAPI
        └── authenticated backend transaction → CRM (integration boundary)
```

## Run

Node.js 22+. No npm dependencies.

```sh
npm test
npm run simulate
```

The simulator validates a synthetic lead and prints separate destination payloads. It does not perform HTTP requests or create a CRM record.

## dataLayer example

Populate the identity fields only under the applicable consent and data-handling policy. Generate hashes in an authorized first-party flow. Hashing does not make personal data anonymous.

```javascript
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  schema_version: '1.0.0',
  event: 'generate_lead',
  event_id: crypto.randomUUID(), // keep this same ID for every retry
  event_time: Math.floor(Date.now() / 1000),
  form_id: 'mortgage_demo',
  consent: consentSnapshot,
  user_data: { hashed_email: emailSha256, hashed_phone: phoneSha256 },
  attribution: { gclid: clickId, fbc: metaClickCookie, fbp: metaBrowserCookie }
});
```

Omit absent attribution keys; do not send undefined, null or invented cookies. Meta fbc/fbp values are not SHA-256 hashes. The GA4 tag never forwards hashed contact fields. Avoid exposing identity to unrelated tags that can read the shared dataLayer.

## Import into GTM

1. Use a disposable **Web container**, then Admin → Import Container.
2. Select [gtm-container-blueprint.json](simulator-configs/gtm-container-blueprint.json), a new workspace and **Merge**.
3. Inspect the variables, custom trigger, Google tag, GA4 Event tag and Meta webhook forwarder.
4. Replace the sandbox GA4 ID. Implement the authenticated first-party endpoint at /api/marketing-events with schema validation, durable idempotency and server-only Meta credentials.
5. Connect a CMP through GTM Consent APIs. Additional tag consent checks supplement that integration.
6. Unpause only the configured sandbox tags. Use Preview, GA4 DebugView and Meta Test Events before any production publication.

All blueprint tags are paused. It uses GTM export format v2 and native tag types; local structural checks pass, but a real GTM UI import and vendor delivery remain unverified. The Google base tag is sequenced before the GA4 event; page-view policy must be configured separately.

## Design notes

The JSON Schema uses draft 2020-12. Runtime validation additionally enforces a seven-day project freshness window and attribution consent. The shared validator intentionally implements only the schema's shape/format checks, not a general JSON Schema engine. A production consumer should validate with a full draft-2020-12 validator and enforce the runtime gates too.

The webhook forwards to your backend, never directly to Meta from the browser. A CAPI token must not appear in GTM, JavaScript, Git or request URLs. Generate conversions after backend acceptance, preserve event IDs and reconcile vendor acknowledgements with CRM outcomes.

[Contract](schemas/lead-event-schema.json) · [Production boundaries](docs/production.md) · [Portfolio hub](https://github.com/ninjaDX27/ninjaDX27)

Sources: [GTM import/export](https://support.google.com/tagmanager/answer/6106997?hl=en), [dataLayer](https://developers.google.com/tag-platform/tag-manager/datalayer), [GTM consent](https://developers.google.com/tag-platform/security/guides/consent), [Meta's official server-event SDK](https://github.com/facebook/facebook-nodejs-business-sdk/blob/main/src/objects/serverside/server-event.js).
