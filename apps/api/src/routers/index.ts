import { router } from '../trpc';
import { favoritesRouter } from './favorites';
import { listingsRouter } from './listings';
import { reservationsRouter } from './reservations';

export const appRouter = router({
  listings: listingsRouter,
  reservations: reservationsRouter,
  favorites: favoritesRouter,
});

export type AppRouter = typeof appRouter;
