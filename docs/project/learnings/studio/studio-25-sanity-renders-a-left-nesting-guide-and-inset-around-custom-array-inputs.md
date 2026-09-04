# Studio learning 25: Sanity renders a left nesting guide and inset around custom array inputs.

- **ID:** `studio-25-sanity-renders-a-left-nesting-guide-and-inset-around-custom-array-inputs`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- Sanity renders a left nesting guide and inset around custom array inputs. It is structural UI, not an unsaved-change indicator, and is not directly configurable through `ArrayOfPrimitivesInputProps`. To align a custom control such as `SuitableRoomsInput` with standard field inputs, offset its root left by `0.8125rem` and increase its width by the same amount (`marginLeft: '-0.8125rem'`, `width: 'calc(100% + 0.8125rem)'`). Verify the live control edges against a standard input after Studio hot reload rather than relying on a cropped screenshot.
