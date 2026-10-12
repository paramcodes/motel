import { router, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import {
  searchListingsInputSchema,
  deleteListingInputSchema,
  createListingSchema,
} from '@motel/contracts';
import { z } from 'zod';

export const listingsRouter = router({
  search: publicProcedure
    .input(searchListingsInputSchema)
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.listing.findMany({
        where: {
          category: input.category,
          destination: input.destination,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          guestCount: input.guestCount,
          minPrice: input.minPrice,
          maxPrice: input.maxPrice,
        },
        limit: input.limit + 1,
        cursor: input.cursor,
      });

      let nextCursor: string | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return { items, nextCursor };
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({ where: { id: input.id } });
      if (!listing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Listing not found' });
      }
      return listing;
    }),

  create: protectedProcedure
    .input(createListingSchema)
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.create({
        data: {
          ...input,
          region: input.region ?? null,
          city: input.city ?? null,
          address: input.address ?? null,
          latitude: input.latitude ?? null,
          longitude: input.longitude ?? null,
          hostId: ctx.auth.user.id,
        },
      });
      return listing;
    }),

  delete: protectedProcedure
    .input(deleteListingInputSchema)
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({ where: { id: input.id } });
      if (!listing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Listing not found' });
      }

      if (listing.hostId !== ctx.auth.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not authorized to delete this listing',
        });
      }

      const activeReservations = await ctx.db.reservation.findMany({
        where: { listingId: input.id },
      });

      const hasUpcoming = activeReservations.some(
        (r) => r.status === 'CONFIRMED' && new Date(r.endDate) >= new Date()
      );

      if (hasUpcoming) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Cannot delete a listing with active or upcoming reservations',
        });
      }

      await ctx.db.listing.delete({ where: { id: input.id } });
      return { success: true, id: input.id };
    }),
});
