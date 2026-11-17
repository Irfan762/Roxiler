import { cn } from '../../lib/utils';
export function Badge({ children, color, className }) {
    return (<span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', color || 'bg-gray-100 text-gray-700', className)}>
      {children}
    </span>);
}
