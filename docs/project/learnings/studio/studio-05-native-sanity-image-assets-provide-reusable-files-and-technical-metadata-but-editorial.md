# Studio learning 05: Native Sanity image assets provide reusable files and technical metadata, but editorial 

- **ID:** `studio-05-native-sanity-image-assets-provide-reusable-files-and-technical-metadata-but-editorial`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- Native Sanity image assets provide reusable files and technical metadata, but editorial metadata
	needs a content document. `mediaImage` is the canonical owner of alt text, role, provenance,
	room, and AI generation prompt; every product, variant, and editorial placement holds a direct
	reference to it. Migrations must retain native assets, deduplicate by `image.asset._ref`,
	patch all paths on a document in one revision-guarded mutation, and verify both that no inline
	legacy images remain and that every reference resolves to a media record with alt text and an
	asset.
