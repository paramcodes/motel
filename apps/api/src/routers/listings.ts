import {
  createListingSchema,
  deleteListingInputSchema,
  searchListingsInputSchema,
} from '@motel/contracts';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../trpc';

export const listingsRouter = router({
  search: publicProcedure.input(searchListingsInputSchema).query(async ({ ctx, input }) => {
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

    let nextCursor: string | undefined;
    if (items.length > input.limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id;
    }

    return { items, nextCursor };
  }),

  byId: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const listing = await ctx.db.listing.findUnique({ where: { id: input.id } });
    if (!listing) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Listing not found' });
    }
    return listing;
  }),

  create: protectedProcedure.input(createListingSchema).mutation(async ({ ctx, input }) => {
    const listing = await ctx.db.listing.create({
      data: {
        hostId: ctx.auth.user.id,
        title: input.title,
        description: input.description,
        category: input.category,
        country: input.country,
        region: input.region ?? null,
        city: input.city ?? null,
        address: input.address ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        guestCount: input.guestCount,
        roomCount: input.roomCount,
        bathroomCount: input.bathroomCount,
        imageSrc: input.imageSrc,
        images: input.images,
        amenities: input.amenities,
        price: input.price,
      },
    });
    return listing;
  }),

  delete: protectedProcedure.input(deleteListingInputSchema).mutation(async ({ ctx, input }) => {
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
      (r) => r.status === 'CONFIRMED' && new Date(r.endDate) >= new Date(),
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
