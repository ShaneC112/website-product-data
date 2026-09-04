# website-product-data

- Runtime: TypeScript, Zod, npm, Vitest.
- This repository owns the shared runtime contracts, storage schemas, canonical registries, and tracked project documentation used across the product-enrichment workspace.
- Package manager: npm. Do not run pnpm in this repository.
- Update a shared contract here, build it, then update consuming repositories. Keep consumer-specific adapters outside this package.
- Use `npm run build` before testing a dependent repository. Use `npm test` for focused contract coverage.
- Workspace-visible documentation, instructions, agents, and skills are canonicalized in `workspace-customizations/`. Run `npm run workspace:sync` to publish explicit managed files and `npm run workspace:sync:check` to detect drift.
- Add JSDoc for non-obvious contracts, parsers, storage keys, or business invariants. Keep public barrel exports minimal and keep schemas close to their corresponding contracts.