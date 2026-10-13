import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Listing {
  id: string;
  hostId: string;
  title: string;
  description: string;
  category: string;
  country: string;
  region: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  guestCount: number;
  roomCount: number;
  bathroomCount: number;
  imageSrc: string;
  images: string[];
  amenities: string[];
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reservation {
  id: string;
  userId: string;
  listingId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: Date;
}

export class DatabaseClient {
  private pglite: PGlite | null = null;
  private initialized = false;

  constructor(private dataDir?: string) {}

  public async getClient(): Promise<PGlite> {
    if (!this.pglite) {
      if (this.dataDir && !existsSync(this.dataDir)) {
        mkdirSync(this.dataDir, { recursive: true });
      }
      // NOTE: use the static `PGlite.create()` factory rather than `new PGlite()`.
      // The constructor path does not wire the `extensions` option into the
      // instance (extensions like btree_gist silently fail to register), so
      // `CREATE EXTENSION btree_gist` — required by the GiST exclusion
      // migration — throws "extension is not available" and no tables are built.
      this.pglite = await PGlite.create(this.dataDir, {
        extensions: { btree_gist },
      });
    }
    if (!this.initialized) {
      await this.initSchema();
      this.initialized = true;
      // Tests run against isolated in-memory databases, so seed the demo
      // fixtures (host/guest users + listings) that the suites expect.
      if (process.env.NODE_ENV === 'test' || process.env.BUN_TEST_RUNNER_NAME) {
        const { seedDatabase } = await import('./seed');
        await seedDatabase();
      }
    }
    return this.pglite;
  }

  private async initSchema(): Promise<void> {
    if (!this.pglite) return;
    let repoRoot = process.cwd();
    while (repoRoot !== '/' && !existsSync(join(repoRoot, 'packages/db'))) {
      repoRoot = join(repoRoot, '..');
    }
    const migrationPath = join(repoRoot, 'packages/db/prisma/migrations/0_init/migration.sql');
    if (existsSync(migrationPath)) {
      const sql = readFileSync(migrationPath, 'utf8');
      try {
        await this.pglite.exec(sql);
      } catch (err: unknown) {
        // Ignore if already initialized
        const message = err instanceof Error ? err.message : String(err);
        if (!message.includes('already exists')) {
          console.error('Schema initialization notice:', message);
        }
      }
    }
  }

  // Listing Operations
  public readonly listing = {
    findMany: async (options?: {
      where?: {
        category?: string;
        guestCount?: number;
        minPrice?: number;
        maxPrice?: number;
        destination?: string;
        checkIn?: Date;
        checkOut?: Date;
      };
      limit?: number;
      cursor?: string;
    }): Promise<Listing[]> => {
      const client = await this.getClient();
      const conditions: string[] = [];
      const params: unknown[] = [];
      let pIdx = 1;

      if (options?.where?.category) {
        conditions.push(`category = $${pIdx++}`);
        params.push(options.where.category);
      }
      if (options?.where?.guestCount) {
        conditions.push(`"guestCount" >= $${pIdx++}`);
        params.push(options.where.guestCount);
      }
      if (options?.where?.minPrice !== undefined) {
        conditions.push(`price >= $${pIdx++}`);
        params.push(options.where.minPrice);
      }
      if (options?.where?.maxPrice !== undefined) {
        conditions.push(`price <= $${pIdx++}`);
        params.push(options.where.maxPrice);
      }
      if (options?.where?.destination) {
        conditions.push(`(country ILIKE $${pIdx} OR region ILIKE $${pIdx} OR city ILIKE $${pIdx})`);
        params.push(`%${options.where.destination}%`);
        pIdx++;
      }
      if (options?.where?.checkIn && options?.where?.checkOut) {
        conditions.push(`
          NOT EXISTS (
            SELECT 1 FROM "Reservation" r
            WHERE r."listingId" = "Listing".id
              AND r.status = 'CONFIRMED'
              AND r."startDate" < $${pIdx++}::date
              AND r."endDate" > $${pIdx++}::date
          )
        `);
        params.push(
          options.where.checkOut.toISOString().split('T')[0],
          options.where.checkIn.toISOString().split('T')[0],
        );
      }
      if (options?.cursor) {
        conditions.push(`"createdAt" < (SELECT "createdAt" FROM "Listing" WHERE id = $${pIdx++})`);
        params.push(options.cursor);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const limitClause = options?.limit ? `LIMIT ${options.limit}` : '';

      const query = `
        SELECT * FROM "Listing"
        ${whereClause}
        ORDER BY "createdAt" DESC
        ${limitClause}
      `;

      const result = await client.query<Listing>(query, params);
      return result.rows;
    },

    findUnique: async (options: { where: { id: string } }): Promise<Listing | null> => {
      const client = await this.getClient();
      const res = await client.query<Listing>('SELECT * FROM "Listing" WHERE id = $1 LIMIT 1', [
        options.where.id,
      ]);
      return res.rows[0] ?? null;
    },

    create: async (options: {
      data: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>;
    }): Promise<Listing> => {
      const client = await this.getClient();
      const id = `list_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
      const {
        hostId,
        title,
        description,
        category,
        country,
        region,
        city,
        address,
        latitude,
        longitude,
        guestCount,
        roomCount,
        bathroomCount,
        imageSrc,
        images,
        amenities,
        price,
      } = options.data;

      const res = await client.query<Listing>(
        `INSERT INTO "Listing" (
          id, "hostId", title, description, category, country, region, city, address,
          latitude, longitude, "guestCount", "roomCount", "bathroomCount",
          "imageSrc", images, amenities, price
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        ) RETURNING *`,
        [
          id,
          hostId,
          title,
          description,
          category,
          country,
          region || null,
          city || null,
          address || null,
          latitude || null,
          longitude || null,
          guestCount,
          roomCount,
          bathroomCount,
          imageSrc,
          images,
          amenities,
          price,
        ],
      );
      return res.rows[0];
    },

    delete: async (options: { where: { id: string } }): Promise<{ id: string }> => {
      const client = await this.getClient();
      await client.query('DELETE FROM "Listing" WHERE id = $1', [options.where.id]);
      return { id: options.where.id };
    },
  };

  // Reservation Operations
  public readonly reservation = {
    findMany: async (options?: {
      where?: { userId?: string; listingId?: string };
    }): Promise<Reservation[]> => {
      const client = await this.getClient();
      const conditions: string[] = [];
      const params: unknown[] = [];
      let pIdx = 1;

      if (options?.where?.userId) {
        conditions.push(`"userId" = $${pIdx++}`);
        params.push(options.where.userId);
      }
      if (options?.where?.listingId) {
        conditions.push(`"listingId" = $${pIdx++}`);
        params.push(options.where.listingId);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const res = await client.query<Reservation>(
        `SELECT * FROM "Reservation" ${whereClause} ORDER BY "createdAt" DESC`,
        params,
      );
      return res.rows;
    },

    findUnique: async (options: { where: { id: string } }): Promise<Reservation | null> => {
      const client = await this.getClient();
      const res = await client.query<Reservation>(
        'SELECT * FROM "Reservation" WHERE id = $1 LIMIT 1',
        [options.where.id],
      );
      return res.rows[0] ?? null;
    },

    create: async (options: {
      data: {
        userId: string;
        listingId: string;
        startDate: Date;
        endDate: Date;
        totalPrice: number;
        status?: ReservationStatus;
      };
    }): Promise<Reservation> => {
      const client = await this.getClient();
      const id = `res_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
      const {
        userId,
        listingId,
        startDate,
        endDate,
        totalPrice,
        status = 'CONFIRMED',
      } = options.data;

      const res = await client.query<Reservation>(
        `INSERT INTO "Reservation" (
          id, "userId", "listingId", "startDate", "endDate", "totalPrice", status
        ) VALUES (
          $1, $2, $3, $4::date, $5::date, $6, $7
        ) RETURNING *`,
        [
          id,
          userId,
          listingId,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
          totalPrice,
          status,
        ],
      );
      return res.rows[0];
    },

    update: async (options: {
      where: { id: string };
      data: { status: ReservationStatus };
    }): Promise<Reservation> => {
      const client = await this.getClient();
      const res = await client.query<Reservation>(
        'UPDATE "Reservation" SET status = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [options.data.status, options.where.id],
      );
      return res.rows[0];
    },
  };

  // User Operations
  public readonly user = {
    findUnique: async (options: {
      where: { id?: string; clerkId?: string; email?: string };
    }): Promise<User | null> => {
      const client = await this.getClient();
      if (options.where.id) {
        const res = await client.query<User>('SELECT * FROM "User" WHERE id = $1 LIMIT 1', [
          options.where.id,
        ]);
        return res.rows[0] ?? null;
      }
      if (options.where.clerkId) {
        const res = await client.query<User>('SELECT * FROM "User" WHERE "clerkId" = $1 LIMIT 1', [
          options.where.clerkId,
        ]);
        return res.rows[0] ?? null;
      }
      if (options.where.email) {
        const res = await client.query<User>('SELECT * FROM "User" WHERE email = $1 LIMIT 1', [
          options.where.email,
        ]);
        return res.rows[0] ?? null;
      }
      return null;
    },

    upsert: async (options: {
      where: { clerkId: string };
      create: { clerkId: string; email: string; name?: string | null; imageUrl?: string | null };
      update: { email?: string; name?: string | null; imageUrl?: string | null };
    }): Promise<User> => {
      const client = await this.getClient();
      const existing = await this.user.findUnique({ where: { clerkId: options.where.clerkId } });
      if (existing) {
        const res = await client.query<User>(
          `UPDATE "User" SET
            email = COALESCE($1, email),
            name = COALESCE($2, name),
            "imageUrl" = COALESCE($3, "imageUrl"),
            "updatedAt" = CURRENT_TIMESTAMP
          WHERE "clerkId" = $4 RETURNING *`,
          [
            options.update.email || null,
            options.update.name || null,
            options.update.imageUrl || null,
            options.where.clerkId,
          ],
        );
        return res.rows[0];
      }
      const id = `usr_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
      const res = await client.query<User>(
        `INSERT INTO "User" (id, "clerkId", email, name, "imageUrl")
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [
          id,
          options.create.clerkId,
          options.create.email,
          options.create.name || null,
          options.create.imageUrl || null,
        ],
      );
      return res.rows[0];
    },

    delete: async (options: { where: { clerkId: string } }): Promise<void> => {
      const client = await this.getClient();
      await client.query('DELETE FROM "User" WHERE "clerkId" = $1', [options.where.clerkId]);
    },
  };

  // Favorite Operations
  public readonly favorite = {
    findUnique: async (options: {
      where: { userId_listingId: { userId: string; listingId: string } };
    }): Promise<Favorite | null> => {
      const client = await this.getClient();
      const res = await client.query<Favorite>(
        'SELECT * FROM "Favorite" WHERE "userId" = $1 AND "listingId" = $2 LIMIT 1',
        [options.where.userId_listingId.userId, options.where.userId_listingId.listingId],
      );
      return res.rows[0] ?? null;
    },

    create: async (options: { data: { userId: string; listingId: string } }): Promise<Favorite> => {
      const client = await this.getClient();
      const id = `fav_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
      const res = await client.query<Favorite>(
        'INSERT INTO "Favorite" (id, "userId", "listingId") VALUES ($1, $2, $3) RETURNING *',
        [id, options.data.userId, options.data.listingId],
      );
      return res.rows[0];
    },

    delete: async (options: {
      where: { userId_listingId: { userId: string; listingId: string } };
    }): Promise<void> => {
      const client = await this.getClient();
      await client.query('DELETE FROM "Favorite" WHERE "userId" = $1 AND "listingId" = $2', [
        options.where.userId_listingId.userId,
        options.where.userId_listingId.listingId,
      ]);
    },
  };
}

function getDatabaseDirectory(): string | undefined {
  // Avoid disk lock contention: run all tests against an isolated in-memory database.
  if (process.env.NODE_ENV === 'test' || process.env.BUN_TEST_RUNNER_NAME) return undefined;
  if (process.env.DATABASE_DIR) return process.env.DATABASE_DIR;
  let root = process.cwd();
  while (root !== '/' && !existsSync(join(root, 'packages/db'))) {
    root = join(root, '..');
  }
  return join(root, '.scratch/db');
}

// Singleton database instance
export const db = new DatabaseClient(getDatabaseDirectory());
