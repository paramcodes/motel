'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CANONICAL_CATEGORIES, Category } from '@motel/contracts';
import { motion } from 'framer-motion';

const CATEGORY_ICONS: Record<Category, string> = {
  Beachfront: '🏖️',
  Cabins: '🪵',
  'Iconic cities': '🏙️',
  Countryside: '🌾',
  Lakefront: '⛵',
  'Amazing views': '🌄',
  'Tiny homes': '🏡',
  Mansions: '🏰',
  Treehouses: '🌳',
  Castles: '🛡️',
  Camping: '⛺',
  'Ski-in/out': '⛷️',
  Luxe: '💎',
  Design: '🎨',
  Islands: '🏝️',
};

export function CategoryBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = (searchParams.get('category') as Category) || 'Beachfront';

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScroll = React.useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  React.useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const handleSelect = (category: Category) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', category);
    router.push(`/?${params.toString()}`);
  };

  const scrollBy = (offset: number) => {
    scrollRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div className="relative border-b border-hairline-soft bg-canvas px-6 md:px-12 flex items-center h-20 select-none">
      {/* Left Chevron */}
      {canScrollLeft && (
        <div className="absolute left-6 z-10 flex items-center pr-4">
          <div className="gradient-mask-left absolute -left-6 top-0 bottom-0 w-16 pointer-events-none" />
          <button
            onClick={() => scrollBy(-280)}
            aria-label="Previous categories"
            className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-canvas shadow-sm hover:scale-105 hover:shadow-md transition active:scale-95"
          >
            <svg className="h-3 w-3 stroke-ink" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>
      )}

      {/* Category List */}
      <div
        ref={scrollRef}
        className="flex w-full items-center gap-8 overflow-x-auto no-scrollbar scroll-smooth py-2"
      >
        {CANONICAL_CATEGORIES.map((cat) => {
          const isSelected = currentCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleSelect(cat)}
              className={`group flex flex-col items-center gap-2 whitespace-nowrap transition relative pb-2 pt-1 min-w-[56px] focus:outline-none ${
                isSelected ? 'text-ink font-semibold' : 'text-secondary hover:text-ink font-medium'
              }`}
            >
              <span className="text-2xl transition group-hover:scale-110">
                {CATEGORY_ICONS[cat] || '🏠'}
              </span>
              <span className="text-xs tracking-tight">{cat}</span>
              {isSelected && (
                <motion.div
                  layoutId="categoryUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-ink rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Right Chevron */}
      <div className="flex items-center pl-4">
        {canScrollRight && (
          <div className="relative flex items-center mr-3">
            <div className="gradient-mask-right absolute -right-4 top-0 bottom-0 w-16 pointer-events-none" />
            <button
              onClick={() => scrollBy(280)}
              aria-label="Next categories"
              className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-canvas shadow-sm hover:scale-105 hover:shadow-md transition active:scale-95"
            >
              <svg className="h-3 w-3 stroke-ink" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
