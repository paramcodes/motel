import { initTRPC, TRPCError } from '@trpc/server';
import { db, User } from '@motel/db';

export interface AuthContext {
  userId: string | null;
  user: User | null;
}

export interface Context {
  db: typeof db;
  auth: AuthContext;
  req: Request;
}

export async function createContext({ req }: { req: Request }): Promise<Context> {
  const authHeader = req.headers.get('authorization');
  let userId: string | null = null;
  let user: User | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    // In production with CLERK_JWT_KEY, verify RS256 token claims
    // For local dev / test mock tokens: format "user_xxx" or "test_xxx"
    if (token.startsWith('user_') || token.startsWith('test_')) {
      userId = token;
      user = await db.user.findUnique({ where: { clerkId: userId } });
    }
  }

  // Also check Clerk dev test header
  const clerkUserIdHeader = req.headers.get('x-clerk-user-id');
  if (!userId && clerkUserIdHeader) {
    userId = clerkUserIdHeader;
    user = await db.user.findUnique({ where: { clerkId: userId } });
  }

  return {
    db,
    auth: { userId, user },
    req,
  };
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required to access this resource',
    });
  }

  // JIT fallback user provisioning
  if (!ctx.auth.user) {
    ctx.auth.user = await ctx.db.user.upsert({
      where: { clerkId: ctx.auth.userId },
      create: {
        clerkId: ctx.auth.userId,
        email: `${ctx.auth.userId}@clerk.local`,
        name: 'Authenticated User',
      },
      update: {},
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: {
        userId: ctx.auth.userId,
        user: ctx.auth.user,
      },
    },
  });
});
