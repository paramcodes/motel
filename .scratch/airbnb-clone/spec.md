# Motel (Airbnb Clone) - Canonical Technical Specification & Architecture RFC

## Status: LOCKED
## Date: 2026-10-12
## Target: Bun Monorepo Implementation Backlog

---

## 1. System Overview & Architectural Topology

Motel is a peer-to-peer property rental marketplace enabling hosts to publish listings and guests to discover, filter, favorite, and book reservations with date-aware availability.

```
+----------------------------------------------------------------------------------------------------+
|                                      BUN MONOREPO TOPOLOGY                                         |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   apps/web (Next.js 15 App Router)                                apps/api (Bun + Elysia)          |
|   - React 19, Tailwind CSS, Framer Motion                         - Native Fetch tRPC v11 adapter  |
|   - Radix UI Headless Primitives                                  - @clerk/backend RS256 Auth      |
|   - tRPC React Client (React Query)                               - Svix Webhook Ingestion         |
|   - Host Wizard (sessionStorage State)                            - Port 3001                      |
|   - Port 3000                                                                                      |
|                         \                                                /                         |
|                          \                                              /                          |
|                           v                                            v                           |
|               packages/contracts                            packages/db                            |
|               - Shared Zod Schemas                          - Prisma ORM 5+                        |
|               - Router Procedure Signatures                 - PostgreSQL 16+                       |
|               - Error Classification Types                  - GiST Exclusion Extension             |
|                                                                                                    |
|                                         packages/ui                                                |
|                                         - Airbnb DLS Design Tokens                                 |
|                                         - Tailwind Preset & Components                             |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Design System & Frontend Architecture

### 2.1 Airbnb Design Language System (DLS) Tokens
- **Color Palette**:
  - `Canvas White`: `#ffffff` (canvas and card surfaces)
  - `Rausch Red`: `#ff385c` (primary brand accent, search orb, active wishlist heart)
  - `Deep Rausch`: `#e00b41` (accessible text links and pressed states)
  - `Near Black (Ink)`: `#222222` (primary typography, rating numbers)
  - `Body Ink`: `#3f3f3f` (long-form text, amenity descriptions)
  - `Secondary Gray`: `#6a6a6a` (subtitles, dates, inactive tabs)
  - `Hairline`: `#dddddd` (1px borders, card outlines)
  - `Hairline Soft`: `#ebebeb` (segment dividers, table borders)
  - `Surface Soft`: `#f7f7f7` (light button hover, search background)
- **Elevation Shadows**:
  - `Ambient Rest`: `0 0 0 1px rgba(0,0,0,0.02), 0 2px 6px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.10)`
  - `Hover Float`: `0 0 0 1px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.08)`
  - `Expanded Dialog`: `0 16px 40px rgba(0,0,0,0.22)`
- **Radii**: 20px cards (`rounded-[20px]`), 32px search pill (`rounded-full`), 8px buttons, 50% circular controls.
- **Accessibility**: Minimum 44×44px pointer hit areas (WCAG AAA), high-contrast `ring-neutral-900` focus outlines.

### 2.2 Navigation Header & Category Bar (Validated Winner)
- **Desktop ($\ge 768\text{px}$)**:
  - In-header 3-segment stacked pill:
    - `WHERE`: Uppercase 10px tracking label over destination summary (`I'm flexible` or input).
    - `DATES`: Uppercase 10px tracking label over unified date range (`Nov 14 – Nov 18`).
    - `GUESTS`: Uppercase 10px tracking label over aggregate count (`7 guests`).
    - **Active Segment Highlight**: Crisp black rounded pill border (`border-2 border-black bg-white rounded-full px-6 py-2 shadow-sm`).
    - **Search Orb**: 40px circular Rausch Red button with white magnifying glass icon.
  - **Expansion**: Smooth downward spring layout transition revealing **Stays** / **Experiences** tabs and anchored Radix Popovers (Region tiles, Dual-month calendar, Guest steppers) with dimmed backdrop scrim (`bg-black/25`).
- **Mobile ($< 768\text{px}$)**: Full-width search pill opening centered Radix UI `Dialog` modal with 3-step progressive accordion sheet.
- **Category Slider**: Horizontal scroll container with left/right circular chevron buttons conditionally mounted based on `scrollLeft` threshold ($>10\text{px}$) and remaining scroll width, 64px linear gradient edge masks, and active underline indicator (`layoutId="categoryUnderline"`).
- **State Store**: Unified search parameters (`destination`, `checkIn`, `checkOut`, `guests`, `category`) bound to URL search query parameters via `useSearchFilters()` hook.

---

## 3. Host Listing Multi-Step Wizard Contracts (`/host/create`)

### 3.1 State Architecture
- **Purity**: Zero uncommitted database rows or draft records in PostgreSQL.
- **State Store**: React Hook Form backed by `sessionStorage` (`motel_host_wizard_draft`).
- **Navigation**: `/host/create?step=1..7` with shallow routing for fluid Framer Motion slide transitions and browser Back/Forward support.
- **Creation**: Step 7 issues a single atomic `trpc.listings.create` mutation.

### 3.2 7-Step Zod Validation Matrix
1. **Step 1 (`category`)**: `z.enum(CANONICAL_CATEGORIES)` from 15 Airbnb categories.
2. **Step 2 (`location`)**: `country` (required), `region`, `city`, `address`, `latitude`, `longitude` (optional/nullable coordinates with Leaflet pin resolution).
3. **Step 3 (`floorPlan`)**: `guestCount` (1..16), `roomCount` (1..20), `bathroomCount` (1..20) integer steppers strictly matching Prisma fields.
4. **Step 4 (`amenities`)**: Curated 16-item taxonomy with `z.array(z.string()).min(1)`.
5. **Step 5 (`photos`)**: `imageSrc` (primary cover URL) and `images` (URLs array, min 1) with Cloudinary upload and direct URL fallback.
6. **Step 6 (`description`)**: `title` (5..50 characters), `description` (20..1,000 characters).
7. **Step 7 (`price`)**: Integer USD nightly price ($10..$10,000).
- **Master Contract**: `createListingSchema = step1.merge(step2)...merge(step7)`.

---

## 4. Backend & Database Architecture

### 4.1 Elysia + tRPC + Clerk Integration (`apps/api`)
- **Mounting**: `@trpc/server/adapters/fetch` via native `fetchRequestHandler` in `app.all('/trpc/*', ...)` with route option `{ parse: 'none' }` (prevents body pre-consumption).
- **Authentication**: `@clerk/backend` `authenticateRequest(req, ...)` extracting JWT Bearer token with local RS256 verification using `CLERK_JWT_KEY`.
- **Procedures**:
  - `publicProcedure`: Unauthenticated context with optional `ctx.auth.userId`.
  - `protectedProcedure`: Verifies `ctx.auth.userId`, throws `TRPCError({ code: 'UNAUTHORIZED' })`. Performs JIT user provisioning from Clerk if a new user queries the API before webhook delivery completes.
- **Webhooks**: `POST /webhooks/clerk` mounted with `{ parse: 'none' }`, verified using Svix HMAC-SHA256 headers (`svix-id`, `svix-timestamp`, `svix-signature`) via `@clerk/backend/webhooks` `verifyWebhook`, synchronizing `user.created`, `user.updated`, and `user.deleted` events into PostgreSQL.

### 4.2 PostgreSQL Schema & Concurrency Invariants (`packages/db`)
- **Prisma Models**: `User`, `Listing`, `Reservation`, `Favorite`.
- **Concurrency Storage Invariant**: Storage-level double-booking prevention using a PostgreSQL GiST exclusion constraint on discrete half-open intervals:
  ```sql
  CREATE EXTENSION IF NOT EXISTS btree_gist;

  ALTER TABLE "Reservation"
  ADD CONSTRAINT "reservation_no_overlapping_confirmed"
  EXCLUDE USING gist (
    "listingId" WITH =,
    daterange("startDate", "endDate", '[)') WITH &&
  )
  WHERE (status = 'CONFIRMED');
  ```
- **Error Mapping**: Catches PostgreSQL SQLSTATE `23P01` / Prisma `P2002` via `isReservationExclusionViolation(error)` and throws `TRPCError({ code: 'CONFLICT' })` (HTTP 409).
- **Availability Query**: Indexed `NOT EXISTS` anti-semi-join:
  ```prisma
  where.reservations = {
    none: {
      status: 'CONFIRMED',
      startDate: { lt: checkOut },
      endDate: { gt: checkIn },
    },
  };
  ```

---

## 5. Sequenced Monorepo Build Plan (Implementation Backlog)

This plan is strictly sequenced by dependency order. Each phase is self-contained with concrete verification criteria:

### Phase 1: Workspace Tooling & Monorepo Foundation
- **Goal**: Initialize Bun workspace monorepo with strict TypeScript and package boundaries.
- **Tasks**:
  1. Initialize root `package.json` with Bun workspaces (`apps/*`, `packages/*`).
  2. Setup `tsconfig.base.json` with strict type checking, `paths`, and module resolution.
  3. Configure Tailwind CSS base preset in `packages/ui` and ESLint/Prettier configs.
- **Verification**: `bun install && bun --filter "*" build` passes with zero errors.

### Phase 2: Database Layer & GiST Concurrency Migrations (`packages/db`)
- **Goal**: Implement Prisma schema, PostgreSQL client singleton, and native GiST exclusion migrations.
- **Tasks**:
  1. Define `schema.prisma` with `User`, `Listing`, `Reservation`, `Favorite`.
  2. Create custom migration script: `CREATE EXTENSION IF NOT EXISTS btree_gist;` and `reservation_no_overlapping_confirmed` constraint.
  3. Export singleton `prisma` client with soft-deletion and error handling helpers.
  4. Implement database seeder (`prisma/seed.ts`) populating mock listings across all 15 categories.
- **Verification**: `bunx prisma migrate dev` applies exclusion constraint; concurrent transaction test confirms SQLSTATE `23P01` on overlap.

### Phase 3: Shared Contracts & Validation Package (`packages/contracts`)
- **Goal**: Establish Zod schemas and TypeScript types shared across API and Web clients.
- **Tasks**:
  1. Export modular step schemas (`step1CategorySchema` through `step7PriceSchema`) and composite `createListingSchema`.
  2. Export router input/output schemas: `searchListingsInputSchema`, `createReservationInputSchema`, `cancelReservationInputSchema`, `toggleFavoriteInputSchema`.
  3. Export `isReservationExclusionViolation` utility function.
- **Verification**: `bun test` in `packages/contracts` validates all boundary conditions (e.g. `price < 10` fails, `startDate >= endDate` fails).

### Phase 4: Elysia API & Clerk Authentication Bridge (`apps/api`)
- **Goal**: Stand up standalone Bun Elysia service mounting tRPC and Clerk webhook sync.
- **Tasks**:
  1. Initialize Elysia service mounting native `@trpc/server/adapters/fetch` at `/trpc/*` with `{ parse: 'none' }`.
  2. Implement `@clerk/backend` token verification middleware and JIT user provisioning.
  3. Implement Svix-verified webhook handler at `POST /webhooks/clerk`.
  4. Implement `listingsRouter`, `reservationsRouter`, and `favoritesRouter` with error handling.
- **Verification**: `curl http://localhost:3001/trpc/listings.search` returns seeded listings; invalid auth token returns 401 UNAUTHORIZED.

### Phase 5: UI Primitives & Airbnb Design Tokens (`packages/ui`)
- **Goal**: Implement reusable DLS components using Radix UI and Tailwind CSS.
- **Tasks**:
  1. Configure Tailwind preset exporting Airbnb tokens (Rausch `#ff385c`, 3-layer ambient shadows, 20px radii).
  2. Build accessible Radix primitives: `Dialog`, `Popover`, `DropdownMenu`, `Tabs`, `Button`, `Input`.
  3. Implement counter steppers (+/–) with minimum 44px tap targets.
- **Verification**: Storybook or component test runner verifies WCAG AA contrast and focus rings.

### Phase 6: Web Client Shell & Navigation Header (`apps/web`)
- **Goal**: Implement main app layout, responsive search header, and category slider.
- **Tasks**:
  1. Initialize Next.js 15 App Router in `apps/web` with tRPC React Query provider and Clerk React provider.
  2. Implement desktop navigation header with Framer Motion spring expansion, Stays/Experiences tabs, and 3-segment stacked pill (`WHERE` / `DATES` / `GUESTS`).
  3. Implement anchored popovers (Region tiles, dual-month calendar, guest steppers) and backdrop dimming.
  4. Implement mobile Radix Dialog accordion modal.
  5. Implement horizontal category bar with circular chevron navigation, gradient edge masks, and active underline indicator.
- **Verification**: Browser smoke test verifies variant switching, segment outline rendering, and URL query synchronization.

### Phase 7: Host Multi-Step Wizard Flow (`apps/web`)
- **Goal**: Implement host listing onboarding at `/host/create`.
- **Tasks**:
  1. Build multi-step wizard shell with `?step=1..7` shallow query routing and progress bar.
  2. Connect React Hook Form to `sessionStorage` draft persistence (`motel_host_wizard_draft`).
  3. Implement 7 step screens: Category picker, Country select + Leaflet coordinate map, Capacity steppers, Amenities grid, Cloudinary photo uploader, Title/Description inputs, Price input.
  4. Connect Step 7 "Publish" button to `trpc.listings.create.useMutation()`.
- **Verification**: Completing wizard redirects to `/listings/:id`; listing appears immediately in discovery search.

### Phase 8: Listing Discovery, Details & Wishlist Favorites (`apps/web`)
- **Goal**: Implement home feed property grid, detail view, and favorites wishlist.
- **Tasks**:
  1. Implement responsive listing grid (1 to 4 columns) with 20px rounded cards and photo aspect ratios.
  2. Connect `trpc.favorites.toggle` with optimistic cache updates on card heart icons.
  3. Implement infinite scroll query using `nextCursor`.
  4. Build listing detail page (`/listings/[id]`) with photo mosaic gallery, host info, amenities list, and sticky reservation checkout card.
- **Verification**: Toggling favorite updates heart icon instantly without page refresh; `/favorites` displays wishlisted listings.

### Phase 9: Atomic Reservation Booking Flow (`apps/web`)
- **Goal**: Implement date range selection and reservation booking with conflict handling.
- **Tasks**:
  1. Implement interactive date range picker disabling already booked ranges.
  2. Calculate total nights, base price, and cleaning/service fees.
  3. Connect "Reserve" CTA to `trpc.reservations.create.useMutation()`.
  4. Handle `CONFLICT` error response: display alert banner "These dates were just booked by another guest" and refresh disabled date ranges.
  5. Build `/trips` guest reservation management and `/reservations` host booking overview with cancellation action.
- **Verification**: Booking creates confirmed reservation in database; immediate subsequent identical booking returns CONFLICT error.

### Phase 10: End-to-End Concurrency & Verification Suite
- **Goal**: Automated Playwright test suite exercising complete user journeys and race conditions.
- **Tasks**:
  1. Write E2E test for Host listing creation wizard end-to-end.
  2. Write E2E test for Guest search filtering by category and date availability.
  3. Write automated concurrent booking race condition test simulating two parallel checkout requests for the same date range; verify exactly 1 succeeds and 1 receives 409 CONFLICT.
  4. Write test for reservation cancellation releasing dates for subsequent booking.
- **Verification**: `bun run test:e2e` passes with zero flakiness in CI.
