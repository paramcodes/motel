# Coding Standards — Reviewer Judgment

Only genuine judgment calls (anything a guardrail could not enforce) live here.

## Reviewer Rules

1. **No `as any` for tRPC client links or router inference.** The `providers.tsx` `trpc.createClient` must be fully typed via `AppRouter`; `any` casts bypass router safety and must be removed.
2. **Test isolation for database fixtures.** Any test creating database objects must use isolated IDs and date ranges rather than relying on shared seed data (e.g., `user_host_demo_01`, fixed `2030-09-10` ranges). If seed users/listings are required, create them locally inside the test case.
3. **Cross-file consistency over style matching.** When a file's style conflicts with its module (e.g., relative path imports across workspace boundaries), the reviewer flags it as mechanical rather than judgment — enforce through the repository's own linter or import rules.

Mechanical checks (import shapes, banned APIs, file-location rules) belong in Biome/CI, not in this document.
