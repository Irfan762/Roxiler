'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

/** Display-only star rating (shows a numeric value with stars). */
export function RatingDisplay({
  value,
  size = 'md',
  showValue = true,
}: {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizes[size],
              star <= Math.round(value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200',
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className={cn('font-semibold text-gray-700', textSizes[size])}>
          {value > 0 ? value.toFixed(1) : 'N/A'}
        </span>
      )}
    </div>
  );
}

/** Interactive star rating selector. */
export function RatingSelector({
  value,
  onChange,
  size = 'lg',
}: {
  value: number;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [hover, setHover] = useState(0);
  const sizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating selector">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110 focus:outline-none"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          role="radio"
          aria-checked={value === star}
        >
          <Star
            className={cn(
              sizes[size],
              star <= (hover || value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-300',
            )}
          />
        </button>
      ))}
    </div>
  );
}
