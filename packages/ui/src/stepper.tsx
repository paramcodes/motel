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
  return (
    <div className={cn('flex items-center justify-between py-4 border-b border-hairline-soft', className)}>
      <div>
        <div className="text-base font-semibold text-ink">{title}</div>
        {subtitle && <div className="text-sm text-secondary">{subtitle}</div>}
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label={`Decrease ${title}`}
          className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-full border border-hairline flex items-center justify-center text-secondary disabled:opacity-30 disabled:pointer-events-none hover:border-ink transition active:scale-95"
        >
          –
        </button>
        <span className="w-6 text-center text-base font-semibold text-ink">{value}</span>
        <button
          type="button"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          aria-label={`Increase ${title}`}
          className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-full border border-hairline flex items-center justify-center text-secondary disabled:opacity-30 disabled:pointer-events-none hover:border-ink transition active:scale-95"
        >
          +
        </button>
      </div>
    </div>
  );
}
