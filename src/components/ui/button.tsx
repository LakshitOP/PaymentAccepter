import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-slate-950 text-white shadow-lg shadow-slate-950/10 hover:bg-slate-800',
  secondary:
    'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400',
  outline:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  ghost:
    'text-slate-700 hover:bg-slate-100',
  destructive:
    'bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-400',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-11 px-5 py-2.5',
  sm: 'h-9 px-3.5 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10',
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
