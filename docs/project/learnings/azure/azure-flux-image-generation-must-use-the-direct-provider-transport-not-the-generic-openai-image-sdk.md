# FLUX image generation must use the direct provider transport, not the generic OpenAI image SDK

- **ID:** `azure-flux-image-generation-must-use-the-direct-provider-transport-not-the-generic-openai-image-sdk`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail

## Observation

The committed Azure v2 image adapter used the generic OpenAI SDK image surface:

```ts
const client = new OpenAI({apiKey: route.apiKey, baseURL: route.endpoint})
await client.images.generate({model, prompt, size})
```

The adapter did not explicitly preserve the Azure/Foundry `api-version` query and collapsed every non-square aspect ratio to `1536x1024`. A live request through that committed behavior returned `HTTP 400` with `Missing required query parameter: api-version`.

The working implementation in Ops-Hub is different. It performs a direct `fetch()` to the configured Black Forest Labs endpoint:

- `POST` to the configured provider endpoint exactly as supplied;
- `Authorization: Bearer <API key>`;
- `Content-Type: application/json`;
- body fields `model`, `prompt`, `width`, `height`, and `n`;
- optional `image_prompt` and `image_prompt_strength` for a reference image;
- response image in `data[0].b64_json`.

A live request using the Ops-Hub transport, the configured FLUX endpoint, and `AZURE_OPENAI_IMAGE_API_KEY` returned `HTTP 200`, a base64 image, 401,803 decoded bytes, and a valid image signature.

## Endpoint ownership

Keep the endpoint families separate:

- GPT text and vision prompt calls use the Microsoft Foundry project endpoint and its OpenAI-compatible `/openai/v1` route:
  `https://<resource>.services.ai.azure.com/api/projects/<project>`.
- FLUX.2-pro image generation uses the configured Black Forest Labs provider endpoint:
  `https://<resource>.services.ai.azure.com/providers/blackforestlabs/v1/flux-2-pro?api-version=preview`.

The Microsoft Foundry SDK overview documents the project endpoint and the OpenAI-compatible Responses surface. The Microsoft image-generation documentation documents Azure OpenAI GPT-image deployments and does not establish that FLUX.2-pro supports the project `/openai/v1/images/generations` operation. A project-endpoint image request returned `HTTP 404`; this must not be treated as evidence that the prompt or model is invalid.

The deployment shown in the Foundry portal confirms that `FLUX.2-pro` exists as a Global Standard deployment, but deployment existence does not change the provider-specific request contract. Use the deployment's generated code and the known-good Ops-Hub transport as the source of truth for the FLUX operation.

## Request contract

The Azure FLUX adapter must preserve the final assembled prompt unchanged:

```json
{
  "model": "FLUX.2-pro",
  "prompt": "<assembled roomshot prompt>",
  "width": 1024,
  "height": 768,
  "n": 1
}
```

Ops-Hub's established dimensions are:

| Aspect ratio | Width | Height |
| --- | ---: | ---: |
| `1:1` | 1024 | 1024 |
| `3:2` | 1024 | 682 |
| `4:3` | 1024 | 768 |
| `16:9` | 1024 | 576 |

The prompt contains the room architecture, product, colour, texture, scene design, camera guidance, and brand guidance. The transport must not rewrite or summarize that prompt. GPT text and vision analysis remain separate integrations and must not be changed as part of the FLUX transport.

## Response handling

Validate the provider response before downstream persistence:

1. Require a successful HTTP response.
2. Require `data[0].b64_json` for the requested image count.
3. Decode and validate the image bytes and dimensions through the existing staged-image pipeline.
4. Preserve the caller operation identity when the provider does not return a request ID.
5. Retry bounded transient statuses such as `429`, `499`, and `5xx` at the provider boundary only when the surrounding orchestration contract permits it.

Do not switch back to the generic OpenAI SDK image method merely because the model is visible under Foundry model deployments. The visible deployment and the callable endpoint contract are separate facts.

## Evidence

- Ops-Hub implementation: `projects/Ops-Hub/domain-layers/service-ai/server/application/image-generations.ts`.
- Ops-Hub provider configuration: `projects/Ops-Hub/domain-layers/service-ai/server/provider/openai/image-client.ts`.
- Ops-Hub roomshot caller: `projects/Ops-Hub/domain-layers/crm-web-cms/server/application/crm/roomshot-generation/ai-roomshot-render.ts`.
- Microsoft Foundry SDK overview: `https://learn.microsoft.com/en-gb/azure/foundry/how-to/develop/sdk-overview?view=foundry&pivots=programming-language-javascript`.
- Microsoft Azure OpenAI image generation guide: `https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/dall-e`.
- Microsoft Responses API guide: `https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/responses`.

## Prevention rule

When integrating a deployed Foundry image model, do not infer the transport from the presence of an OpenAI-compatible SDK or from the portal deployment name. First compare the deployment's generated code and a known-good sibling implementation, then test the exact direct request shape. Keep the model's text/vision prompt clients and the FLUX image transport as separate provider boundaries.
