# Reservation Concurrency and Availability Filtering tRPC Router Contracts Specification

## Executive Summary

This specification locks the formal tRPC router signatures, input/output Zod schemas, mutation concurrency controls, error classifications, and authorization rules across the `apps/api` and `apps/web` boundary, resolving **Ticket 06** ([`06-reservation-concurrency-availability-contracts.md`](../../.scratch/airbnb-clone/issues/06-reservation-concurrency-availability-contracts.md)).

---

## 1. Concurrency Architecture & Exclusion Guarantees

### 1.1 Storage-Level Invariant
Reservations are protected at the PostgreSQL engine level using a **GiST exclusion constraint** with discrete half-open date intervals $[startDate, endDate)$:
```sql
ALTER TABLE "Reservation"
ADD CONSTRAINT "reservation_no_overlapping_confirmed"
EXCLUDE USING gist (
  "listingId" WITH =,
  daterange("startDate", "endDate", '[)') WITH &&
)
WHERE (status = 'CONFIRMED');
```

### 1.2 tRPC Concurrency Error Classification
When two concurrent requests attempt to reserve overlapping dates:
1. Transaction 1 acquires the index tuple.
2. Transaction 2 is paused at the PostgreSQL engine level.
3. If Transaction 1 commits, Transaction 2 immediately fails with SQLSTATE `23P01` (`exclusion_violation`).
4. The tRPC mutation catches this violation using `isReservationExclusionViolation` and maps it directly to a standard `TRPCError({ code: 'CONFLICT' })` (HTTP 409):

```typescript
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';

export function isReservationExclusionViolation(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return true;
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('23p01') ||
      msg.includes('exclusion_violation') ||
      msg.includes('reservation_no_overlapping_confirmed') ||
      msg.includes('conflicts with existing key')
    );
  }
  return false;
}
```

---

## 2. tRPC Router Contracts (`packages/contracts`)

```typescript
import { z } from 'zod';
import { createListingSchema } from './05-listing-creation-wizard-contracts';

// ============================================================================
// LISTINGS ROUTER CONTRACTS
// ============================================================================

export const searchListingsInputSchema = z.object({
  category: z.string().optional(),
  destination: z.string().optional(),
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
  guestCount: z.number().int().min(1).optional(),
  minPrice: z.number().int().min(0).optional(),
  maxPrice: z.number().int().optional(),
  limit: z.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export type SearchListingsInput = z.infer<typeof searchListingsInputSchema>;

export const deleteListingInputSchema = z.object({
  id: z.string().cuid(),
});

export type DeleteListingInput = z.infer<typeof deleteListingInputSchema>;

// ============================================================================
// RESERVATIONS ROUTER CONTRACTS
// ============================================================================

export const createReservationInputSchema = z.object({
  listingId: z.string().cuid(),
  startDate: z.coerce.date({ required_error: 'Check-in date is required' }),
  endDate: z.coerce.date({ required_error: 'Check-out date is required' }),
  totalPrice: z.number().int().positive('Total price must be positive'),
}).refine(
  (data) => data.startDate < data.endDate,
  {
    message: 'Check-out date must be strictly after check-in date',
    path: ['endDate'],
  }
);

export type CreateReservationInput = z.infer<typeof createReservationInputSchema>;

export const cancelReservationInputSchema = z.object({
  id: z.string().cuid(),
});

export type CancelReservationInput = z.infer<typeof cancelReservationInputSchema>;

// ============================================================================
// FAVORITES ROUTER CONTRACTS
// ============================================================================

export const toggleFavoriteInputSchema = z.object({
  listingId: z.string().cuid(),
});

export type ToggleFavoriteInput = z.infer<typeof toggleFavoriteInputSchema>;

export const toggleFavoriteOutputSchema = z.object({
  listingId: z.string().cuid(),
  isFavorited: z.boolean(),
});

export type ToggleFavoriteOutput = z.infer<typeof toggleFavoriteOutputSchema>;
```

---

## 3. Router Procedure Implementations (`apps/api`)

### 3.1 Listings Procedures

```typescript
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import {
  searchListingsInputSchema,
  deleteListingInputSchema,
  createListingSchema,
} from '@motel/contracts';

export const listingsRouter = router({
  // 1. listings.search (Public cursor-paginated discovery)
  search: publicProcedure
    .input(searchListingsInputSchema)
    .query(async ({ ctx, input }) => {
      const {
        category,
        destination,
        checkIn,
        checkOut,
        guestCount,
        minPrice,
        maxPrice,
        limit,
        cursor,
      } = input;

      const where: any = {};

      if (category) where.category = category;
      if (guestCount) where.guestCount = { gte: guestCount };
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = minPrice;
        if (maxPrice) where.price.lte = maxPrice;
      }
      if (destination) {
        where.OR = [
          { country: { contains: destination, mode: 'insensitive' } },
          { region: { contains: destination, mode: 'insensitive' } },
          { city: { contains: destination, mode: 'insensitive' } },
        ];
      }

      // Reservation Availability Filter (Anti-semi-join)
      if (checkIn && checkOut) {
        where.reservations = {
          none: {
            status: 'CONFIRMED',
            startDate: { lt: checkOut },
            endDate: { gt: checkIn },
          },
        };
      }

      const items = await ctx.prisma.listing.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });

      let nextCursor: string | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return { items, nextCursor };
    }),

  // 2. listings.create (Protected atomic publish from wizard)
  create: protectedProcedure
    .input(createListingSchema)
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.listing.create({
        data: {
          ...input,
          hostId: ctx.auth.userId,
        },
      });
      return listing;
    }),

  // 3. listings.delete (Protected host deletion with precondition guard)
  delete: protectedProcedure
    .input(deleteListingInputSchema)
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.listing.findUnique({
        where: { id: input.id },
        include: {
          reservations: {
            where: {
              status: 'CONFIRMED',
              endDate: { gte: new Date() },
            },
          },
        },
      });

      if (!listing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Listing not found' });
      }

      if (listing.hostId !== ctx.auth.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not authorized to delete this listing',
        });
      }

      if (listing.reservations.length > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Cannot delete a listing with active or upcoming reservations',
        });
      }

      await ctx.prisma.listing.delete({ where: { id: input.id } });
      return { success: true, id: input.id };
    }),
});
```

---

### 3.2 Reservations Procedures

```typescript
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import {
  createReservationInputSchema,
  cancelReservationInputSchema,
} from '@motel/contracts';
import { isReservationExclusionViolation } from '../utils/errors';

export const reservationsRouter = router({
  // 4. reservations.create (Protected atomic booking with GiST conflict translation)
  create: protectedProcedure
    .input(createReservationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { listingId, startDate, endDate, totalPrice } = input;

      const listing = await ctx.prisma.listing.findUnique({
        where: { id: listingId },
      });

      if (!listing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Listing not found' });
      }

      if (listing.hostId === ctx.auth.userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Hosts cannot reserve their own listing',
        });
      }

      try {
        const reservation = await ctx.prisma.reservation.create({
          data: {
            listingId,
            userId: ctx.auth.userId,
            startDate,
            endDate,
            totalPrice,
            status: 'CONFIRMED',
          },
        });
        return reservation;
      } catch (error) {
        if (isReservationExclusionViolation(error)) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'The selected dates are no longer available. Another guest has reserved them.',
          });
        }
        throw error;
      }
    }),

  // 5. reservations.cancel (Protected guest/host soft cancellation)
  cancel: protectedProcedure
    .input(cancelReservationInputSchema)
    .mutation(async ({ ctx, input }) => {
      const reservation = await ctx.prisma.reservation.findUnique({
        where: { id: input.id },
        include: { listing: true },
      });

      if (!reservation) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Reservation not found' });
      }

      const isGuest = reservation.userId === ctx.auth.userId;
      const isHost = reservation.listing.hostId === ctx.auth.userId;

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

      const updated = await ctx.prisma.reservation.update({
        where: { id: input.id },
        data: { status: 'CANCELLED' },
      });

      return updated;
    }),
});
```

---

### 3.3 Favorites Procedures

```typescript
import { router, protectedProcedure } from '../trpc';
import {
  toggleFavoriteInputSchema,
  toggleFavoriteOutputSchema,
} from '@motel/contracts';

export const favoritesRouter = router({
  // 6. favorites.toggle (Protected atomic toggle for optimistic UI updates)
  toggle: protectedProcedure
    .input(toggleFavoriteInputSchema)
    .output(toggleFavoriteOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const listingId = input.listingId;

      const existing = await ctx.prisma.favorite.findUnique({
        where: {
          userId_listingId: { userId, listingId },
        },
      });

      if (existing) {
        await ctx.prisma.favorite.delete({
          where: {
            userId_listingId: { userId, listingId },
          },
        });
        return { listingId, isFavorited: false };
      } else {
        await ctx.prisma.favorite.create({
          data: { userId, listingId },
        });
        return { listingId, isFavorited: true };
      }
    }),
});
```

---

## 4. Error Code Mapping Matrix

| Scenario | HTTP Status | tRPC Error Code | Client Handling Strategy |
| :--- | :---: | :--- | :--- |
| **Double-booking collision** | `409` | `CONFLICT` | Show inline date collision banner; re-fetch listing disabled dates |
| **Unauthenticated session** | `401` | `UNAUTHORIZED` | Open Clerk modal sign-in sheet |
| **Host deletes listing with active stays** | `412` | `PRECONDITION_FAILED` | Show alert dialog explaining existing upcoming guest reservations |
| **Unauthorized deletion/cancellation** | `403` | `FORBIDDEN` | Show toast: "You do not have permission" |
| **Listing / Reservation not found** | `404` | `NOT_FOUND` | Redirect to 404 page or listing feed |
| **Host books own listing** | `400` | `BAD_REQUEST` | Form validation error: "Cannot book your own property" |
