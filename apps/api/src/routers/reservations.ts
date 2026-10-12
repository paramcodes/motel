import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import {
  createReservationInputSchema,
  cancelReservationInputSchema,
  isReservationExclusionViolation,
} from '@motel/contracts';

export const reservationsRouter = router({
  create: protectedProcedure
    .input(createReservationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { listingId, startDate, endDate, totalPrice } = input;

      const listing = await ctx.db.listing.findUnique({ where: { id: listingId } });
      if (!listing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Listing not found' });
      }

      if (listing.hostId === ctx.auth.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Hosts cannot reserve their own listing',
        });
      }

      try {
        const reservation = await ctx.db.reservation.create({
          data: {
            listingId,
            userId: ctx.auth.user.id,
            startDate,
            endDate,
            totalPrice,
            status: 'CONFIRMED',
          },
        });
        return reservation;
      } catch (error: unknown) {
        if (isReservationExclusionViolation(error)) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'The selected dates are no longer available. Another guest has reserved them.',
          });
        }
        const msg = error instanceof Error ? error.message : String(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create reservation: ${msg}`,
        });
      }
    }),

  myReservations: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.reservation.findMany({
      where: { userId: ctx.auth.user.id },
    });
  }),

  cancel: protectedProcedure
    .input(cancelReservationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const reservation = await ctx.db.reservation.findUnique({
        where: { id: input.id },
      });

      if (!reservation) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Reservation not found' });
      }

      const listing = await ctx.db.listing.findUnique({
        where: { id: reservation.listingId },
      });

      const isGuest = reservation.userId === ctx.auth.user.id;
      const isHost = listing?.hostId === ctx.auth.user.id;

      if (!isGuest && !isHost) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to cancel this reservation',
        });
      }

      if (reservation.status === 'CANCELLED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This reservation is already cancelled',
        });
      }

      return ctx.db.reservation.update({
        where: { id: input.id },
        data: { status: 'CANCELLED' },
      });
    }),
});
