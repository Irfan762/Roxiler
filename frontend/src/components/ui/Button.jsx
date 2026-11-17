'use client';
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60',
};
export const Button = forwardRef(({ variant = 'primary', loading = false, fullWidth = false, className, children, disabled, ...props }, ref) => {
    return (<button ref={ref} className={cn(variants[variant], fullWidth && 'w-full', className)} disabled={disabled || loading} {...props}>
        {loading && <Loader2 className="h-4 w-4 animate-spin"/>}
        {children}
      </button>);
});
Button.displayName = 'Button';
