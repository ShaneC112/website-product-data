# Explicit URL groups need source-record identity and an expected-member barrier

- **ID:** `azure-explicit-url-groups-need-source-record-identity-and-an-expected-member-barrier`
- **Applies to:** `website-product-enrichment-azure`
- **Status:** Canonical learning detail.

## Learning

## Explicit URL groups need source-record identity and an expected-member barrier

Fibre Flooring demonstrated that two m2crm products can share a style code and website landing page while
having distinct commercial membership. `SpecifiedUrls` uses `m2crmproducts:<record-id>` as its group key,
fans out only the listed URLs as variants, and stores an expected variant count before processing.

**Best practice:** do not publish an explicit-member group until both its expected variant count and its
source-owning product-detail row are present. Variant transforms run concurrently, so missing either condition
creates a real publish race.

