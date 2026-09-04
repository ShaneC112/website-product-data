# Studio learning 27: A custom Sanity document action (`CreateRoomImageRequestAction`'s dialog) that calls `cl

- **ID:** `studio-27-a-custom-sanity-document-action-createroomimagerequestaction-s-dialog-that-calls-cl`
- **Applies to:** `website-product-enrichment-sanity-studio`
- **Status:** Canonical learning detail.

## Learning

- A custom Sanity document action (`CreateRoomImageRequestAction`'s dialog) that calls `client.patch(...).commit()` directly - bypassing the form's own `onChange`/autosave flow - is the one place in this repo that needs its own error handling: a failed commit with no `try`/`catch` left the submit button stuck in a loading state forever with no console output and no user feedback. Wrapped the commit (and the dialog's initial preset/variant fetch) in `try`/`catch`/`finally`, logging via `console.error` and surfacing a toast, and resetting the loading state on failure. Components that only call `props.onChange(set(...))` do not need this, since Studio's form save pipeline already handles failures there.
