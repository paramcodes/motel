import { describe, it, expect } from 'bun:test';
import { app } from './index';

describe('Elysia + tRPC API Service', () => {
  it('should return health status', async () => {
    const res = await app.handle(new Request('http://localhost:3001/health'));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; service: string };
    expect(body.status).toBe('ok');
    expect(body.service).toBe('motel-api');
  });

  it('should query listings via tRPC search procedure', async () => {
    const url = 'http://localhost:3001/trpc/listings.search?batch=1&input=%7B%220%22%3A%7B%22limit%22%3A5%7D%7D';
    const res = await app.handle(new Request(url));
    expect(res.status).toBe(200);
    const data = (await res.json()) as Array<{ result: { data: { items: Array<{ id: string; title: string }> } } }>;
    expect(data[0].result.data.items.length).toBeGreaterThan(0);
  });

  it('should enforce authentication on protected procedures', async () => {
    const url = 'http://localhost:3001/trpc/listings.create?batch=1';
    const res = await app.handle(
      new Request(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '0': {
            category: 'Beachfront',
            country: 'United States',
            guestCount: 2,
            roomCount: 1,
            bathroomCount: 1,
            amenities: ['wifi'],
            imageSrc: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
            images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750'],
            title: 'Unauthenticated Beach Shack',
            description: 'This listing creation should be rejected due to lack of auth token.',
            price: 200,
          },
        }),
      })
    );
    expect(res.status).toBe(401);
  });
  it('should allow authenticated listing creation and toggle favorite', async () => {
    // Fetch a real listing
    const searchRes = await app.handle(
      new Request('http://localhost:3001/trpc/listings.search?batch=1&input=%7B%220%22%3A%7B%22limit%22%3A1%7D%7D')
    );
    const searchData = (await searchRes.json()) as Array<{ result: { data: { items: Array<{ id: string }> } } }>;
    const realListingId = searchData[0].result.data.items[0].id;

    const url = 'http://localhost:3001/trpc/favorites.toggle?batch=1';
    const res = await app.handle(
      new Request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer user_guest_demo_01',
        },
        body: JSON.stringify({
          '0': { listingId: realListingId },
        }),
      })
    );
    expect(res.status).toBe(200);
    const data = (await res.json()) as Array<{ result: { data: { listingId: string; isFavorited: boolean } } }>;
    expect(typeof data[0].result.data.isFavorited).toBe('boolean');
  });
});
