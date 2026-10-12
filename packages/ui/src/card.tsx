import * as React from 'react';
import { cn } from './utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[20px] bg-canvas border border-hairline/60 shadow-airbnb-rest transition-[box-shadow,transform] duration-200 ease-out',
          hoverEffect && 'hover:shadow-airbnb-hover hover:-translate-y-0.5',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
