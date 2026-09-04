# File-dependency consumers can see new exports before their installed `dist/` payload actually contains them

- **ID:** `data-file-dependency-consumers-can-see-new-exports-before-their-installed-dist-payload-actually-contains-them`
- **Applies to:** `website-product-data`
- **Status:** Canonical learning detail.

## Learning

## File-dependency consumers can see new exports before their installed `dist/` payload actually contains them

We added the shared `style-code-import` request contract and exported it from
`website-product-data`. Studio and Azure both consume this repo through `file:` dependencies.

The consumer repos could read the updated `package.json` export map, but their installed copy of
`node_modules/@shane-corrigan/website-product-data/dist/requests/` still lacked the new emitted
`style-code-import` files. TypeScript then reported that the subpath export did not exist even
though the sibling repo source and export map were correct.

This failure mode looks like a bad export or a broken import path, which tempts people to fall back
to sibling source imports such as `../website-product-data/src/...`. That bypasses the shared
package boundary and reintroduces cross-repo drift.

Best practice:

- Keep consumers on package exports, not sibling source imports.
- After adding or changing a shared export, rebuild `website-product-data` and refresh each `file:`
  consumer install before typecheck/test runs.
- If a consumer sees the export map but not the emitted file, treat that as stale installed `dist/`
  output first, not as a reason to bypass the package boundary.