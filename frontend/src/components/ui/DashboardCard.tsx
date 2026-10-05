'use client';

import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface DashboardCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  accent?: 'blue' | 'emerald' | 'amber' | 'purple';
}

const accents = {
  blue: 'bg-brand-50 text-brand-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  purple: 'bg-purple-50 text-purple-600',
};

export function DashboardCard({
  label,
  value,
  icon,
  accent = 'blue',
}: DashboardCardProps) {
  return (
    <div className="card card-hover p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            accents[accent],
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
