# Studio learning 18: A custom object-type Studio input (`components: {input: ...}`) can wrap the default rend

- **ID:** `studio-18-a-custom-object-type-studio-input-components-input-can-wrap-the-default-rend`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- A custom object-type Studio input (`components: {input: ...}`) can wrap the default rendering instead of replacing it - call `props.renderDefault(props)` and add UI around it, rather than reimplementing every field, when only supplemental read-only context (e.g. a live registry field description) needs to be shown. Keep the actual resolution logic (`productType` -> trade -> registry description) as a plain exported function so it stays unit-testable without a DOM/Sanity form-context test harness (this repo has neither). The same pattern extends to an *interactive* array-type input (e.g. `importMeta.conflicts`) - it can call `props.onChange(set(value, [{_key}, 'field']))` to patch one array item's field directly, still rendering `props.renderDefault(props)` for the underlying editable list.
