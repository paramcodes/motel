# Listing Creation Multi-Step Wizard Contracts Specification

## Executive Summary

This document locks the formal contract, Zod validation schemas, step boundaries, and React Hook Form state management architecture for Motel's 7-step host onboarding wizard (`/host/create`), resolving **Ticket 05** ([`05-listing-creation-wizard-contracts.md`](../../.scratch/airbnb-clone/issues/05-listing-creation-wizard-contracts.md)).

---

## 1. Architectural Principles

1. **Client-Side Atomic Submission**:
   - The wizard does not create partial or draft rows in PostgreSQL.
   - Form state lives in React Hook Form backed by a Zustand store synchronized with `sessionStorage` under the key `motel_host_wizard_draft`.
   - On Step 7, completion fires an atomic `trpc.listings.create` mutation that inserts a complete, fully validated `Listing` row.
2. **Modular Composable Validation**:
   - Each wizard screen validates strictly against its own modular Zod step schema via `form.trigger(currentStepFields)`.
   - The backend tRPC router validates incoming payloads against the composite `createListingSchema` produced by merging all step schemas.
3. **URL Shallow Navigation**:
   - The wizard route is `/host/create` with a shallow query parameter `?step=1` through `?step=7`.
   - Browser Back and Forward buttons navigate step history without reloading the page or wiping uncommitted form inputs.

---

## 2. Canonical Step Schemas (`packages/contracts`)

```typescript
import { z } from 'zod';

// ============================================================================
// STEP 1: CATEGORY
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

export const step1CategorySchema = z.object({
  category: z.enum(CANONICAL_CATEGORIES, {
    errorMap: () => ({ message: 'Select a valid listing category' }),
  }),
});

export type Step1CategoryInput = z.infer<typeof step1CategorySchema>;

// ============================================================================
// STEP 2: LOCATION
// ============================================================================
export const step2LocationSchema = z.object({
  country: z
    .string({ required_error: 'Select a country' })
    .min(1, 'Country is required'),
  region: z.string().trim().optional(),
  city: z.string().trim().optional(),
  address: z.string().trim().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export type Step2LocationInput = z.infer<typeof step2LocationSchema>;

// ============================================================================
// STEP 3: FLOOR PLAN & CAPACITY
// ============================================================================
export const step3FloorPlanSchema = z.object({
  guestCount: z
    .number({ required_error: 'Guest count is required' })
    .int('Guest count must be an integer')
    .min(1, 'Must accommodate at least 1 guest')
    .max(16, 'Maximum guest capacity is 16'),
  roomCount: z
    .number({ required_error: 'Room count is required' })
    .int('Room count must be an integer')
    .min(1, 'Must have at least 1 room')
    .max(20, 'Maximum room count is 20'),
  bathroomCount: z
    .number({ required_error: 'Bathroom count is required' })
    .int('Bathroom count must be an integer')
    .min(1, 'Must have at least 1 bathroom')
    .max(20, 'Maximum bathroom count is 20'),
});

export type Step3FloorPlanInput = z.infer<typeof step3FloorPlanSchema>;

// ============================================================================
// STEP 4: AMENITIES
// ============================================================================
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

export const step4AmenitiesSchema = z.object({
  amenities: z
    .array(z.string())
    .min(1, 'Select at least one amenity for your listing'),
});

export type Step4AmenitiesInput = z.infer<typeof step4AmenitiesSchema>;

// ============================================================================
// STEP 5: PHOTOS
// ============================================================================
export const step5PhotosSchema = z.object({
  imageSrc: z
    .string({ required_error: 'Primary cover photo URL is required' })
    .url('Primary photo must be a valid URL'),
  images: z
    .array(z.string().url('Photo must be a valid URL'))
    .min(1, 'Upload at least 1 photo for your listing'),
});

export type Step5PhotosInput = z.infer<typeof step5PhotosSchema>;

// ============================================================================
// STEP 6: TITLE & DESCRIPTION
// ============================================================================
export const step6DescriptionSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(5, 'Title must be at least 5 characters')
    .max(50, 'Title cannot exceed 50 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description cannot exceed 1,000 characters'),
});

export type Step6DescriptionInput = z.infer<typeof step6DescriptionSchema>;

// ============================================================================
// STEP 7: PRICE
// ============================================================================
export const step7PriceSchema = z.object({
  price: z
    .number({ required_error: 'Nightly price is required' })
    .int('Price must be a whole currency amount')
    .min(10, 'Price must be at least $10 per night')
    .max(10000, 'Price cannot exceed $10,000 per night'),
});

export type Step7PriceInput = z.infer<typeof step7PriceSchema>;

// ============================================================================
// COMPOSITE MASTER SCHEMA (tRPC listings.create contract)
// ============================================================================
export const createListingSchema = step1CategorySchema
  .merge(step2LocationSchema)
  .merge(step3FloorPlanSchema)
  .merge(step4AmenitiesSchema)
  .merge(step5PhotosSchema)
  .merge(step6DescriptionSchema)
  .merge(step7PriceSchema);

export type CreateListingInput = z.infer<typeof createListingSchema>;
```

---

## 3. Step Mapping & Validation Fields Matrix

| Step | Identifier | Display Title | Fields Validated via `form.trigger()` |
| :---: | :--- | :--- | :--- |
| **1** | `category` | Which of these best describes your place? | `['category']` |
| **2** | `location` | Where is your place located? | `['country', 'region', 'city', 'address', 'latitude', 'longitude']` |
| **3** | `floorPlan` | Share some basics about your place | `['guestCount', 'roomCount', 'bathroomCount']` |
| **4** | `amenities` | Tell guests what your place has to offer | `['amenities']` |
| **5** | `photos` | Add photos of your space | `['imageSrc', 'images']` |
| **6** | `description`| Give your listing a title & description | `['title', 'description']` |
| **7** | `price` | Set your nightly price | `['price']` |

---

## 4. Frontend State Management Architecture

### Form State Lifecycle

```
[Host visits /host/create?step=1]
               │
               ▼
[Load cached state from sessionStorage]
               │
               ▼
[Step Interaction] ──(Next button clicked)──► [form.trigger(currentStepFields)]
                                                          │
                                          ┌───────────────┴───────────────┐
                                          │ Failed                        │ Passed
                                          ▼                               ▼
                                   [Show error toast/text]    [Save to sessionStorage]
                                                                          │
                                                                          ▼
                                                                [router.push(?step=N+1)]
                                                                          │
                                                      (At Step 7: "Publish listing")
                                                                          │
                                                                          ▼
                                                            [trpc.listings.create.mutate]
                                                                          │
                                                                          ▼
                                                            [Clear sessionStorage draft]
                                                                          │
                                                                          ▼
                                                            [Redirect to /listings/:id]
```

---

## 5. Summary of Decisions

1. **Database Purity**: No nullable fields in `Listing` or orphaned draft rows in PostgreSQL; pure client-side `sessionStorage` state.
2. **Modular Contracts**: Independent Zod step schemas composed into `createListingSchema` in `@motel/contracts`.
3. **Ergonomic Routing**: Single route `/host/create` with `?step=1..7` query parameter for smooth animated transitions and browser history support.
4. **Offline First**: Standard ISO country selector with optional Leaflet pin coordinate resolution; Cloudinary upload with direct image URL fallback.
