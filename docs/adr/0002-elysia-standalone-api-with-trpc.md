# 0002 Standalone Elysia Bun Service with tRPC Router

We decided to decouple the backend API into a standalone Elysia service (`apps/api`) running on Bun, mounting `@trpc/server`, consumed by Next.js (`apps/web`) via `@trpc/react-query`.

While Next.js App Router route handlers can co-locate tRPC, separating the Elysia service allows native Bun performance, clean webhook listening for Clerk, independent backend test suites, and strict boundary separation between presentation UI and data persistence logic in the monorepo.
