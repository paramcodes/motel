import { describe, it, expect } from 'bun:test';
import { app } from '../apps/api/src/index';
import { db } from '../packages/db/src/index';

describe('Motel End-to-End Concurrency & Verification Suite', () => {
  it('should verify health endpoint', async () => {
    const res = await app.handle(new Request('http://localhost:3001/health'));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe('ok');
  });

  it('should search listings by category', async () => {
    const url = 'http://localhost:3001/trpc/listings.search?batch=1&input=%7B%220%22%3A%7B%22category%22%3A%22Beachfront%22%7D%7D';
    const res = await app.handle(new Request(url));
    expect(res.status).toBe(200);
    const data = (await res.json()) as Array<{ result: { data: { items: Array<{ category: string }> } } }>;
    expect(data[0].result.data.items.length).toBeGreaterThan(0);
    expect(data[0].result.data.items[0].category).toBe('Beachfront');
  });

  it('should handle parallel concurrent reservation requests with GiST exclusion conflict', async () => {
    const listings = await db.listing.findMany({ limit: 1 });
    const randomYear = 2030 + Math.floor(Math.random() * 500);
    const startDate = `${randomYear}-09-10`;
    const endDate = `${randomYear}-09-15`;
    const listingId = listings[0].id;
    const makeBookingRequest = (guestId: string) => {
      const url = 'http://localhost:3001/trpc/reservations.create?batch=1';
      return app.handle(
        new Request(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${guestId}`,
          },
          body: JSON.stringify({
            '0': {
              listingId,
              startDate,
              endDate,
              totalPrice: 1500,
            },
          }),
        })
      );
    };

    // Fire 2 concurrent requests simultaneously
    const [res1, res2] = await Promise.all([
      makeBookingRequest('user_concurrent_guest_A'),
      makeBookingRequest('user_concurrent_guest_B'),
    ]);

    const statuses = [res1.status, res2.status];
    console.log('[E2E Concurrency] Concurrent reservation HTTP status codes:', statuses);

    // Exactly one must succeed (200) and one must conflict (409)
    expect(statuses).toContain(200);
    expect(statuses).toContain(409);
  });
});
