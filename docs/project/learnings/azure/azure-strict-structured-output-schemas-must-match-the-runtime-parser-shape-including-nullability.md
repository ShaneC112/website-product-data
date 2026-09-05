# Strict structured-output schemas must match the runtime parser shape, including nullability

## Applies to

- website-product-enrichment-azure

## Symptom

Live Sanity image prompt preparation failed after the structured interior-design brief shipped, even
though focused local tests were green.

The first live failure came from Azure OpenAI rejecting the strict `response_format` schema because
the `additions.items.properties` object included `inscription` but the `required` array did not list
it. After that was fixed, the next live failure came from the runtime parser: Azure OpenAI returned
`inscription: null` for non-award additions, which matched the strict JSON schema but was rejected by
the Zod parser because the parser only allowed the literal string or omission.

## Root cause

The implementation had two separate schema boundaries that were treated as if they were one:

1. the strict JSON schema sent to Azure OpenAI as `response_format: {type: 'json_schema'}`;
2. the local Zod parser used to validate the returned JSON.

Local tests exercised the validation logic with hand-authored objects, but they did not execute a
real strict structured-output call and did not include the provider-returned `null` shape for
non-award additions. That allowed the JSON schema and the runtime parser to drift apart.

## Fix

- Require every property listed in the strict JSON schema's `properties` object to also appear in
  the corresponding `required` array when Azure OpenAI strict mode expects that shape.
- Allow `inscription` to be `null` in the runtime parser when the strict JSON schema allows `null`.
- Add focused tests that cover the provider-returned `null` shape, not just omitted optional fields.

## Prevention

- Treat the provider-facing strict JSON schema and the runtime parser as one contract that must stay
  shape-compatible, including nullability.
- When a structured-output field is conditionally meaningful, prefer an explicit nullable field over
  assuming the provider will omit it.
- Add at least one focused test that parses a mocked provider response using the exact shape the
  provider is allowed to return.
- For new strict structured-output work, do one narrow live or semi-live smoke check before relying
  on local unit tests alone.