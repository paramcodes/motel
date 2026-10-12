# Research Prisma PostgreSQL Schema and Reservation Availability Constraints

Type: research
Status: resolved
Blocked by: 

## Question

What is the optimal Prisma PostgreSQL schema model for `User`, `Listing`, `Reservation`, and `Favorite` that guarantees atomic reservation booking without double-booking race conditions and enables high-performance date-overlap filtering?

## Answer

Resolved by research subagent on branch `research/03-prisma-postgres-reservation-constraints` (commit `a305025`).
Full specification documented in `docs/research/03-prisma-postgres-reservation-constraints.md`.

Key Findings:
1. Concurrency Safety: Storage-level double-booking prevention via PostgreSQL GiST Exclusion Constraint:
   `ALTER TABLE "Reservation" ADD CONSTRAINT "reservation_no_overlapping_confirmed" EXCLUDE USING gist ("listingId" WITH =, daterange("startDate", "endDate", '[)') WITH &&) WHERE (status = 'CONFIRMED');`
   Requires `CREATE EXTENSION IF NOT EXISTS btree_gist;` in an initial Prisma migration. Application catches PostgreSQL error `23P01` (`exclusion_violation`) and maps to tRPC `CONFLICT`.
2. Availability Filtering: Availability query implemented via `WHERE NOT EXISTS (...)` correlated anti-semi-join, mapped in Prisma Client as:
   `reservations: { none: { status: 'CONFIRMED', startDate: { lt: checkOut }, endDate: { gt: checkIn } } }`
   Supported by composite B-tree index `@@index([listingId, status, startDate, endDate])`.
3. Schema Models:
   - `User`: Primary key matches Clerk `userId`, fields for email, name, avatar, relations to listings, reservations, favorites.
   - `Listing`: Relational foreign key `hostId`, title, description, category, address fields (country, city), room counts (guests, bedrooms, beds, bathrooms), price, images array, amenities array.
   - `Reservation`: Atomic date bounds (`startDate`, `endDate`), status enum (`CONFIRMED`, `CANCELLED`), guest relation, listing relation.
   - `Favorite`: Composite unique index `@@unique([userId, listingId])`.
