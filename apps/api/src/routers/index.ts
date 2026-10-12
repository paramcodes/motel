import { router } from '../trpc';
import { listingsRouter } from './listings';
import { reservationsRouter } from './reservations';
import { favoritesRouter } from './favorites';

export const appRouter = router({
  listings: listingsRouter,
  reservations: reservationsRouter,
  favorites: favoritesRouter,
});

export type AppRouter = typeof appRouter;
