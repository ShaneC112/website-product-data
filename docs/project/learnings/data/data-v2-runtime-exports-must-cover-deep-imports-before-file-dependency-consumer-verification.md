# V2 runtime exports must cover deep imports before file-dependency consumer verification

- **ID:** `data-v2-runtime-exports-must-cover-deep-imports-before-file-dependency-consumer-verification`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

The v2 image-generation contract is consumed through the runtime
`@shane-corrigan/website-product-data/image-generation` subpath. Exporting source symbols is
insufficient: the package export map and built `dist/` files must expose every deep import used by
Azure and Studio.

The Sanity-to-Azure submission is intentionally a strict immutable reference containing identity
and requested time, never mutable request or control payload. Keep that contract owned by the
shared package; consumers must not replace it with sibling source imports or local queue shapes.

Before Studio verification, build Data and refresh Studio's `file:` dependency so its installed
runtime artifact matches the export map. Then run Studio's normal local typecheck/test validation.
This supplements [File-dependency consumers can see new exports before their installed `dist/` payload actually contains them](data-file-dependency-consumers-can-see-new-exports-before-their-installed-dist-payload-actually-contains-them.md): an export-map change and its emitted runtime files are one compatibility boundary.