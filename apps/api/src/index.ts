import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './routers';
import { createContext } from './trpc';
import { db } from '@motel/db';

const port = Number(process.env.PORT || 3001);

export const app = new Elysia()
  .use(
    cors({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-clerk-user-id'],
    })
  )
  .get('/health', () => ({
    status: 'ok',
    service: 'motel-api',
    timestamp: new Date().toISOString(),
  }))
  // Clerk webhook handler
  .post(
    '/webhooks/clerk',
    async ({ request, set }) => {
      const svixId = request.headers.get('svix-id');
      const svixTimestamp = request.headers.get('svix-timestamp');
      const svixSignature = request.headers.get('svix-signature');

      // Verify webhook payload or handle local sync
      const body = (await request.json()) as {
        type?: string;
        data?: {
          id: string;
          email_addresses?: Array<{ email_address: string }>;
          first_name?: string;
          last_name?: string;
          image_url?: string;
        };
      };

      if (body.type === 'user.created' || body.type === 'user.updated') {
        const data = body.data;
        if (data) {
          const email = data.email_addresses?.[0]?.email_address || `${data.id}@clerk.local`;
          const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || 'Motel User';
          await db.user.upsert({
            where: { clerkId: data.id },
            create: { clerkId: data.id, email, name, imageUrl: data.image_url || null },
            update: { email, name, imageUrl: data.image_url || null },
          });
        }
      } else if (body.type === 'user.deleted' && body.data) {
        await db.user.delete({ where: { clerkId: body.data.id } });
      }

      set.status = 200;
      return { received: true };
    },
    { parse: 'none' }
  )
  // Mount tRPC Fetch Request Handler
  .all(
    '/trpc/*',
    async ({ request }) => {
      return fetchRequestHandler({
        endpoint: '/trpc',
        req: request,
        router: appRouter,
        createContext,
        onError: ({ path, error }) => {
          if (error.code === 'INTERNAL_SERVER_ERROR') {
            console.error(`[tRPC Error at ${path}]`, error);
          }
        },
      });
    },
    { parse: 'none' }
  );

if (import.meta.main) {
  app.listen(port, () => {
    console.log(`[Motel API] Elysia + tRPC server running at http://localhost:${port}`);
  });
}
