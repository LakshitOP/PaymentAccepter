import * as React from 'react';
import { cn } from '@/lib/utils';

type AlertVariant = 'default' | 'warning' | 'danger';

const alertVariants: Record<AlertVariant, string> = {
  default: 'border-slate-200 bg-white text-slate-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-rose-200 bg-rose-50 text-rose-700',
};

export function Alert({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: AlertVariant }) {
  return (
    <div
      className={cn(
        'rounded-2xl border px-4 py-3 text-sm leading-6',
        alertVariants[variant],
        className
      )}
      {...props}
    />
  );
}
