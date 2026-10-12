import { AnimatePresence, motion } from 'framer-motion';
import * as React from 'react';
import { cn } from './utils';

export interface StepperProps {
  title: string;
  subtitle?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  className?: string;
}

export function Stepper({
  title,
  subtitle,
  value,
  min = 1,
  max = 20,
  onChange,
  className,
}: StepperProps) {
  const [direction, setDirection] = React.useState<number>(1);
  const prevValue = React.useRef(value);

  const handleDecrease = () => {
    setDirection(-1);
    onChange(Math.max(min, value - 1));
  };

  const handleIncrease = () => {
    setDirection(1);
    onChange(Math.min(max, value + 1));
  };

  React.useEffect(() => {
    if (value > prevValue.current) {
      setDirection(1);
    } else if (value < prevValue.current) {
      setDirection(-1);
    }
    prevValue.current = value;
  }, [value]);

  return (
    <div
      className={cn(
        'flex items-center justify-between py-4 border-b border-hairline-soft',
        className,
      )}
    >
      <div>
        <div className="text-base font-semibold text-ink">{title}</div>
        {subtitle && <div className="text-sm text-secondary">{subtitle}</div>}
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={value <= min}
          onClick={handleDecrease}
          aria-label={`Decrease ${title}`}
          className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-full border border-hairline flex items-center justify-center text-secondary disabled:opacity-30 disabled:pointer-events-none hover:border-ink transition-[border-color,transform] duration-150 active:scale-90"
        >
          –
        </button>
        <div className="relative h-6 w-7 overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.span
              key={value}
              custom={direction}
              initial={{ y: direction > 0 ? 14 : -14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: direction > 0 ? -14 : 14, opacity: 0 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] as const }}
              className="block text-center text-base font-semibold text-ink"
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </div>
        <button
          type="button"
          disabled={value >= max}
          onClick={handleIncrease}
          aria-label={`Increase ${title}`}
          className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-full border border-hairline flex items-center justify-center text-secondary disabled:opacity-30 disabled:pointer-events-none hover:border-ink transition-[border-color,transform] duration-150 active:scale-90"
        >
          +
        </button>
      </div>
    </div>
  );
}
