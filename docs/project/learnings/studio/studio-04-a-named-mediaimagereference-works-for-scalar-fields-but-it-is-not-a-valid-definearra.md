# Studio learning 04: A named `mediaImageReference` works for scalar fields, but it is not a valid `defineArra

- **ID:** `studio-04-a-named-mediaimagereference-works-for-scalar-fields-but-it-is-not-a-valid-definearra`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- A named `mediaImageReference` works for scalar fields, but it is not a valid `defineArrayMember`
	type for persisted direct references. Studio then renders `_type: 'reference'` values as "Item of
	type reference not valid for this list". Define every reusable-media array member explicitly as
	`defineArrayMember({type: 'reference', to: [{type: 'mediaImage'}]})`, including Portable Text
	bodies. A media migration must also update event GROQ projections from legacy
	`swatchImage.asset->url` to `swatchImage->image.asset->url`; otherwise room-image preparation
	fails before creating the per-variant progress record. Keep one schema test that inventories all
	direct-media arrays and checks their reference target.
