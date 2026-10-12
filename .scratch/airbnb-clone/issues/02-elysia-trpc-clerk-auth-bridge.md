# Research Bun Elysia tRPC Adapter and Clerk Authentication Bridge

Type: research
Status: resolved
Blocked by: 

## Question

How should Elysia mount `@trpc/server` in Bun (`apps/api`), extract the Clerk JWT Bearer token from incoming HTTP headers, validate the session via `@clerk/backend`, inject authenticated `User` context into protected tRPC procedures, and expose public endpoints for Clerk webhook user synchronizations?

## Answer

Resolved by research subagent on branch `research/02-elysia-trpc-clerk-auth-bridge` (commit `0df308c`).
Full specification documented in `docs/research/02-elysia-trpc-clerk-auth-bridge.md`.

Key Findings:
1. Elysia tRPC Mounting: Mount `@trpc/server/adapters/fetch` via native `fetchRequestHandler` in `app.all('/trpc/*', ...)` with route option `{ parse: 'none' }` to prevent body stream pre-consumption. Rejects archived `@elysiajs/trpc` plugin due to bundled legacy tRPC v10 duplicate symbol conflicts.
2. Clerk Token Verification: Employ `@clerk/backend` `authenticateRequest(req, ...)` which accepts Web Standard `Request`, inspects Bearer tokens and cookies, returns non-throwing `RequestState` for optional auth, validates `authorizedParties` (azp claim) against CSRF, and performs networkless RS256 verification when `CLERK_JWT_KEY` is provided.
3. Protected Procedures: `protectedProcedure` verifies `ctx.auth.userId`, throwing `TRPCError({ code: 'UNAUTHORIZED' })`. Includes automatic JIT fallback provisioning from Clerk if a new user queries the API before webhook delivery completes.
4. Webhook Synchronization: `POST /webhooks/clerk` mounted with `{ parse: 'none' }`, verified using Svix HMAC-SHA256 headers (`svix-id`, `svix-timestamp`, `svix-signature`) via `@clerk/backend/webhooks` `verifyWebhook`, synchronizing `user.created`, `user.updated`, and `user.deleted` events into PostgreSQL.
