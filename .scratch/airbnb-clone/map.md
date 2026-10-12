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
