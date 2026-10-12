import { describe, expect, it } from 'bun:test';
import {
  createListingSchema,
  createReservationInputSchema,
  isReservationExclusionViolation,
} from './index';

describe('Shared Contracts & Validation Package', () => {
  it('should validate full composite listing schema', () => {
    const validListing = {
      category: 'Beachfront',
      country: 'United States',
      region: 'California',
      city: 'Malibu',
      guestCount: 4,
      roomCount: 2,
      bathroomCount: 2,
      amenities: ['wifi', 'pool'],
      imageSrc: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
      images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750'],
      title: 'Oceanfront Sunset Villa',
      description: 'A beautiful luxury oceanfront stay with pristine views.',
      price: 450,
    };

    const parsed = createListingSchema.safeParse(validListing);
    expect(parsed.success).toBe(true);
  });

  it('should reject invalid listing data boundaries', () => {
    const invalidPrice = {
      category: 'Beachfront',
      country: 'United States',
      guestCount: 4,
      roomCount: 2,
      bathroomCount: 2,
      amenities: ['wifi'],
      imageSrc: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
      images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750'],
      title: 'Valid Title Here',
      description: 'A valid description that exceeds twenty characters.',
      price: 5, // Below minimum $10
    };

    const parsed = createListingSchema.safeParse(invalidPrice);
    expect(parsed.success).toBe(false);
  });

  it('should reject reservation where checkOut is before or equal to checkIn', () => {
    const invalidReservation = {
      listingId: 'list_123',
      startDate: new Date('2026-06-05'),
      endDate: new Date('2026-06-05'), // Same day
      totalPrice: 400,
    };

    const parsed = createReservationInputSchema.safeParse(invalidReservation);
    expect(parsed.success).toBe(false);
  });

  it('should detect PostgreSQL GiST exclusion violations', () => {
    const error1 = new Error(
      'conflicting key value violates exclusion constraint "reservation_no_overlapping_confirmed"',
    );
    expect(isReservationExclusionViolation(error1)).toBe(true);

    const error2 = { code: '23P01' };
    expect(isReservationExclusionViolation(error2)).toBe(true);

    const normalError = new Error('Column not found');
    expect(isReservationExclusionViolation(normalError)).toBe(false);
  });
});
