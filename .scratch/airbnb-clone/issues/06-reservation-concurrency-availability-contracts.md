# Define Reservation Concurrency and Availability Filtering tRPC Router Contracts

Type: grilling
Status: resolved
Assignee: omp
Blocked by: 02, 03

## Question

What are the exact tRPC procedure signatures, input/output Zod schemas, mutation concurrency locks, and error response shapes for `listings.search`, `listings.create`, `listings.delete`, `reservations.create`, `reservations.cancel`, and `favorites.toggle` across the `apps/api` and `apps/web` boundary?

## Answer

Resolved through design tree grilling and contracts specification.
Full specification and TypeScript router implementations documented in `docs/contracts/06-reservation-concurrency-availability-contracts.md`.

Key Decisions & Architectural Contracts:
1. **Double-Booking Concurrency Mapping (`reservations.create`)**:
   - PostgreSQL GiST exclusion constraint (`SQLSTATE 23P01` / `P2002`) violations are detected via `isReservationExclusionViolation` and translated directly to `TRPCError({ code: 'CONFLICT' })` (HTTP 409).
   - Prevents phantom double-bookings; client catches `CONFLICT` to render an inline date error banner and re-fetch disabled dates.
2. **Discovery & Availability Anti-Semi-Join (`listings.search`)**:
   - Public procedure with cursor-based pagination (`limit: 20`, `cursor?: string`), returning `{ items, nextCursor }`.
   - Availability query executes an indexed `NOT EXISTS` anti-semi-join (`none: { status: 'CONFIRMED', startDate: { lt: checkOut }, endDate: { gt: checkIn } }`) over half-open discrete intervals $[checkIn, checkOut)$.
3. **Deletion & Cancellation Invariants**:
   - `reservations.cancel`: Guest or Host authorized; updates `status = 'CANCELLED'` (soft delete), immediately releasing the GiST exclusion constraint while retaining audit trails.
   - `listings.delete`: Host only; strictly rejects with `TRPCError({ code: 'PRECONDITION_FAILED' })` if active or future confirmed reservations exist.
4. **Wishlist Mutation Protocol (`favorites.toggle`)**:
   - Protected procedure performing an atomic find-and-delete or create on `@@unique([userId, listingId])`, returning `{ listingId, isFavorited: boolean }` for instant optimistic UI cache updates.
