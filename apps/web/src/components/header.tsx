'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

const DESTINATION_REGIONS = [
  { name: "I'm flexible", icon: '🗺️', desc: 'Any worldwide stay' },
  { name: 'Europe', icon: '🏰', desc: 'France, Italy, Spain' },
  { name: 'United States', icon: '🗽', desc: 'Coast-to-coast stays' },
  { name: 'Japan', icon: '🏯', desc: 'Tokyo, Kyoto, Osaka' },
  { name: 'Southeast Asia', icon: '🌴', desc: 'Bali, Thailand, Vietnam' },
  { name: 'Caribbean', icon: '🌊', desc: 'Turks & Caicos, Bahamas' },
];

export function NavigationHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [activeSegment, setActiveSegment] = React.useState<'where' | 'dates' | 'who'>('where');
  const [activeTab, setActiveTab] = React.useState<'stays' | 'experiences'>('stays');

  const [destination, setDestination] = React.useState(
    searchParams.get('destination') || "I'm flexible",
  );
  const [checkIn, setCheckIn] = React.useState(searchParams.get('checkIn') || 'Nov 14');
  const [checkOut, setCheckOut] = React.useState(searchParams.get('checkOut') || 'Nov 18');
  const [guests, setGuests] = React.useState({
    adults: Number(searchParams.get('adults') || 4),
    children: Number(searchParams.get('children') || 3),
    infants: 0,
    pets: 0,
  });

  const headerRef = React.useRef<HTMLElement>(null);
  const totalGuests = guests.adults + guests.children + guests.infants + guests.pets;

  // Click outside to collapse
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination && destination !== "I'm flexible") {
      params.set('destination', destination);
    }
    if (totalGuests > 0) {
      params.set('guests', String(totalGuests));
    }
    setIsExpanded(false);
    router.push(`/?${params.toString()}`);
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 bg-canvas transition-[padding,box-shadow] duration-200 ease-out"
    >
      {/* Top Navbar */}
      <div
        className={`px-6 md:px-12 border-b border-hairline-soft transition-[padding] duration-200 ease-out ${isExpanded ? 'pb-5 pt-4' : 'h-20 flex items-center'}`}
      >
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setIsExpanded(false)}
          >
            <svg
              className="h-8 w-8 fill-rausch transition-transform duration-200 group-hover:scale-105"
              viewBox="0 0 32 32"
            >
              <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.116 12.553 7.1 14.865 1.458 3.447.886 6.837-1.468 9.215-2.227 2.251-5.419 3.126-8.916 2.626-3.497.5-6.689-.375-8.916-2.626-2.354-2.378-2.926-5.768-1.468-9.215.984-2.312 5.146-11.035 7.1-14.865l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.396 0-2.375.642-3.454 2.569l-.53 1.021C10.088 10.428 5.955 19.1 5.01 21.328c-1.127 2.665-.67 5.182 1.085 6.953 1.761 1.777 4.382 2.476 7.395 2.012 1.034-.16 2.008-.432 2.51-.776.502.344 1.476.616 2.51.776 3.013.464 5.634-.235 7.395-2.012 1.755-1.771 2.212-4.288 1.085-6.953-.945-2.228-5.078-10.9-7.006-14.738l-.53-1.021C18.375 3.642 17.396 3 16 3zm0 15c2.209 0 4 1.791 4 4 0 1.408-.727 2.646-1.826 3.364C17.484 25.819 16.77 26 16 26s-1.484-.181-2.174-.636C12.727 24.646 12 23.408 12 22c0-2.209 1.791-4 4-4z" />
            </svg>
            <span className="text-xl font-bold tracking-tight text-rausch">motel</span>
          </Link>

          {/* Center: Search Pill or Tabs with fluid transition */}
          <AnimatePresence mode="wait" initial={false}>
            {!isExpanded ? (
              <motion.div
                key="pill"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center rounded-full border border-hairline bg-canvas p-1.5 shadow-airbnb-rest hover:shadow-airbnb-hover transition-[box-shadow] duration-200 select-none"
              >
                {/* WHERE */}
                <div
                  onClick={() => {
                    setIsExpanded(true);
                    setActiveSegment('where');
                  }}
                  className="cursor-pointer rounded-full transition-colors text-left px-5 py-2 hover:bg-neutral-100/70"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                    Where
                  </div>
                  <div className="text-xs font-semibold text-ink truncate max-w-[130px]">
                    {destination}
                  </div>
                </div>

                <div className="h-6 w-px bg-hairline" />

                {/* DATES */}
                <div
                  onClick={() => {
                    setIsExpanded(true);
                    setActiveSegment('dates');
                  }}
                  className="cursor-pointer rounded-full transition-colors text-left px-5 py-2 hover:bg-neutral-100/70"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                    Dates
                  </div>
                  <div className="text-xs font-semibold text-ink truncate max-w-[140px]">{`${checkIn} – ${checkOut}`}</div>
                </div>

                <div className="h-6 w-px bg-hairline" />

                {/* GUESTS */}
                <div
                  onClick={() => {
                    setIsExpanded(true);
                    setActiveSegment('who');
                  }}
                  className="cursor-pointer rounded-full transition-colors text-left px-5 py-2 hover:bg-neutral-100/70"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                    Guests
                  </div>
                  <div className="text-xs font-semibold text-ink truncate max-w-[110px]">{`${totalGuests} guests`}</div>
                </div>

                {/* Search Orb */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                    setActiveSegment('where');
                  }}
                  aria-label="Search"
                  className="h-9 w-9 rounded-full bg-rausch hover:bg-deep-rausch text-canvas flex items-center justify-center shrink-0 shadow-md ml-1 transition-[background-color,transform] duration-150 active:scale-90"
                >
                  <svg
                    className="h-4 w-4 stroke-canvas"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="tabs"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-6"
              >
                <button
                  onClick={() => setActiveTab('stays')}
                  className={`text-base pb-1 transition-colors relative ${activeTab === 'stays' ? 'text-ink font-semibold' : 'text-secondary hover:text-ink'}`}
                >
                  Stays
                  {activeTab === 'stays' && (
                    <motion.div
                      layoutId="headerTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('experiences')}
                  className={`text-base pb-1 transition-colors relative ${activeTab === 'experiences' ? 'text-ink font-semibold' : 'text-secondary hover:text-ink'}`}
                >
                  Experiences
                  {activeTab === 'experiences' && (
                    <motion.div
                      layoutId="headerTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right: Host CTA & Profile */}
          <div className="flex items-center gap-3">
            <Link
              href="/host/create"
              className="hidden md:block rounded-full px-4 py-2.5 text-sm font-semibold hover:bg-surface-soft transition-colors duration-150"
            >
              Become a host
            </Link>
            <div className="flex items-center gap-3 rounded-full border border-hairline p-1.5 pl-3.5 shadow-sm hover:shadow-md transition-[box-shadow,transform] duration-200 active:scale-95 cursor-pointer">
              <svg className="h-4 w-4 stroke-ink" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
              <div className="h-7 w-7 rounded-full bg-secondary/30 flex items-center justify-center text-xs font-bold text-white">
                P
              </div>
            </div>
          </div>
        </div>

        {/* Expanded 3-Segment Stacked Search Bar with smooth slide & active indicator */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 flex justify-center"
            >
              <div className="relative flex items-center rounded-full border border-hairline bg-surface-soft p-1.5 shadow-airbnb-hover hover:shadow-airbnb-expanded transition-[box-shadow] duration-200 max-w-2xl w-full">
                {/* WHERE */}
                <div
                  onClick={() => setActiveSegment('where')}
                  className="relative flex-1 cursor-pointer rounded-full px-6 py-2.5 text-left z-10 transition-colors"
                >
                  {activeSegment === 'where' && (
                    <motion.div
                      layoutId="activeSegmentIndicator"
                      className="absolute inset-0 rounded-full bg-white shadow-sm border border-hairline/60 -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ink">
                    Where
                  </div>
                  <div className="text-xs font-semibold text-ink truncate">{destination}</div>
                </div>

                {activeSegment !== 'where' && activeSegment !== 'dates' && (
                  <div className="h-6 w-px bg-hairline" />
                )}

                {/* DATES */}
                <div
                  onClick={() => setActiveSegment('dates')}
                  className="relative flex-1 cursor-pointer rounded-full px-6 py-2.5 text-left z-10 transition-colors"
                >
                  {activeSegment === 'dates' && (
                    <motion.div
                      layoutId="activeSegmentIndicator"
                      className="absolute inset-0 rounded-full bg-white shadow-sm border border-hairline/60 -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ink">
                    Dates
                  </div>
                  <div className="text-xs font-semibold text-ink truncate">{`${checkIn} – ${checkOut}`}</div>
                </div>

                {activeSegment !== 'dates' && activeSegment !== 'who' && (
                  <div className="h-6 w-px bg-hairline" />
                )}

                {/* GUESTS */}
                <div
                  onClick={() => setActiveSegment('who')}
                  className="relative flex-1 cursor-pointer rounded-full px-6 py-2.5 text-left z-10 transition-colors"
                >
                  {activeSegment === 'who' && (
                    <motion.div
                      layoutId="activeSegmentIndicator"
                      className="absolute inset-0 rounded-full bg-white shadow-sm border border-hairline/60 -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ink">
                    Guests
                  </div>
                  <div className="text-xs font-semibold text-ink truncate">{`${totalGuests} guests`}</div>
                </div>

                {/* Search Button (Expands with label) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSearch();
                  }}
                  aria-label="Search"
                  className="h-10 md:h-11 px-4 rounded-full bg-rausch hover:bg-deep-rausch text-canvas flex items-center gap-2 shrink-0 shadow-md ml-2 transition-[background-color,transform] duration-150 active:scale-95 font-semibold text-sm"
                >
                  <svg
                    className="h-4 w-4 stroke-canvas"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                  <span>Search</span>
                </button>

                {/* Anchored Dropdown Popovers */}
                <AnimatePresence>
                  {activeSegment === 'where' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.97, filter: 'blur(3px)' }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: 8, scale: 0.97, filter: 'blur(3px)' }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-20 left-0 w-96 rounded-[32px] border border-hairline bg-canvas p-6 shadow-airbnb-dialog z-50 origin-top-left"
                    >
                      <div className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">
                        Destination
                      </div>
                      <input
                        type="text"
                        placeholder="Search destinations"
                        value={destination === "I'm flexible" ? '' : destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full rounded-xl border border-hairline px-4 py-2.5 text-sm text-ink mb-4 focus:border-ink focus:outline-none transition-[border-color] duration-150"
                      />
                      <div className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">
                        Search by region
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {DESTINATION_REGIONS.map((region) => (
                          <div
                            key={region.name}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDestination(region.name);
                              setActiveSegment('dates');
                            }}
                            className="cursor-pointer rounded-2xl border border-hairline p-3 hover:border-ink hover:bg-surface-soft transition-[border-color,background-color,transform] duration-150 active:scale-95"
                          >
                            <span className="text-2xl">{region.icon}</span>
                            <div className="mt-2 text-xs font-bold text-ink">{region.name}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeSegment === 'dates' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.97, filter: 'blur(3px)' }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: 8, scale: 0.97, filter: 'blur(3px)' }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-20 left-1/4 w-[480px] rounded-[32px] border border-hairline bg-canvas p-6 shadow-airbnb-dialog z-50 origin-top"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-ink">
                          Select Dates (November 2026)
                        </span>
                        <span className="text-xs text-secondary">Flexible dates ± 3 days</span>
                      </div>
                      <div className="grid grid-cols-7 gap-2 text-center text-xs">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                          <div key={d} className="font-semibold text-secondary py-1">
                            {d}
                          </div>
                        ))}
                        {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                          const isStart = checkIn === `Nov ${day}`;
                          const isEnd = checkOut === `Nov ${day}`;
                          return (
                            <button
                              key={day}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!checkIn || (checkIn && checkOut)) {
                                  setCheckIn(`Nov ${day}`);
                                  setCheckOut('');
                                } else {
                                  setCheckOut(`Nov ${day}`);
                                  setActiveSegment('who');
                                }
                              }}
                              className={`h-9 w-9 rounded-full flex items-center justify-center font-medium transition-[background-color,color,border-color,transform] duration-150 active:scale-90 ${
                                isStart || isEnd
                                  ? 'bg-ink text-canvas font-bold'
                                  : 'hover:border hover:border-ink text-ink'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {activeSegment === 'who' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.97, filter: 'blur(3px)' }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: 8, scale: 0.97, filter: 'blur(3px)' }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-20 right-0 w-96 rounded-[32px] border border-hairline bg-canvas p-6 shadow-airbnb-dialog z-50 origin-top-right"
                    >
                      <div className="space-y-4">
                        {[
                          { key: 'adults' as const, title: 'Adults', desc: 'Ages 13 or above' },
                          { key: 'children' as const, title: 'Children', desc: 'Ages 2–12' },
                          { key: 'infants' as const, title: 'Infants', desc: 'Under 2' },
                          { key: 'pets' as const, title: 'Pets', desc: 'Bringing an animal?' },
                        ].map((row) => (
                          <div
                            key={row.key}
                            className="flex items-center justify-between border-b border-hairline-soft pb-3"
                          >
                            <div>
                              <div className="text-sm font-bold text-ink">{row.title}</div>
                              <div className="text-xs text-secondary">{row.desc}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                disabled={guests[row.key] <= 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setGuests((prev) => ({
                                    ...prev,
                                    [row.key]: Math.max(0, prev[row.key] - 1),
                                  }));
                                }}
                                className="h-8 w-8 rounded-full border border-hairline flex items-center justify-center text-secondary disabled:opacity-30 hover:border-ink transition-[border-color,transform] duration-150 active:scale-90"
                              >
                                –
                              </button>
                              <span className="w-4 text-center text-sm font-bold text-ink">
                                {guests[row.key]}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setGuests((prev) => ({
                                    ...prev,
                                    [row.key]: prev[row.key] + 1,
                                  }));
                                }}
                                className="h-8 w-8 rounded-full border border-hairline flex items-center justify-center text-secondary hover:border-ink transition-[border-color,transform] duration-150 active:scale-90"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dimmed Backdrop with smooth fade */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 top-36 z-30 bg-black/25 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>
    </header>
  );
}
