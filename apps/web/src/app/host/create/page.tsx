'use client';

import {
  CANONICAL_AMENITIES,
  CANONICAL_CATEGORIES,
  type CreateListingInput,
} from '@motel/contracts';
import { Button, Input, Stepper } from '@motel/ui';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { trpc } from '../../../lib/trpc';
export const dynamic = 'force-dynamic';

const STORAGE_KEY = 'motel_host_wizard_draft';

const DEFAULT_VALUES: CreateListingInput = {
  category: 'Beachfront',
  country: 'United States',
  region: 'California',
  city: 'Malibu',
  address: '100 Ocean Way',
  latitude: 34.0259,
  longitude: -118.7798,
  guestCount: 4,
  roomCount: 2,
  bathroomCount: 2,
  amenities: ['wifi', 'kitchen'],
  imageSrc:
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  images: [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  ],
  title: 'Luxury Coastal Sanctuary',
  description:
    'An idyllic private retreat featuring sweeping ocean views, bespoke finishes, and immediate beach access.',
  price: 450,
};

const stepVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 28 : -28,
    opacity: 0,
    filter: 'blur(3px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.22,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -28 : 28,
    opacity: 0,
    filter: 'blur(3px)',
    transition: {
      duration: 0.18,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export default function HostCreateWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = Math.min(Math.max(Number(searchParams.get('step') || 1), 1), 7);

  const [direction, setDirection] = React.useState(1);
  const prevStep = React.useRef(step);

  React.useEffect(() => {
    if (step > prevStep.current) {
      setDirection(1);
    } else if (step < prevStep.current) {
      setDirection(-1);
    }
    prevStep.current = step;
  }, [step]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateListingInput>({
    defaultValues: DEFAULT_VALUES,
  });

  const formValues = watch();

  // Load from sessionStorage on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as Record<string, unknown>;
          for (const key of Object.keys(parsed)) {
            setValue(key as keyof CreateListingInput, parsed[key] as never);
          }
        } catch {
          // ignore
        }
      }
    }
  }, [setValue]);

  // Sync draft to sessionStorage on state changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formValues));
    }
  }, [formValues]);

  const goToStep = (nextStep: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('step', String(nextStep));
    router.push(`/host/create?${params.toString()}`);
  };

  const createListing = trpc.listings.create.useMutation({
    onSuccess: (listing) => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(STORAGE_KEY);
      }
      router.push(`/listings/${listing.id}`);
    },
  });

  const onSubmit = (data: CreateListingInput) => {
    createListing.mutate(data);
  };

  return (
    <div className="min-h-screen bg-canvas pb-28">
      {/* Top Wizard Progress Header */}
      <div className="sticky top-0 z-30 bg-canvas border-b border-hairline-soft px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">Step {step} of 7</span>
        </div>
        <div className="w-1/3 bg-hairline-soft h-1.5 rounded-full overflow-hidden">
          <motion.div
            className="bg-rausch h-full rounded-full"
            animate={{ width: `${(step / 7) * 100}%` }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        </div>
        <button
          onClick={() => router.push('/')}
          className="text-xs font-semibold text-secondary hover:text-ink rounded-full px-3 py-1.5 border border-hairline hover:border-ink transition-[border-color,color,transform] duration-150 active:scale-95"
        >
          Exit
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {/* STEP 1: CATEGORY */}
            {step === 1 && (
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-ink">
                  Which of these best describes your place?
                </h1>
                <p className="text-secondary text-sm mt-1 mb-8">
                  Choose the curated category that best matches your space.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CANONICAL_CATEGORIES.map((cat) => {
                    const isSelected = formValues.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setValue('category', cat)}
                        className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-[border-color,background-color,transform] duration-150 select-none active:scale-95 ${
                          isSelected
                            ? 'border-2 border-black bg-surface-soft shadow-sm'
                            : 'border-hairline hover:border-ink'
                        }`}
                      >
                        <span className="text-2xl mb-2">🏠</span>
                        <span className="text-sm font-semibold text-ink">{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: LOCATION */}
            {step === 2 && (
              <div className="space-y-4">
                <h1 className="text-2xl md:text-3xl font-bold text-ink">
                  Where is your place located?
                </h1>
                <p className="text-secondary text-sm mb-6">
                  Your exact address is only shared with confirmed guests.
                </p>
                <Input
                  placeholder="Country"
                  {...register('country', { required: 'Country is required' })}
                  error={errors.country?.message}
                />
                <Input placeholder="State / Province / Region" {...register('region')} />
                <Input placeholder="City" {...register('city')} />
                <Input placeholder="Street address" {...register('address')} />
              </div>
            )}

            {/* STEP 3: FLOOR PLAN & CAPACITY */}
            {step === 3 && (
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-ink">
                  Share some basics about your place
                </h1>
                <p className="text-secondary text-sm mb-6">
                  You can adjust counts and amenities anytime after publishing.
                </p>
                <Stepper
                  title="Guests"
                  subtitle="How many guests can stay comfortably?"
                  value={formValues.guestCount}
                  min={1}
                  max={16}
                  onChange={(val) => setValue('guestCount', val)}
                />
                <Stepper
                  title="Bedrooms"
                  subtitle="Number of guest bedrooms available"
                  value={formValues.roomCount}
                  min={1}
                  max={20}
                  onChange={(val) => setValue('roomCount', val)}
                />
                <Stepper
                  title="Bathrooms"
                  subtitle="Full and half bathrooms"
                  value={formValues.bathroomCount}
                  min={1}
                  max={20}
                  onChange={(val) => setValue('bathroomCount', val)}
                />
              </div>
            )}

            {/* STEP 4: AMENITIES */}
            {step === 4 && (
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-ink">
                  Tell guests what your place has to offer
                </h1>
                <p className="text-secondary text-sm mb-8">
                  Select all conveniences and features available at your property.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {CANONICAL_AMENITIES.map((amenity) => {
                    const selected = formValues.amenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => {
                          const next = selected
                            ? formValues.amenities.filter((a) => a !== amenity)
                            : [...formValues.amenities, amenity];
                          setValue('amenities', next);
                        }}
                        className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-[border-color,background-color,transform] duration-150 select-none active:scale-95 ${
                          selected
                            ? 'border-2 border-black bg-surface-soft shadow-sm'
                            : 'border-hairline hover:border-ink'
                        }`}
                      >
                        <span className="text-xl">✨</span>
                        <span className="text-sm font-semibold capitalize text-ink">
                          {amenity.replace(/-/g, ' ')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 5: PHOTOS */}
            {step === 5 && (
              <div className="space-y-4">
                <h1 className="text-2xl md:text-3xl font-bold text-ink">
                  Add photos of your space
                </h1>
                <p className="text-secondary text-sm mb-6">
                  High quality photos increase booking conversions.
                </p>
                <Input
                  placeholder="Cover Photo URL (imageSrc)"
                  {...register('imageSrc', { required: 'Cover photo URL is required' })}
                  error={errors.imageSrc?.message}
                />
                {formValues.imageSrc && (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-hairline mt-4">
                    <img
                      src={formValues.imageSrc}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            )}

            {/* STEP 6: TITLE & DESCRIPTION */}
            {step === 6 && (
              <div className="space-y-4">
                <h1 className="text-2xl md:text-3xl font-bold text-ink">
                  Give your listing a title & description
                </h1>
                <p className="text-secondary text-sm mb-6">
                  Highlight what makes your space special.
                </p>
                <div>
                  <Input
                    placeholder="Listing title (5–50 characters)"
                    {...register('title', {
                      required: 'Title is required',
                      minLength: { value: 5, message: 'Minimum 5 characters' },
                      maxLength: { value: 5, message: 'Maximum 50 characters' },
                    })}
                    error={errors.title?.message}
                  />
                </div>
                <div>
                  <textarea
                    rows={5}
                    placeholder="Describe your space in detail (minimum 20 characters)..."
                    className="w-full rounded-xl border border-hairline p-4 text-sm text-ink placeholder:text-secondary focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink transition-[border-color,box-shadow] duration-150"
                    {...register('description', {
                      required: 'Description is required',
                      minLength: { value: 20, message: 'Minimum 20 characters' },
                    })}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 7: PRICE */}
            {step === 7 && (
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-ink">Set your nightly price</h1>
                <p className="text-secondary text-sm mb-8">You can adjust pricing anytime.</p>
                <div className="flex items-center justify-center py-12">
                  <span className="text-4xl md:text-5xl font-bold text-ink mr-2">$</span>
                  <input
                    type="number"
                    min={10}
                    max={10000}
                    className="text-4xl md:text-5xl font-bold text-ink w-48 border-b-2 border-hairline focus:border-ink focus:outline-none text-center transition-[border-color] duration-150"
                    {...register('price', {
                      valueAsNumber: true,
                      required: 'Price is required',
                      min: { value: 10, message: 'Minimum price is $10' },
                    })}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-canvas border-t border-hairline-soft px-6 md:px-12 py-4 flex items-center justify-between">
        <button
          type="button"
          disabled={step === 1}
          onClick={() => goToStep(step - 1)}
          className="text-sm font-semibold text-ink underline disabled:opacity-30 disabled:pointer-events-none transition-opacity duration-150 active:scale-95"
        >
          Back
        </button>

        {step < 7 ? (
          <Button type="button" onClick={() => goToStep(step + 1)}>
            Next
          </Button>
        ) : (
          <Button type="button" disabled={createListing.isPending} onClick={handleSubmit(onSubmit)}>
            {createListing.isPending ? 'Publishing...' : 'Publish listing'}
          </Button>
        )}
      </footer>
    </div>
  );
}
