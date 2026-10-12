'use client';

import { Button } from '@motel/ui';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import * as React from 'react';
import { trpc } from '../../../lib/trpc';
export const dynamic = 'force-dynamic';

export default function ListingDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const {
    data: listing,
    isLoading,
    error,
  } = trpc.listings.byId.useQuery({ id }, { enabled: Boolean(id) });

  const [checkIn, setCheckIn] = React.useState('2026-11-12');
  const [checkOut, setCheckOut] = React.useState('2026-11-16');
  const [conflictError, setConflictError] = React.useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = React.useState(false);

  const nights = React.useMemo(() => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    return isNaN(diff) ? 1 : diff;
  }, [checkIn, checkOut]);

  const totalPrice = listing ? listing.price * nights : 0;

  const createReservation = trpc.reservations.create.useMutation({
    onSuccess: () => {
      setBookingSuccess(true);
      setConflictError(null);
    },
    onError: (err: any) => {
      if (err.data?.code === 'CONFLICT') {
        setConflictError('These dates are already booked. Please choose another date range.');
      } else {
        setConflictError(err.message || 'Failed to complete reservation. Please try again.');
      }
    },
  });

  const handleBook = () => {
    setConflictError(null);
    createReservation.mutate({
      listingId: id,
      startDate: new Date(checkIn),
      endDate: new Date(checkOut),
      totalPrice,
    });
  };

  if (isLoading) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <div className="h-8 w-1/2 rounded-lg skeleton-shimmer" />
        <div className="aspect-[16/9] w-full rounded-[20px] skeleton-shimmer" />
        <div className="h-6 w-1/4 rounded-md skeleton-shimmer" />
        <div className="h-20 w-3/4 rounded-xl skeleton-shimmer" />
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-ink">Listing not found</h1>
        <p className="text-secondary mt-2">This listing might have been removed by the host.</p>
        <Link href="/" className="inline-block mt-6 text-sm font-semibold text-rausch underline">
          Return to home
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      {/* Title & Location Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-ink">{listing.title}</h1>
        <div className="flex items-center gap-2 mt-2 text-sm text-secondary">
          <span className="font-semibold text-ink">★ 4.98</span>
          <span>·</span>
          <span className="underline">
            {listing.city ? `${listing.city}, ${listing.country}` : listing.country}
          </span>
          <span>·</span>
          <span className="capitalize">{listing.category}</span>
        </div>
      </div>

      {/* Hero Image Mosaic */}
      <div className="relative aspect-[16/9] w-full rounded-[20px] overflow-hidden bg-neutral-100 shadow-airbnb-rest mb-10 group">
        <img
          src={listing.imageSrc}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left 2 Cols: Details & Amenities */}
        <div className="lg:col-span-2 space-y-8">
          <div className="border-b border-hairline-soft pb-6">
            <h2 className="text-xl font-bold text-ink">
              Entire space hosted in {listing.city || listing.country}
            </h2>
            <p className="text-secondary text-sm mt-1">
              {listing.guestCount} guests · {listing.roomCount} bedrooms · {listing.bathroomCount}{' '}
              baths
            </p>
          </div>

          <div className="border-b border-hairline-soft pb-6">
            <h3 className="text-lg font-bold text-ink mb-3">About this space</h3>
            <p className="text-body-ink leading-relaxed whitespace-pre-line text-sm md:text-base">
              {listing.description}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-ink mb-4">What this place offers</h3>
            <div className="grid grid-cols-2 gap-4">
              {listing.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-3 text-sm font-medium text-ink">
                  <span className="text-lg">✨</span>
                  <span className="capitalize">{amenity.replace(/-/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Sticky Reservation Card */}
        <div className="relative">
          <div className="sticky top-28 rounded-[20px] border border-hairline bg-canvas p-6 shadow-airbnb-dialog">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <span className="text-2xl font-bold text-ink">${listing.price}</span>
                <span className="text-secondary text-sm"> / night</span>
              </div>
              <div className="text-xs font-semibold text-ink">★ 4.98 · 142 reviews</div>
            </div>

            {/* Date Pickers */}
            <div className="rounded-xl border border-hairline divide-y divide-hairline mb-4">
              <div className="grid grid-cols-2 divide-x divide-hairline">
                <div className="p-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-secondary block">
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full text-xs font-semibold text-ink bg-transparent focus:outline-none mt-1"
                  />
                </div>
                <div className="p-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-secondary block">
                    Checkout
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full text-xs font-semibold text-ink bg-transparent focus:outline-none mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Concurrency Error Banner & Success Banner with layout-friendly AnimatePresence */}
            <AnimatePresence>
              {conflictError && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
                    ⚠️ {conflictError}
                  </div>
                </motion.div>
              )}

              {bookingSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 font-medium">
                    🎉 Reservation confirmed! View your stay under{' '}
                    <Link href="/trips" className="underline font-bold">
                      My Trips
                    </Link>
                    .
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reserve CTA */}
            <Button
              className="w-full"
              size="lg"
              disabled={createReservation.isPending}
              onClick={handleBook}
            >
              {createReservation.isPending ? 'Reserving...' : 'Reserve'}
            </Button>

            <p className="text-center text-xs text-secondary mt-3">You won't be charged yet</p>

            {/* Price Calculation Breakdown */}
            <div className="mt-6 space-y-3 border-t border-hairline-soft pt-4 text-sm">
              <div className="flex justify-between text-body-ink">
                <span className="underline">
                  ${listing.price} × {nights} nights
                </span>
                <span>${totalPrice}</span>
              </div>
              <div className="flex justify-between text-body-ink">
                <span className="underline">Cleaning fee</span>
                <span>$0</span>
              </div>
              <div className="flex justify-between text-body-ink">
                <span className="underline">Motel service fee</span>
                <span>$0</span>
              </div>
              <div className="flex justify-between font-bold text-ink border-t border-hairline-soft pt-3 text-base">
                <span>Total before taxes</span>
                <div className="relative overflow-hidden h-6">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={totalPrice}
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -8, opacity: 0 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="block font-bold"
                    >
                      ${totalPrice}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
