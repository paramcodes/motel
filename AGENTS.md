# Motel Monorepo Navigation & Environment

## Monorepo Layout
- `packages/contracts`: tRPC schemas, Zod validation models, canonical categories/amenities.
- `packages/db`: PGlite embedded PostgreSQL client, schema migration in `prisma/migrations/0_init/migration.sql`.
- `packages/ui`: Shared React primitives (Tailwind tokens + Radix patterns).
- `apps/api`: Elysia HTTP server + tRPC router (`port 3001`). Routers in `src/routers/`.
- `apps/web`: Next.js 15 App Router frontend (`port 3000`). Pages in `src/app/`.
- `GLOSSARY.md`: Domain definitions (Listing, Reservation, GiST Exclusion, Host/Guest).
- `docs/adr/`: Architecture decision records.

## Environment Commands
- `bun run check`: Complete guardrail verification (`lint` + `typecheck` + `test`).
- `bun run lint`: Fast Biome linter across workspace.
- `bun run typecheck`: Monorepo-wide `tsc --noEmit`.
- `bun run build`: Declaration generation across packages + Next.js production build.
- `bun test`: All test suites across packages and end-to-end smoke tests.

## Concurrency & Testing Invariant
- PostgreSQL GiST exclusion constraints (`23P01` / `isReservationExclusionViolation`) enforce double-booking prevention.
- Unit and integration tests run against PGlite with isolated listings/dates.
