import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes intelligently. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date for display. */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Format a date with time. */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Format a rating to one decimal place. */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/** Get initials from a name. */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/** Role display label. */
export function roleLabel(role: string): string {
  switch (role) {
    case 'SYSTEM_ADMIN':
      return 'System Admin';
    case 'NORMAL_USER':
      return 'Normal User';
    case 'STORE_OWNER':
      return 'Store Owner';
    default:
      return role;
  }
}

/** Role badge color class. */
export function roleBadgeColor(role: string): string {
  switch (role) {
    case 'SYSTEM_ADMIN':
      return 'bg-purple-100 text-purple-700';
    case 'NORMAL_USER':
      return 'bg-blue-100 text-blue-700';
    case 'STORE_OWNER':
      return 'bg-emerald-100 text-emerald-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}
