# Define Listing Creation Multi-Step Wizard State and Validation Contracts

Type: grilling
Status: resolved
Assignee: omp
Blocked by: 01, 03

## Question

What are the exact step schemas, React Hook Form state management boundaries, and shared Zod validation schemas for the 7-step host onboarding wizard (Category -> Location -> Floor plan / counts -> Amenities -> Photos -> Title & Description -> Price), and how should draft vs published states be enforced?

## Answer

Resolved through design tree grilling and domain modeling.
Full specification and TypeScript Zod contracts documented in `docs/contracts/05-listing-creation-wizard-contracts.md`.

Key Decisions & Architectural Contracts:
1. **Draft Lifecycle & Database Purity**:
   - Form progress lives strictly in client-side React Hook Form backed by `sessionStorage` (`motel_host_wizard_draft`).
   - No partial database rows, nullable columns, or orphan draft cleanup needed in PostgreSQL; listing creation is 100% atomic on Step 7.
2. **Modular Composable Zod Schemas (`packages/contracts`)**:
   - Step 1 (`category`): `z.enum(CANONICAL_CATEGORIES)` from 15 Airbnb categories.
   - Step 2 (`location`): `country` (required), `region`, `city`, `address`, `latitude`, `longitude` (optional/nullable coordinate resolution).
   - Step 3 (`floorPlan`): `guestCount` (1..16), `roomCount` (1..20), `bathroomCount` (1..20), strictly matching Prisma model attributes.
   - Step 4 (`amenities`): Curated 16-item taxonomy with `z.array(z.string()).min(1)`.
   - Step 5 (`photos`): `imageSrc` (URL) and `images` (array of URLs, min 1), with Cloudinary upload + external URL fallback.
   - Step 6 (`description`): `title` (5..50 chars), `description` (20..1000 chars).
   - Step 7 (`price`): Integer USD nightly price ($10..$10,000).
   - Master Schema: `createListingSchema` composed via `.merge()` of all 7 step schemas.
3. **Step Navigation**:
   - Hosted at `/host/create` with shallow URL search query `?step=1..7` for seamless Framer Motion transitions and browser Back/Forward navigation without state loss.
