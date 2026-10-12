'use client';

import * as React from 'react';
import Link from 'next/link';
import { trpc } from '../../lib/trpc';
import { Button } from '@motel/ui';
export const dynamic = 'force-dynamic';

export default function TripsPage() {
  const { data: reservations = [], isLoading, refetch } = trpc.reservations.myReservations.useQuery();

  const cancelReservation = trpc.reservations.cancel.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-ink mb-2">Trips</h1>
      <p className="text-secondary text-sm mb-8">Manage and review your confirmed reservations.</p>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-neutral-200 animate-pulse" />
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-hairline rounded-[20px] p-8">
          <div className="text-3xl mb-3">🧳</div>
          <h2 className="text-lg font-bold text-ink">No trips booked... yet!</h2>
          <p className="text-secondary text-sm mt-1 mb-6">
            Time to dust off your bags and start planning your next great adventure.
          </p>
          <Link href="/">
            <Button variant="outline">Start searching</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {reservations.map((res) => {
            const isCancelled = res.status === 'CANCELLED';
            const start = new Date(res.startDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const end = new Date(res.endDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={res.id}
                className="rounded-[20px] border border-hairline bg-canvas p-6 shadow-airbnb-rest flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        isCancelled
                          ? 'bg-neutral-200 text-secondary'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {res.status}
                    </span>
                    <span className="text-xs text-secondary">ID: {res.id}</span>
                  </div>
                  <div className="text-base font-bold text-ink mt-2">
                    {start} – {end}
                  </div>
                  <div className="text-sm text-secondary mt-0.5">
                    Total paid: <span className="font-semibold text-ink">${res.totalPrice}</span>
                  </div>
                </div>

                {!isCancelled && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={cancelReservation.isPending}
                    onClick={() => cancelReservation.mutate({ id: res.id })}
                  >
                    {cancelReservation.isPending ? 'Canceling...' : 'Cancel reservation'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
