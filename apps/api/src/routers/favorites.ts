import { toggleFavoriteInputSchema, toggleFavoriteOutputSchema } from '@motel/contracts';
import { protectedProcedure, router } from '../trpc';

export const favoritesRouter = router({
  toggle: protectedProcedure
    .input(toggleFavoriteInputSchema)
    .output(toggleFavoriteOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;
      const listingId = input.listingId;

      const existing = await ctx.db.favorite.findUnique({
        where: { userId_listingId: { userId, listingId } },
      });

      if (existing) {
        await ctx.db.favorite.delete({
          where: { userId_listingId: { userId, listingId } },
        });
        return { listingId, isFavorited: false };
      }

      await ctx.db.favorite.create({
        data: { userId, listingId },
      });
      return { listingId, isFavorited: true };
    }),

  myFavorites: protectedProcedure.query(async ({ ctx }) => {
    const client = await ctx.db.getClient();
    const res = await client.query<{ listingId: string }>(
      'SELECT "listingId" FROM "Favorite" WHERE "userId" = $1',
      [ctx.auth.user.id],
    );
    return res.rows.map((r) => r.listingId);
  }),
});
