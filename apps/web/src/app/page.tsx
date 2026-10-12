'use client';

import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';
import { trpc } from '../lib/trpc';
export const dynamic = 'force-dynamic';

function WishlistHeartButton({ isFav, onToggle }: { isFav: boolean; onToggle: () => void }) {
  const [bounced, setBounced] = React.useState(false);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.8 }}
      animate={bounced ? { scale: [1, 0.7, 1.35, 0.95, 1] } : { scale: 1 }}
      transition={{ duration: 0.35, ease: [0.175, 0.885, 0.32, 1.275] }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setBounced(true);
        setTimeout(() => setBounced(false), 350);
        onToggle();
      }}
      aria-label="Add to wishlist"
      className="absolute top-3 right-3 p-2 rounded-full focus:outline-none z-10 hover:scale-110 transition-[transform] duration-150"
    >
      <svg
        className={`h-6 w-6 stroke-white stroke-2 drop-shadow-md transition-colors duration-200 ${
          isFav ? 'fill-rausch stroke-rausch' : 'fill-black/30'
        }`}
        viewBox="0 0 24 24"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </motion.button>
  );
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export default function HomePage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'Beachfront';
  const destination = searchParams.get('destination') || undefined;
  const guests = searchParams.get('guests') ? Number(searchParams.get('guests')) : undefined;

  const { data, isLoading } = trpc.listings.search.useQuery({
    category,
    destination,
    guestCount: guests,
    limit: 20,
  });

  const { data: favoritedIds = [] } = trpc.favorites.myFavorites.useQuery();
  const utils = trpc.useContext();

  const toggleFavorite = trpc.favorites.toggle.useMutation({
    onMutate: async (vars: { listingId: string } | void) => {
      if (!vars) return;
      const { listingId } = vars;
      await utils.favorites.myFavorites.cancel();
      const previous = utils.favorites.myFavorites.getData() || [];
      const isFav = previous.includes(listingId);
      const next = isFav ? previous.filter((id) => id !== listingId) : [...previous, listingId];
      utils.favorites.myFavorites.setData(undefined, next);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        utils.favorites.myFavorites.setData(undefined, context.previous);
      }
    },
    onSettled: () => {
      utils.favorites.myFavorites.invalidate();
    },
  });

  const listings = data?.items || [];

  return (
    <main className="max-w-[1780px] mx-auto px-6 md:px-12 py-8">
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square w-full rounded-[20px] skeleton-shimmer" />
              <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
              <div className="h-3 w-1/2 rounded-md skeleton-shimmer" />
              <div className="h-4 w-1/4 rounded-md skeleton-shimmer" />
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="py-20 text-center">
          <div className="text-4xl mb-3">🏖️</div>
          <h2 className="text-xl font-bold text-ink">No exact matches</h2>
          <p className="text-sm text-secondary mt-1">
            Try changing or clearing some of your filters or searching a different category.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 rounded-xl border border-ink px-5 py-2.5 text-sm font-semibold hover:bg-surface-soft transition-colors duration-150 active:scale-95"
          >
            Clear all filters
          </Link>
        </div>
      ) : (
        <motion.div
          key={`${category}-${destination}-${guests}`}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
        >
          {listings.map((item) => {
            const isFav = favoritedIds.includes(item.id);
            return (
              <motion.article
                key={item.id}
                variants={itemVariants}
                className="group cursor-pointer"
              >
                <Link href={`/listings/${item.id}`} className="block">
                  <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-neutral-100 shadow-airbnb-rest group-hover:shadow-airbnb-hover transition-[box-shadow] duration-200">
                    <img
                      src={item.imageSrc}
                      alt={item.title}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
                    />
                    <WishlistHeartButton
                      isFav={isFav}
                      onToggle={() => toggleFavorite.mutate({ listingId: item.id })}
                    />
                  </div>
                  <div className="mt-3 flex justify-between items-start text-sm">
                    <h3 className="font-semibold text-ink truncate max-w-[220px]">
                      {item.city ? `${item.city}, ${item.country}` : item.country}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0 font-medium text-ink">
                      <span>★</span>
                      <span>4.95</span>
                    </div>
                  </div>
                  <p className="text-secondary text-sm mt-0.5 truncate">{item.title}</p>
                  <p className="text-secondary text-sm">
                    {item.roomCount} bedrooms · {item.guestCount} guests
                  </p>
                  <div className="mt-2 text-sm">
                    <span className="font-bold text-ink">${item.price}</span>
                    <span className="text-body-ink"> night</span>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </motion.div>
      )}
    </main>
  );
}
