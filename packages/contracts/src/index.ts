import { z } from 'zod';

// ============================================================================
// WIZARD STEP SCHEMAS
// ============================================================================

export const CANONICAL_CATEGORIES = [
  'Beachfront',
  'Cabins',
  'Iconic cities',
  'Countryside',
  'Lakefront',
  'Amazing views',
  'Tiny homes',
  'Mansions',
  'Treehouses',
  'Castles',
  'Camping',
  'Ski-in/out',
  'Luxe',
  'Design',
  'Islands',
] as const;

export type Category = (typeof CANONICAL_CATEGORIES)[number];

export const step1CategorySchema = z.object({
  category: z.enum(CANONICAL_CATEGORIES),
});

export type Step1CategoryInput = z.infer<typeof step1CategorySchema>;

export const step2LocationSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  region: z.string().trim().optional(),
  city: z.string().trim().optional(),
  address: z.string().trim().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export type Step2LocationInput = z.infer<typeof step2LocationSchema>;

export const step3FloorPlanSchema = z.object({
  guestCount: z
    .number()
    .int('Guest count must be an integer')
    .min(1, 'Must accommodate at least 1 guest')
    .max(16, 'Maximum guest capacity is 16'),
  roomCount: z
    .number()
    .int('Room count must be an integer')
    .min(1, 'Must have at least 1 room')
    .max(20, 'Maximum room count is 20'),
  bathroomCount: z
    .number()
    .int('Bathroom count must be an integer')
    .min(1, 'Must have at least 1 bathroom')
    .max(20, 'Maximum bathroom count is 20'),
});

export type Step3FloorPlanInput = z.infer<typeof step3FloorPlanSchema>;

export const CANONICAL_AMENITIES = [
  'wifi',
  'tv',
  'kitchen',
  'washer',
  'free-parking',
  'air-conditioning',
  'dedicated-workspace',
  'pool',
  'hot-tub',
  'patio',
  'bbq-grill',
  'outdoor-dining',
  'fire-pit',
  'ev-charger',
  'crib',
  'beach-access',
] as const;

export type Amenity = (typeof CANONICAL_AMENITIES)[number];

export const step4AmenitiesSchema = z.object({
  amenities: z.array(z.string()).min(1, 'Select at least one amenity for your listing'),
});

export type Step4AmenitiesInput = z.infer<typeof step4AmenitiesSchema>;

export const step5PhotosSchema = z.object({
  imageSrc: z.string().url('Primary photo must be a valid URL'),
  images: z
    .array(z.string().url('Photo must be a valid URL'))
    .min(1, 'Upload at least 1 photo for your listing'),
});

export type Step5PhotosInput = z.infer<typeof step5PhotosSchema>;

export const step6DescriptionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Title must be at least 5 characters')
    .max(50, 'Title cannot exceed 50 characters'),
  description: z
    .string()
    .trim()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description cannot exceed 1,000 characters'),
});

export type Step6DescriptionInput = z.infer<typeof step6DescriptionSchema>;

export const step7PriceSchema = z.object({
  price: z
    .number()
    .int('Price must be a whole currency amount')
    .min(10, 'Price must be at least $10 per night')
    .max(10000, 'Price cannot exceed $10,000 per night'),
});

export type Step7PriceInput = z.infer<typeof step7PriceSchema>;

// Composite Master Schema
export const createListingSchema = step1CategorySchema
  .merge(step2LocationSchema)
  .merge(step3FloorPlanSchema)
  .merge(step4AmenitiesSchema)
  .merge(step5PhotosSchema)
  .merge(step6DescriptionSchema)
  .merge(step7PriceSchema);

export type CreateListingInput = z.infer<typeof createListingSchema>;

// ============================================================================
// ROUTER INPUT / OUTPUT SCHEMAS
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
  id: z.string().min(1),
});

export type DeleteListingInput = z.infer<typeof deleteListingInputSchema>;

export const createReservationInputSchema = z
  .object({
    listingId: z.string().min(1, 'Listing ID is required'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    totalPrice: z.number().int().positive('Total price must be positive'),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: 'Check-out date must be strictly after check-in date',
    path: ['endDate'],
  });

export type CreateReservationInput = z.infer<typeof createReservationInputSchema>;

export const cancelReservationInputSchema = z.object({
  id: z.string().min(1, 'Reservation ID is required'),
});

export type CancelReservationInput = z.infer<typeof cancelReservationInputSchema>;

export const toggleFavoriteInputSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
});

export type ToggleFavoriteInput = z.infer<typeof toggleFavoriteInputSchema>;

export const toggleFavoriteOutputSchema = z.object({
  listingId: z.string(),
  isFavorited: z.boolean(),
});

export type ToggleFavoriteOutput = z.infer<typeof toggleFavoriteOutputSchema>;

// ============================================================================
// CONCURRENCY ERROR UTILITIES
// ============================================================================

export function isReservationExclusionViolation(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('23p01') ||
      msg.includes('exclusion_violation') ||
      msg.includes('reservation_no_overlapping_confirmed') ||
      msg.includes('conflicts with existing key')
    );
  }
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String(error.code).toLowerCase();
    return code === '23p01' || code === 'p2002';
  }
  return false;
}
