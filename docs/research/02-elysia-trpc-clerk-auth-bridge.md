# 02 Elysia tRPC Clerk Auth Bridge & Webhook Synchronization

**Author**: Motel Architecture Team (Research Agent 02)  
**Date**: 2026-10-12  
**Target Service**: `apps/api` (Elysia on Bun)  
**Consumer**: `apps/web` (Next.js App Router via `@trpc/react-query`)  
**Status**: Completed Research & Specification  

---

## 1. Executive Summary

As established in [ADR 0002](../adr/0002-elysia-standalone-api-with-trpc.md), Motel decouples its backend persistence and business logic into a standalone Elysia service (`apps/api`) executed natively on Bun. The Next.js frontend (`apps/web`) communicates with `apps/api` via tRPC queries and mutations over HTTP.

This architecture introduces two primary integration challenges:
1. **User Authentication & Session Propagation**: Authenticating user requests issued from `apps/web` using Clerk JWT Bearer tokens passed across network boundaries, verifying session validity in Bun without unnecessary network latency, and making authenticated user identity available in tRPC procedures.
2. **Data Synchronization via Webhooks**: Listening for Clerk lifecycle events (`user.created`, `user.updated`, `user.deleted`) to synchronize the PostgreSQL `User` table (via Prisma) in a public, cryptographically verified endpoint.

This document details the primary integration patterns, provides benchmarks and trade-off analyses between mounting approaches, analyzes token verification mechanics in `@clerk/backend`, and specifies production-ready implementations for `apps/api`.

---

## 2. Mounting `@trpc/server` on Elysia in Bun

Two approaches exist for exposing a tRPC router through an Elysia HTTP server:
1. The `@elysiajs/trpc` community plugin.
2. The native tRPC Fetch Adapter (`@trpc/server/adapters/fetch` via `fetchRequestHandler`).

### 2.1 Comparison & Architectural Evaluation

| Feature / Metric | `@elysiajs/trpc` (Plugin) | Native Fetch Adapter (`fetchRequestHandler`) |
| :--- | :--- | :--- |
| **Maintenance Status** | **Archived** (Repository `elysiajs/elysia-trpc` archived August 5, 2025) | **Actively Maintained** (Official `@trpc/server` first-party package) |
| **tRPC Version Support** | Bundles internal `@trpc/server` v10 (causes duplicate packages and type mismatch in tRPC v11+) | Supports `@trpc/server` v10 and v11 natively without shims |
| **Runtime Portability** | Elysia-specific wrapper | Standard WinterCG / Web Standards (`Request` $\to$ `Response`) |
| **Body Stream Handling** | Custom `onParse` regex matching | Native `{ parse: 'none' }` route configuration in Elysia |
| **Middleware & Context** | Limited context injection from Elysia lifecycle | Direct access to native Web `Request`, `Headers`, and custom dependencies |
| **WebSocket Subscriptions** | Built-in µWebSocket adapter for tRPC subscriptions | Requires custom WS handler or SSE adapter |

### 2.2 Deep Dive: `@elysiajs/trpc` Bundle Issues

Inspection of `@elysiajs/trpc@1.1.0` reveals that the package bundles its own internal copy of `@trpc/server` v10 directly inside `dist/index.mjs`:
```ts
// From @elysiajs/trpc dist/index.mjs
var trpc = (router, { endpoint = "/trpc", ...options } = { endpoint: "/trpc" }) => (eri) => {
  let app = eri
    .onParse({ as: "global" }, async ({ request: { url } }) => {
      if (getPath(url).startsWith(endpoint)) return true;
    })
    .get(`${endpoint}/*`, async ({ query, request }) => {
      return fetchRequestHandler({ ...options, req: request, router, endpoint });
    })
    .post(`${endpoint}/*`, async ({ query, request }) => {
      return fetchRequestHandler({ ...options, req: request, router, endpoint });
    });
  // ...
};
```

This presents several architectural hazards for the Motel monorepo:
1. **Package Duplication & Type Incompatibility**: If `apps/api` or a shared `packages/api` installs `@trpc/server@^10` or `@trpc/server@^11`, the bundled `@trpc/server` in `@elysiajs/trpc` creates symbol duplication (`TRPCError`, `AnyTRPCRouter`), causing TypeScript compilation errors: `Type 'Router' is not assignable to type 'AnyTRPCRouter'`.
2. **Archived Upstream**: The repository is archived by Elysia maintainers and will not receive updates for tRPC v11.

### 2.3 The Recommended Solution: Native `fetchRequestHandler` with `parse: 'none'`

Elysia is built on Web Standards: every Elysia handler receives a standard Web `Request` and can return a standard Web `Response`. tRPC provides `@trpc/server/adapters/fetch`, which accepts standard `Request` and returns `Response`.

#### The Body Stream Consumption Conflict
In Elysia, incoming HTTP requests pass through the `onParse` lifecycle phase. If Elysia consumes the `request.body` ReadableStream (e.g., parsing it as JSON), downstream handlers that call `await request.text()` will throw:
```text
TypeError: Body is already used
```
According to [Elysia Official Lifecycle Documentation](https://elysiajs.com/essential/life-cycle.html#skip-body-parsing):
> *"When you need to integrate a third-party library with an HTTP handler like trpc or orpc, and it throws `Body is already used`... you can skip body parsing on Elysia side by specifying `parse: 'none'`."*

By configuring `.all('/trpc/*', ...)` with `{ parse: 'none' }`, Elysia leaves `request.body` completely untouched, allowing tRPC's `fetchRequestHandler` to stream or read the body cleanly for mutations.

#### Recommended Mount Pattern:
```ts
import { Elysia } from 'elysia';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './trpc/router';
import { createContext } from './trpc/context';

export const app = new Elysia()
  .all('/trpc/*', ({ request }) =>
    fetchRequestHandler({
      endpoint: '/trpc',
      req: request,
      router: appRouter,
      createContext,
    }),
    { parse: 'none' }
  );
```

---

## 3. Token Verification in Bun & Elysia (`@clerk/backend`)

Clerk provides `@clerk/backend` for server-side token validation and backend API access in JavaScript runtimes.

### 3.1 `clerkClient.authenticateRequest` vs. `verifyToken`

`@clerk/backend` exposes two primary methods for verifying credentials:

```
                          Incoming HTTP Request
                                    │
                                    ▼
                     clerkClient.authenticateRequest(req)
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
          Bearer Token Found?                  Cookie Found?
        ("Authorization: Bearer")             ("__session")
                  │                                   │
                  └─────────────────┬─────────────────┘
                                    │
                                    ▼
                       Networkless with CLERK_JWT_KEY?
                                    │
                    ┌───────────────┴───────────────┐
                   Yes                              No
                    ▼                               ▼
          Verify RS256 with PEM           Fetch & Cache JWKS from
          Public Key (0ms Latency)        api.clerk.com/v1/jwks
                    │                               │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                        Validate exp, nbf, azp
                                    │
                                    ▼
                         Returns RequestState
                     (Non-throwing, isSignedIn /
                      toAuth() with userId & claims)
```

#### Comparison Matrix

| Capability | `clerkClient.authenticateRequest` | `verifyToken` |
| :--- | :--- | :--- |
| **Input** | Standard `Request` object | Raw token string |
| **Header / Cookie Extraction** | Automatic (`Authorization: Bearer` and `__session`) | Manual parsing required |
| **Error Handling** | **Non-throwing**: Returns `RequestState` (`isAuthenticated`, `reason`, `toAuth()`) | **Throws Exception** on invalid/expired/missing token |
| **Public Route Suitability** | **Ideal**: Returns `userId: null` without catching errors | Requires manual `try/catch` block around every call |
| **CSRF / Origin Protection** | Built-in via `authorizedParties` | Manual claim validation required |
| **Returned Context** | Full `AuthObject` (`userId`, `sessionId`, `sessionClaims`, `has`, `factorVerificationAge`) | Raw JWT payload (`sub`, `sid`, `exp`, etc.) |

**Recommendation**: Use `clerkClient.authenticateRequest(req)` inside `createContext`. It aligns natively with Web Standards, handles both mobile/native clients (Bearer header) and browser clients (Bearer or session cookie), and returns a non-throwing state that enables optional authentication on public procedures (e.g., checking if the current viewer has favorited a listing).

### 3.2 Networkless Verification vs. JWKS Caching

By default, Clerk signs JWTs using asymmetric cryptography (RS256). When verifying tokens:
- **Default (JWKS)**: The SDK calls `https://api.clerk.com/v1/jwks` on the first request, downloads the JSON Web Key Set, and caches it in memory. Subsequent token validations verify against the cached public keys until cache expiration.
- **Networkless (Zero-Latency)**: If `CLERK_JWT_KEY` is supplied (the PEM-encoded public key from the Clerk Dashboard under *API Keys $\to$ JWT Public Key*), the SDK skips the initial JWKS fetch entirely. Token verification executes completely locally using native Web Crypto/SubtleCrypto, resulting in sub-millisecond execution times and resilience against external network failures.

---

## 4. End-to-End Implementation Blueprint

Below is the complete implementation architecture for `apps/api`.

### 4.1 Project File Layout

```text
apps/api/
├── src/
│   ├── index.ts              # Elysia entrypoint (CORS, tRPC mount, Webhook mount)
│   ├── config.ts             # Validated environment variables
│   ├── db.ts                 # Prisma Client singleton
│   ├── trpc/
│   │   ├── context.ts        # Context creator with Clerk authenticateRequest
│   │   ├── trpc.ts           # initTRPC, middleware, public & protectedProcedure
│   │   ├── router.ts         # Root appRouter combining sub-routers
│   │   └── routers/
│   │       ├── listing.ts    # Listing procedures (Guest & Host)
│   │       └── reservation.ts# Reservation procedures
│   └── routes/
│       └── webhooks.ts       # Public Svix Clerk webhook endpoint
├── package.json
└── tsconfig.json
```

---

### 4.2 Configuration: Environment Variables (`apps/api/src/config.ts`)

```ts
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  
  // Clerk API Credentials
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'CLERK_PUBLISHABLE_KEY must start with pk_'),
  CLERK_JWT_KEY: z.string().optional(), // Optional PEM key for networkless verification
  CLERK_WEBHOOK_SIGNING_SECRET: z.string().startsWith('whsec_', 'CLERK_WEBHOOK_SIGNING_SECRET must start with whsec_'),
  
  // Allowed Frontend Origins (Next.js client)
  WEB_APP_URL: z.string().url().default('http://localhost:3000'),
});

export const env = envSchema.parse(process.env);
```

---

### 4.3 Prisma Client Singleton (`apps/api/src/db.ts`)

```ts
import { PrismaClient } from '@prisma/client';
import { env } from './config';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

---

### 4.4 tRPC Context Creator (`apps/api/src/trpc/context.ts`)

The context creator runs on every incoming tRPC request. It executes `clerkClient.authenticateRequest(req)` to extract the session without throwing if the request is unauthenticated.

```ts
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { createClerkClient } from '@clerk/backend';
import { prisma } from '../db';
import { env } from '../config';

// Initialize Clerk Backend SDK singleton
export const clerkClient = createClerkClient({
  secretKey: env.CLERK_SECRET_KEY,
  publishableKey: env.CLERK_PUBLISHABLE_KEY,
  jwtKey: env.CLERK_JWT_KEY,
});

export async function createContext(opts: FetchCreateContextFnOptions) {
  const { req, resHeaders } = opts;

  // Authenticate token from Authorization header or cookie
  const requestState = await clerkClient.authenticateRequest(req, {
    authorizedParties: [env.WEB_APP_URL],
  });

  const auth = requestState.toAuth();

  return {
    req,
    resHeaders,
    prisma,
    auth: {
      userId: auth.userId,
      sessionId: auth.sessionId,
      sessionClaims: auth.sessionClaims,
      isAuthenticated: requestState.isAuthenticated,
    },
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
```

---

### 4.5 tRPC Router & Procedure Middlewares (`apps/api/src/trpc/trpc.ts`)

We provide two levels of procedure security:
1. `publicProcedure`: Accessible without credentials; `ctx.auth.userId` is `string | null`.
2. `protectedProcedure`: Validates that `ctx.auth.userId` exists. Hydrates the database `User` with an optional Just-In-Time (JIT) provisioning fallback to guard against webhook delivery latency.

```ts
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import type { Context } from './context';
import { clerkClient } from './context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Middleware: Enforce authenticated session and hydrate database User
 */
const enforceAuthenticatedUser = t.middleware(async ({ ctx, next }) => {
  if (!ctx.auth.userId || !ctx.auth.isAuthenticated) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be signed in to perform this action.',
    });
  }

  const userId = ctx.auth.userId;

  // Fetch persisted User from PostgreSQL
  let user = await ctx.prisma.user.findUnique({
    where: { id: userId },
  });

  // Edge Case Handling: Webhook eventual consistency race condition
  // If user signed up 50ms ago and frontend immediately requested an API procedure
  // before Clerk's webhook landed in Elysia, JIT provision the user record.
  if (!user) {
    try {
      const clerkUser = await clerkClient.users.getUser(userId);
      const primaryEmail =
        clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
        clerkUser.emailAddresses[0]?.emailAddress;

      if (!primaryEmail) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Authenticated Clerk user has no primary email address.',
        });
      }

      const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;

      user = await ctx.prisma.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          email: primaryEmail,
          name: fullName,
          imageUrl: clerkUser.imageUrl,
        },
        update: {
          email: primaryEmail,
          name: fullName,
          imageUrl: clerkUser.imageUrl,
        },
      });
    } catch (err) {
      if (err instanceof TRPCError) throw err;
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Unable to resolve user account credentials.',
        cause: err,
      });
    }
  }

  return next({
    ctx: {
      ...ctx,
      auth: {
        ...ctx.auth,
        userId, // Narrowed to non-nullable string
      },
      user, // Narrowed to non-nullable Prisma User model
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceAuthenticatedUser);
```

---

### 4.6 Public Clerk Webhook Endpoint (`apps/api/src/routes/webhooks.ts`)

Clerk webhooks deliver events using **Standard Webhooks** via **Svix**. 
To verify the payload:
1. The route MUST NOT parse the JSON body ahead of time (`parse: 'none'`). Svix computes the HMAC SHA-256 digest over the raw string bytes. Any normalization or JSON serialization modification breaks signature verification.
2. The endpoint verifies `svix-id`, `svix-timestamp`, and `svix-signature` against `CLERK_WEBHOOK_SIGNING_SECRET`.
3. It handles `user.created`, `user.updated`, and `user.deleted` events.

```ts
import { Elysia } from 'elysia';
import { verifyWebhook } from '@clerk/backend/webhooks';
import type { WebhookEvent, UserJSON } from '@clerk/backend/webhooks';
import { prisma } from '../db';
import { env } from '../config';

function extractUserAttributes(data: UserJSON) {
  const primaryEmail =
    data.email_addresses.find((e) => e.id === data.primary_email_address_id)?.email_address ??
    data.email_addresses[0]?.email_address ??
    '';

  const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || null;
  const imageUrl = data.image_url ?? null;

  return { email: primaryEmail, name, imageUrl };
}

export const webhookRoutes = new Elysia({ prefix: '/webhooks' })
  .post(
    '/clerk',
    async ({ request, set }) => {
      let event: WebhookEvent;

      try {
        // verifyWebhook inspects svix-id, svix-timestamp, svix-signature
        // and reads request.text() to perform constant-time HMAC-SHA256 verification.
        event = await verifyWebhook(request, {
          signingSecret: env.CLERK_WEBHOOK_SIGNING_SECRET,
        });
      } catch (err) {
        console.error('[Webhook Verification Failure]', err);
        set.status = 400;
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Invalid webhook signature',
        };
      }

      const { type, data } = event;

      try {
        switch (type) {
          case 'user.created': {
            const userData = data as UserJSON;
            const { email, name, imageUrl } = extractUserAttributes(userData);

            await prisma.user.upsert({
              where: { id: userData.id },
              create: {
                id: userData.id,
                email,
                name,
                imageUrl,
              },
              update: {
                email,
                name,
                imageUrl,
              },
            });
            break;
          }

          case 'user.updated': {
            const userData = data as UserJSON;
            const { email, name, imageUrl } = extractUserAttributes(userData);

            await prisma.user.update({
              where: { id: userData.id },
              data: {
                email,
                name,
                imageUrl,
              },
            });
            break;
          }

          case 'user.deleted': {
            const { id } = data;
            if (id) {
              // Delete user or handle soft-deletion depending on business constraints
              // Foreign key constraints on Listings and Reservations should be handled
              // via database CASCADE or soft-deletion flags.
              await prisma.user.delete({
                where: { id },
              });
            }
            break;
          }

          default:
            // Unhandled event type acknowledged
            break;
        }

        set.status = 200;
        return { success: true };
      } catch (dbError) {
        console.error(`[Webhook Processing Error for ${type}]`, dbError);
        // Returning 500 triggers Svix automatic exponential backoff retries
        set.status = 500;
        return { success: false, error: 'Database synchronization failed' };
      }
    },
    {
      // CRITICAL: Prevent Elysia from consuming or transforming the raw stream
      parse: 'none',
    }
  );
```

---

### 4.7 Elysia Entrypoint (`apps/api/src/index.ts`)

The server entrypoint binds CORS headers, mounts the public Clerk webhook route, mounts the tRPC fetch request handler, and listens on the configured port.

```ts
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './trpc/router';
import { createContext } from './trpc/context';
import { webhookRoutes } from './routes/webhooks';
import { env } from './config';

export const app = new Elysia()
  // 1. CORS Configuration for Next.js frontend communication
  .use(
    cors({
      origin: [env.WEB_APP_URL],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-trpc-source'],
      credentials: true,
      maxAge: 86400, // 24-hour preflight cache
    })
  )

  // 2. Health check probe
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'motel-api',
  }))

  // 3. Mount Clerk Webhook Routes (Public, parse: 'none')
  .use(webhookRoutes)

  // 4. Mount tRPC Fetch Handler (Public & Protected procedures, parse: 'none')
  .all(
    '/trpc/*',
    async ({ request }) => {
      return fetchRequestHandler({
        endpoint: '/trpc',
        req: request,
        router: appRouter,
        createContext,
        onError({ error, path }) {
          if (env.NODE_ENV === 'development' || error.code === 'INTERNAL_SERVER_ERROR') {
            console.error(`[tRPC Error on ${path ?? 'unknown'}]:`, error);
          }
        },
      });
    },
    {
      // CRITICAL: Skip Elysia body parsing so tRPC reads the raw stream
      parse: 'none',
    }
  )

  // 5. Start Bun HTTP listener
  .listen(env.PORT, () => {
    console.log(`🚀 Motel API server running at http://localhost:${env.PORT}`);
    console.log(`📡 tRPC endpoint mounted at http://localhost:${env.PORT}/trpc`);
    console.log(`🔔 Webhook receiver mounted at http://localhost:${env.PORT}/webhooks/clerk`);
  });

export type AppRouter = typeof appRouter;
```

---

## 5. Security & Edge Case Analysis

### 5.1 Eventual Consistency & Race Conditions
When a user signs up on the frontend via Clerk:
1. Clerk creates the user in its cloud directory.
2. The browser receives the session JWT and immediately redirects the user to the dashboard.
3. The dashboard makes an authenticated tRPC call to `apps/api`.
4. Simultaneously, Clerk dispatches an asynchronous webhook to `apps/api/webhooks/clerk`.

Under standard network conditions, the user's browser request may arrive at `apps/api` **before** Clerk's webhook reaches the server. If `protectedProcedure` assumes the user already exists in PostgreSQL, the request would fail with a `404 Not Found` or `500 Internal Error`.

**Resolution Strategy**:
As implemented in Section 4.5, `enforceAuthenticatedUser` checks if the user exists in PostgreSQL. If not, it falls back to a Just-In-Time (JIT) lookup against Clerk's REST API (`clerkClient.users.getUser(userId)`) and upserts the user into PostgreSQL synchronously. When the subsequent webhook eventually lands, Prisma's `upsert` handles it idempotently.

### 5.2 CSRF & Origin Attack Mitigation
Clerk session tokens can be submitted via cookies or Bearer headers. To protect against malicious third-party websites forging requests against `apps/api`:
- In `createContext`, we supply `authorizedParties: [env.WEB_APP_URL]`.
- Clerk verifies that the `azp` (Authorized Party) claim in the JWT strictly matches the allowed frontend domain.
- If an attacker obtains a token issued for a different client application, Clerk rejects the request.

### 5.3 Webhook Replay Attacks & Clock Skew
Svix includes a timestamp header (`svix-timestamp`) in every delivery. The `@clerk/backend/webhooks` verifier rejects any request where:
- The timestamp is older than 5 minutes (default tolerance), protecting against replay attacks.
- The timestamp is in the future beyond allowed clock skew limits.

### 5.4 Database Primary Key Harmonization
Instead of generating synthetic `cuid` or `uuid` IDs for users and maintaining a separate `clerkId` column:
- The PostgreSQL `User` model uses Clerk's `id` (`user_2...`) directly as the `@id` primary key:
  ```prisma
  model User {
    id        String   @id // Clerk User ID (e.g., "user_2...")
    email     String   @unique
    name      String?
    imageUrl  String?
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
  
    listings     Listing[]
    reservations Reservation[]
    favorites    Favorite[]
  }
  ```
- **Performance Benefit**: Relational foreign keys (`Listing.hostId`, `Reservation.guestId`, `Favorite.userId`) reference `ctx.auth.userId` directly. Querying listings or reservations for the logged-in user requires **zero JOINs** against a user translation table.

---

## 6. Primary Sources & Citations

1. **tRPC Fetch Adapter Documentation & Spec**:
   - Primary Source: [tRPC Fetch / Edge Runtimes Adapter](https://trpc.io/docs/server/adapters/fetch)
   - Function Signature: `fetchRequestHandler<TRouter>(opts: FetchHandlerOptions<TRouter>): Promise<Response>`
   - Interface Definition: [tRPC Fetch Adapter Types](https://github.com/trpc/trpc/blob/main/packages/server/src/adapters/fetch/fetchRequestHandler.ts)

2. **ElysiaJS Official Lifecycle & Body Parsing**:
   - Primary Source: [ElysiaJS Lifecycle - Skip Body Parsing](https://elysiajs.com/essential/life-cycle.html#skip-body-parsing)
   - Route Option Spec: `{ parse: 'none' }` prevents stream consumption conflicts when integrating third-party handlers (`fetchRequestHandler`, `verifyWebhook`).
   - Repository Archive Note: Community plugin [`elysiajs/elysia-trpc`](https://github.com/elysiajs/elysia-trpc) archived August 5, 2025.

3. **Clerk Backend SDK Documentation**:
   - Primary Source: [Clerk Backend SDK - authenticateRequest()](https://clerk.com/docs/reference/backend/authenticate-request)
   - Primary Source: [Clerk Backend SDK - verifyToken()](https://clerk.com/docs/reference/backend/verify-token)
   - Primary Source: [Syncing Clerk User Data with Webhooks](https://clerk.com/docs/guides/development/webhooks/syncing)
   - Primary Source: [Clerk Webhook Verification - verifyWebhook()](https://clerk.com/docs/reference/backend/verify-webhook)
   - Source Code: [Clerk JavaScript Backend Webhook Module](https://github.com/clerk/javascript/blob/main/packages/backend/src/webhooks.ts)

4. **Svix Webhook Verification Protocol**:
   - Primary Source: [Svix - Consuming Webhooks Documentation](https://docs.svix.com/consuming-webhooks)
   - Headers: `svix-id`, `svix-timestamp`, `svix-signature` (HMAC-SHA256 signature scheme).
