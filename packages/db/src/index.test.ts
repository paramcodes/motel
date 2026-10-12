import { describe, expect, it } from 'bun:test';
import { db } from './index';

describe('Database Layer & GiST Concurrency Controls', () => {
  it('should seed and query listings with availability filter', async () => {
    const listings = await db.listing.findMany({ limit: 5 });
    expect(listings.length).toBeGreaterThanOrEqual(1);
    expect(listings[0].id).toBeDefined();
    expect(listings[0].price).toBeGreaterThan(0);
  });

  it('should prevent overlapping confirmed reservations using GiST exclusion', async () => {
    const listing = (await db.listing.findMany({ limit: 1 }))[0];
    const user = await db.user.findUnique({ where: { clerkId: 'user_guest_demo_01' } });
    if (!user) throw new Error('Demo user not found');

    const randomYear = 2035 + Math.floor(Math.random() * 500);
    const checkIn = new Date(`${randomYear}-07-01`);
    const checkOut = new Date(`${randomYear}-07-05`);

    // Create primary reservation
    const res1 = await db.reservation.create({
      data: {
        userId: user.id,
        listingId: listing.id,
        startDate: checkIn,
        endDate: checkOut,
        totalPrice: listing.price * 4,
      },
    });
    expect(res1.id).toBeDefined();

    // Attempt overlapping reservation: 2027-07-03 to 2027-07-07
    let failedWithExclusion = false;
    try {
      await db.reservation.create({
        data: {
          userId: user.id,
          listingId: listing.id,
          startDate: new Date(`${randomYear}-07-03`),
          endDate: new Date(`${randomYear}-07-07`),
          totalPrice: listing.price * 4,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('23P01') || msg.includes('reservation_no_overlapping_confirmed')) {
        failedWithExclusion = true;
      }
    }
    expect(failedWithExclusion).toBe(true);

    // Cancel reservation to verify constraint release
    await db.reservation.update({
      where: { id: res1.id },
      data: { status: 'CANCELLED' },
    });

    // Re-attempt same dates - now succeeds because cancelled is excluded
    const res2 = await db.reservation.create({
      data: {
        userId: user.id,
        listingId: listing.id,
        startDate: checkIn,
        endDate: checkOut,
        totalPrice: listing.price * 4,
      },
    });
    expect(res2.id).toBeDefined();
  });
});
