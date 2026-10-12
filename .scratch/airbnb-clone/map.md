## Destination

A complete, locked Technical Specification, Architecture RFC, and Ticketed Build Plan (workspace topology, database schema, tRPC router contracts, and Airbnb design tokens) ready for autonomous or paired execution sessions.

## Notes

Domain: Airbnb clone property marketplace (Motel).
Skills to consult: `domain-modeling`, `grilling`, `prototype`, `research`.
Standing preferences:
- Monorepo using Bun workspaces
- Frontend: Next.js App Router, Tailwind CSS, Framer Motion, Radix UI primitives
- Backend: Standalone Bun Elysia service (`apps/api`) mounting `@trpc/server`
- Database: PostgreSQL with Prisma ORM (`packages/db`)
- Auth: Clerk with JWT bearer validation on tRPC and webhook sync
- Design system: Airbnb Design Language System (pure white canvas, Rausch Red `#ff385c`, Near Black `#222222`, 3-layer shadows, 20px radius, Cereal VF / rounded sans typography)
- Payments: Out of scope (simulated instant checkout)

## Decisions so far

<!-- the index: one line per closed ticket, enough to judge relevance, then zoom the link for the detail the ticket holds -->

- [Research Airbnb Design System Token Integration with Tailwind and Radix](.scratch/airbnb-clone/issues/01-airbnb-design-tokens-tailwind-radix.md): Standardized on Airbnb DLS tokens (Canvas White `#ffffff`, Rausch Red `#ff385c`, Near Black `#222222`, 3-layer shadows, 20px card radius, Cereal VF typography) mapped to Tailwind variables and Radix primitives with WCAG AA compliance.
- [Research Bun Elysia tRPC Adapter and Clerk Authentication Bridge](.scratch/airbnb-clone/issues/02-elysia-trpc-clerk-auth-bridge.md): Decoupled Elysia mounting via native `fetchRequestHandler` with `{ parse: 'none' }`, RS256 token verification with `@clerk/backend` `authenticateRequest`, and Svix-verified webhook user syncing into PostgreSQL.
- [Research Prisma PostgreSQL Schema and Reservation Availability Constraints](.scratch/airbnb-clone/issues/03-prisma-postgres-reservation-constraints.md): Solved reservation double-booking race conditions using PostgreSQL GiST exclusion constraints with `btree_gist` and availability filtering via indexed `NOT EXISTS` anti-semi-joins in Prisma.
- [Prototype Airbnb Category Bar and Floating Search Bar Navigation Header](.scratch/airbnb-clone/issues/04-airbnb-category-and-search-header-prototype.md): Adopted synthesized winner combining Variant A's desktop inline expansion and Stays/Experiences tabs with Variant C's 3-segment stacked search pill (WHERE, DATES, GUESTS with crisp active border) and mobile Radix Dialog accordion modal (Variant B).
- [Define Listing Creation Multi-Step Wizard State and Validation Contracts](.scratch/airbnb-clone/issues/05-listing-creation-wizard-contracts.md): Defined client-side atomic wizard state with sessionStorage persistence, modular Zod step schemas (Category, Location, Floor plan, Amenities, Photos, Description, Price) merged into createListingSchema, and ?step=1..7 shallow routing.
- [Define Reservation Concurrency and Availability Filtering tRPC Router Contracts](.scratch/airbnb-clone/issues/06-reservation-concurrency-availability-contracts.md): Locked tRPC router signatures (listings.search cursor pagination with NOT EXISTS availability filter, reservations.create with PostgreSQL GiST exclusion conflict mapping to CONFLICT, soft cancel, and atomic favorites toggle).

## Not yet specified

- Real-time guest and host notification dispatch on reservation creation or cancellation.
- Review and rating aggregation system (cleanliness, communication, check-in, accuracy).
- Interactive Mapbox / Leaflet map toggle view split-screen with listing cards.
- Automated Playwright E2E fixture seeding and Clerk automated testing mode configuration.
- Image transformation and responsive blur placeholder generation.

## Out of scope

- Real monetary payments (Stripe, payment intents, escrow, refunds, tax collection).
- Direct host-guest in-app messaging / chat system.
- Co-hosting and team permissions management.
- Native mobile applications (iOS/Android).
