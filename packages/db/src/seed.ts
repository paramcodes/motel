import { db } from './index';

export const SEED_LISTINGS = [
  {
    category: 'Beachfront',
    title: 'Architectural Cliff Villa with Infinity Pool',
    description:
      'Breathtaking oceanfront villa perched atop rugged cliffs. Features floor-to-ceiling glass walls, private saltwater infinity pool, outdoor shower, and direct stair access to secluded sandy cove.',
    country: 'United States',
    region: 'California',
    city: 'Big Sur',
    address: '1 Highway 1',
    latitude: 36.2704,
    longitude: -121.8081,
    guestCount: 6,
    roomCount: 3,
    bathroomCount: 3,
    imageSrc:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['wifi', 'pool', 'hot-tub', 'kitchen', 'free-parking', 'beach-access'],
    price: 540,
  },
  {
    category: 'Cabins',
    title: 'Minimalist Cedar Cabin in Redwood Forest',
    description:
      'Architect-designed timber sanctuary nestled among centuries-old redwoods. Wood-burning stove, curated library, private sauna, and skylights for forest canopy stargazing.',
    country: 'United States',
    region: 'California',
    city: 'Mendocino',
    address: '42 Forest Way',
    latitude: 39.3077,
    longitude: -123.7995,
    guestCount: 4,
    roomCount: 2,
    bathroomCount: 1,
    imageSrc:
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['wifi', 'kitchen', 'fire-pit', 'patio', 'dedicated-workspace'],
    price: 295,
  },
  {
    category: 'Iconic cities',
    title: 'Haussmannian Penthouse overlooking Seine',
    description:
      'Elegant Paris apartment in historic 19th-century building with wrap-around iron balcony, chevron oak parquetry, marble fireplaces, and direct views of the Eiffel Tower.',
    country: 'France',
    region: 'Île-de-France',
    city: 'Paris',
    address: '14 Quai de la Tournelle',
    latitude: 48.8503,
    longitude: 2.3522,
    guestCount: 4,
    roomCount: 2,
    bathroomCount: 2,
    imageSrc:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['wifi', 'tv', 'kitchen', 'air-conditioning', 'dedicated-workspace'],
    price: 480,
  },
  {
    category: 'Countryside',
    title: 'Tuscan Stone Estate surrounded by Olive Groves',
    description:
      'Restored 17th-century farmhouse with terracotta vaulted ceilings, outdoor pizza oven, heated saltwater pool, and private wine cellar amidst rolling Chianti hills.',
    country: 'Italy',
    region: 'Tuscany',
    city: 'Siena',
    address: 'Via Chiantigiana 8',
    latitude: 43.3188,
    longitude: 11.3308,
    guestCount: 8,
    roomCount: 4,
    bathroomCount: 4,
    imageSrc:
      'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['wifi', 'pool', 'kitchen', 'free-parking', 'patio', 'bbq-grill'],
    price: 620,
  },
  {
    category: 'Lakefront',
    title: 'Nordic Waterfront Chalet with Private Dock',
    description:
      'Floor-to-ceiling panoramic glass windows facing serene alpine waters. Includes cedar hot tub, wood-burning barrel sauna, and two kayaks for lake exploration.',
    country: 'United States',
    region: 'Nevada',
    city: 'Lake Tahoe',
    address: '88 Lakeshore Blvd',
    latitude: 39.0968,
    longitude: -120.0324,
    guestCount: 6,
    roomCount: 3,
    bathroomCount: 2,
    imageSrc:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['wifi', 'hot-tub', 'kitchen', 'free-parking', 'fire-pit'],
    price: 460,
  },
  {
    category: 'Amazing views',
    title: 'Panoramic Glass Pavilion on Joshua Tree Ridge',
    description:
      'Cantilevered architectural marvel framing 360-degree desert boulder landscapes. Outdoor stargazing beds, concrete soaking tub, and solar-powered climate control.',
    country: 'United States',
    region: 'California',
    city: 'Joshua Tree',
    address: '77 Skyview Rd',
    latitude: 34.1347,
    longitude: -116.3131,
    guestCount: 2,
    roomCount: 1,
    bathroomCount: 1,
    imageSrc:
      'https://images.unsplash.com/photo-1542314831-c6a4d2757657?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1542314831-c6a4d2757657?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['wifi', 'air-conditioning', 'patio', 'hot-tub', 'free-parking'],
    price: 380,
  },
  {
    category: 'Tiny homes',
    title: 'Off-Grid Eco Pod in Pacific Northwest Canopy',
    description:
      'Custom micro-home featuring convertible loft bed, compact induction kitchenette, composting bath, and wraparound cedar deck in tranquil rainforest.',
    country: 'United States',
    region: 'Washington',
    city: 'Bellingham',
    address: '12 Moss Lane',
    latitude: 48.7519,
    longitude: -122.4787,
    guestCount: 2,
    roomCount: 1,
    bathroomCount: 1,
    imageSrc:
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['wifi', 'kitchen', 'free-parking', 'patio'],
    price: 180,
  },
  {
    category: 'Mansions',
    title: 'Beverly Hills Modernist Manor with Tennis Court',
    description:
      'Gated 10,000 sq ft private estate featuring Olympic lap pool, championship tennis court, home cinema, wine tasting room, and manicured private gardens.',
    country: 'United States',
    region: 'California',
    city: 'Beverly Hills',
    address: '90210 Summit Ridge',
    latitude: 34.0736,
    longitude: -118.4004,
    guestCount: 12,
    roomCount: 6,
    bathroomCount: 7,
    imageSrc:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      'wifi',
      'pool',
      'hot-tub',
      'tv',
      'kitchen',
      'free-parking',
      'air-conditioning',
      'ev-charger',
    ],
    price: 1850,
  },
  {
    category: 'Treehouses',
    title: 'Living Cedar Treehouse suspended over Stream',
    description:
      'Hand-crafted treehouse built between three ancient western red cedars. Features suspension bridge, outdoor copper soaking tub, and wood-burning stove.',
    country: 'United States',
    region: 'Oregon',
    city: 'Hood River',
    address: '44 Cedar Bridge Rd',
    latitude: 45.7054,
    longitude: -121.5215,
    guestCount: 2,
    roomCount: 1,
    bathroomCount: 1,
    imageSrc:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['wifi', 'fire-pit', 'patio', 'free-parking'],
    price: 320,
  },
  {
    category: 'Castles',
    title: 'Scottish Highlands 15th-Century Keep',
    description:
      'Authentic stone castle on private loch estate. Grand banquet hall, spiral staircases, open hearths, modern en-suite bathrooms, and guided falconry tours.',
    country: 'United Kingdom',
    region: 'Highlands',
    city: 'Inverness',
    address: 'Loch Keep Estate',
    latitude: 57.4778,
    longitude: -4.2247,
    guestCount: 10,
    roomCount: 5,
    bathroomCount: 5,
    imageSrc:
      'https://images.unsplash.com/photo-1585543805890-6051f7829f98?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1585543805890-6051f7829f98?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['wifi', 'kitchen', 'fire-pit', 'free-parking', 'dedicated-workspace'],
    price: 950,
  },
  {
    category: 'Camping',
    title: 'Luxury Safari Tent overlooking Red Rock Canyon',
    description:
      'Furnished canvas glamping tent with plush king bed, heated blankets, private cedar deck, fire pit, and unpolluted dark-sky stargazing.',
    country: 'United States',
    region: 'Utah',
    city: 'Moab',
    address: '15 Canyon View Rd',
    latitude: 38.5733,
    longitude: -109.5498,
    guestCount: 2,
    roomCount: 1,
    bathroomCount: 1,
    imageSrc:
      'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['fire-pit', 'patio', 'free-parking'],
    price: 195,
  },
  {
    category: 'Ski-in/out',
    title: 'Modern Timber Chalet on Aspen Mountain',
    description:
      'Direct slope access right off the back patio. Heated boot warmers, stone fireplace, outdoor hot tub facing snow-covered peaks, and gourmet chef kitchen.',
    country: 'United States',
    region: 'Colorado',
    city: 'Aspen',
    address: '100 Slopeside Dr',
    latitude: 39.1911,
    longitude: -106.8175,
    guestCount: 8,
    roomCount: 4,
    bathroomCount: 4,
    imageSrc:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['wifi', 'hot-tub', 'kitchen', 'free-parking', 'fire-pit', 'air-conditioning'],
    price: 780,
  },
  {
    category: 'Luxe',
    title: 'Santorini Cliffside Cave Suite with Plunge Pool',
    description:
      'Carved whitewashed cave villa overlooking the caldera. Private heated infinity plunge pool, Aegean sea views, champagne breakfast service, and sunset terrace.',
    country: 'Greece',
    region: 'South Aegean',
    city: 'Oia',
    address: 'Caldera Cliff Path',
    latitude: 36.4618,
    longitude: 25.3753,
    guestCount: 2,
    roomCount: 1,
    bathroomCount: 1,
    imageSrc:
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['wifi', 'pool', 'air-conditioning', 'patio'],
    price: 890,
  },
  {
    category: 'Design',
    title: 'Mid-Century Cantilever House in Hollywood Hills',
    description:
      'Post-and-beam architectural gem restored to pristine 1960s glory. Original terrazzo floors, vintage Scandinavian furnishings, solar heated pool, and city views.',
    country: 'United States',
    region: 'California',
    city: 'Los Angeles',
    address: '22 Mulholland Dr',
    latitude: 34.1206,
    longitude: -118.3512,
    guestCount: 4,
    roomCount: 2,
    bathroomCount: 2,
    imageSrc:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['wifi', 'pool', 'tv', 'kitchen', 'free-parking', 'air-conditioning'],
    price: 520,
  },
  {
    category: 'Islands',
    title: 'Private Overwater Bungalow in Bora Bora Lagoon',
    description:
      'Direct glass-bottom floor viewing marine life, thatched roof bungalow with private ocean sun deck, outdoor freshwater shower, and outrigger canoe.',
    country: 'French Polynesia',
    region: 'Leeward Islands',
    city: 'Bora Bora',
    address: 'Motu Toopua Lagoon',
    latitude: -16.5004,
    longitude: -151.7415,
    guestCount: 2,
    roomCount: 1,
    bathroomCount: 1,
    imageSrc:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['wifi', 'air-conditioning', 'patio', 'beach-access'],
    price: 1100,
  },
];

export async function seedDatabase(): Promise<void> {
  console.log('[Seed] Seeding database...');

  // 1. Seed demo host user
  const host = await db.user.upsert({
    where: { clerkId: 'user_host_demo_01' },
    create: {
      clerkId: 'user_host_demo_01',
      email: 'host@motel.local',
      name: 'Elena Rostova',
      imageUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    update: {
      email: 'host@motel.local',
      name: 'Elena Rostova',
    },
  });

  // 2. Seed demo guest user
  await db.user.upsert({
    where: { clerkId: 'user_guest_demo_01' },
    create: {
      clerkId: 'user_guest_demo_01',
      email: 'guest@motel.local',
      name: 'Alexandre Chen',
      imageUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    update: {
      email: 'guest@motel.local',
      name: 'Alexandre Chen',
    },
  });

  // 3. Seed listings across all 15 categories
  for (const item of SEED_LISTINGS) {
    const existing = await db.listing.findMany({
      where: { category: item.category },
    });
    if (existing.length === 0) {
      await db.listing.create({
        data: {
          ...item,
          hostId: host.id,
        },
      });
    }
  }

  const allListings = await db.listing.findMany();
  console.log(`[Seed] Successfully seeded ${allListings.length} listings across categories.`);
}

// Run if executed directly
if (import.meta.main) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]', err);
      process.exit(1);
    });
}
