# Assemble Final Technical Specification and Monorepo Build Plan

Type: task
Status: resolved
Assignee: omp
Blocked by: 

## Question

How should the resolved findings across design tokens, Prisma schemas, Elysia tRPC auth middleware, multi-step listing validation, and reservation concurrency contracts be assembled into the canonical specification (`.scratch/airbnb-clone/spec.md`) and translated into a sequenced backlog of implementation tickets for the Bun monorepo?

## Answer

Resolved. The canonical Technical Specification and Sequenced Monorepo Build Plan has been assembled and locked in [`.scratch/airbnb-clone/spec.md`](../spec.md).

Summary of Deliverables:
1. **Canonical Technical Specification (`.scratch/airbnb-clone/spec.md`)**:
   - Comprehensive workspace topology for Bun monorepo (`apps/web`, `apps/api`, `packages/db`, `packages/contracts`, `packages/ui`).
   - Airbnb DLS design token system (Canvas White, Rausch Red `#ff385c`, Deep Rausch `#e00b41`, Near Black `#222222`, 3-layer ambient shadows, 20px radii, WCAG AA compliance).
   - Synthesized navigation header architecture (desktop spring expansion with Stays/Experiences tabs and 3-segment stacked pill `WHERE` / `DATES` / `GUESTS` with crisp active pill outline and anchored Radix Popovers; mobile Radix Dialog accordion sheet; dynamic scroll chevrons and gradient masks on category slider).
   - Bun Elysia service mounting `@trpc/server/adapters/fetch` with `{ parse: 'none' }`, local RS256 JWT auth verification via `@clerk/backend`, and Svix webhook user synchronization.
   - PostgreSQL GiST exclusion constraint (`reservation_no_overlapping_confirmed`) using `btree_gist` on discrete half-open intervals $[startDate, endDate)$, mapping SQLSTATE `23P01` to tRPC `CONFLICT` (HTTP 409).
   - Host listing onboarding wizard contracts: pure client-side `sessionStorage` state, 7 modular Zod step schemas merged into `createListingSchema`, shallow `?step=1..7` query routing, atomic `listings.create` on Step 7.
   - Complete tRPC router signatures (`listings.search`, `listings.create`, `listings.delete`, `reservations.create`, `reservations.cancel`, `favorites.toggle`).
2. **Sequenced Monorepo Build Plan**:
   - Phase 1: Workspace Tooling & Monorepo Foundation
   - Phase 2: Database Layer & GiST Concurrency Migrations (`packages/db`)
   - Phase 3: Shared Contracts & Validation Package (`packages/contracts`)
   - Phase 4: Elysia API & Clerk Authentication Bridge (`apps/api`)
   - Phase 5: UI Primitives & Airbnb Design Tokens (`packages/ui`)
   - Phase 6: Web Client Shell & Navigation Header (`apps/web`)
   - Phase 7: Host Multi-Step Wizard Flow (`apps/web`)
   - Phase 8: Listing Discovery, Details & Wishlist Favorites (`apps/web`)
   - Phase 9: Atomic Reservation Booking Flow (`apps/web`)
   - Phase 10: End-to-End Concurrency & Verification Suite (Playwright)
