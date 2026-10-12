# Research Bun Elysia tRPC Adapter and Clerk Authentication Bridge

Type: research
Status: open
Blocked by: 

## Question

How should Elysia mount `@trpc/server` in Bun (`apps/api`), extract the Clerk JWT Bearer token from incoming HTTP headers, validate the session via `@clerk/backend`, inject authenticated `User` context into protected tRPC procedures, and expose public endpoints for Clerk webhook user synchronizations?
