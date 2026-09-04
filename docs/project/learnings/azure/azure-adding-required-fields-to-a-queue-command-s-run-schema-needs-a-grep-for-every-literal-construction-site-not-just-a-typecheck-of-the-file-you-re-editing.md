# Adding required fields to a queue command's run schema needs a grep for every literal construction site, not just a typecheck of the file you're editing

- **ID:** `azure-adding-required-fields-to-a-queue-command-s-run-schema-needs-a-grep-for-every-literal-construction-site-not-just-a-typecheck-of-the-file-you-re-editing`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Adding required fields to a queue command's run schema needs a grep for every literal construction site, not just a typecheck of the file you're editing

Adding `colourName`/`productType` to `SanityImageGenerateCommand`'s `runs[]` schema (so a
completed roomshot can carry a descriptive alt text and be attributed correctly) broke
`sanityImageAutoCreate.ts` - it builds its own `SanityImageGenerateCommand` literal (the
auto-generate-after-prepare path) and was missing both new required fields. `npm run build`
(`tsc`) caught it immediately; the sibling `sanityImageAutoCreate.test.ts` suite did not,
because it never round-trips the constructed command through the real Zod schema.

**Best practice:** when a shared queue command schema gains a required field, grep the whole
repo for every place that builds a literal object of that command type (not just the
call sites the current task touched), and run a full `tsc --noEmit`/`npm run build` before
considering the change done - a passing test suite is not sufficient evidence when tests
use loosely-typed mocks or `as any` casts on the command being constructed.

