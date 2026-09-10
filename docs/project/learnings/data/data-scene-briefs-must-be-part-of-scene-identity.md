# Scene briefs must be part of scene identity

## Context

The image-generation v2 scene artifact carries an AI-generated interior-design brief into downstream assembly. A brief can change furniture layout, signature styling, materials, and visible furnishings even when the room, product, and creative-direction fields remain unchanged.

## Learning

A scene design brief is an identity input, not incidental text. The normalized scene contract and `buildSceneKey` must include the brief so a changed designer result cannot reuse an older scene artifact or cache entry.

The brief must also remain available in the durable generate-stage dependency manifest. A consumer that reconstructs a scene during assembly cannot safely rely on an in-memory value from the generate worker.

## Prevention

- Validate the brief at the shared scene contract boundary.
- Include it in the scene cache key and semantic fingerprint.
- Persist it in the generate-stage dependency manifest when assembly needs it.
- Add an assembly regression test proving the final prompt contains the generated brief.
- Keep compact render directives and the full design brief inside the same scene-owned result until a versioned split contract is approved.
