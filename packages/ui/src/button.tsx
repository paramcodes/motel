import * as React from 'react';
import { cn } from './utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variantStyles = {
      primary:
        'bg-rausch hover:bg-deep-rausch text-canvas font-semibold shadow-sm active:scale-[0.97] active:duration-75',
      secondary:
        'bg-ink hover:bg-black text-canvas font-semibold shadow-sm active:scale-[0.97] active:duration-75',
      outline:
        'border border-hairline hover:border-ink bg-canvas text-ink font-semibold shadow-sm active:scale-[0.97] active:duration-75',
      ghost: 'hover:bg-surface-soft text-ink font-medium active:scale-[0.97] active:duration-75',
    };

    const sizeStyles = {
      sm: 'h-9 px-3 text-xs rounded-lg min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0',
      md: 'h-11 px-5 text-sm rounded-lg min-h-[44px]',
      lg: 'h-12 px-6 text-base rounded-xl min-h-[48px]',
      icon: 'h-10 w-10 p-0 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:opacity-50 disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
