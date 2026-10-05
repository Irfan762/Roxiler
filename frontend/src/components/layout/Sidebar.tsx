'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Star, Store, Users, LayoutDashboard, Plus, ClipboardList } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { roleLabel, getInitials } from '../../lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Users', href: '/admin/users', icon: <Users className="h-5 w-5" /> },
  { label: 'Stores', href: '/admin/stores', icon: <Store className="h-5 w-5" /> },
  { label: 'Add User', href: '/admin/add-user', icon: <Plus className="h-5 w-5" /> },
  { label: 'Add Store', href: '/admin/add-store', icon: <Plus className="h-5 w-5" /> },
];

const userNav: NavItem[] = [
  { label: 'Stores', href: '/user/stores', icon: <Store className="h-5 w-5" /> },
];

const ownerNav: NavItem[] = [
  { label: 'Dashboard', href: '/owner/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Ratings', href: '/owner/ratings', icon: <ClipboardList className="h-5 w-5" /> },
];

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case 'SYSTEM_ADMIN':
      return adminNav;
    case 'NORMAL_USER':
      return userNav;
    case 'STORE_OWNER':
      return ownerNav;
    default:
      return [];
  }
}

function getBrandTitle(role: string): { title: string; subtitle: string } {
  switch (role) {
    case 'SYSTEM_ADMIN':
      return { title: 'Admin Panel', subtitle: 'Store Rating System' };
    case 'NORMAL_USER':
      return { title: 'Store Browser', subtitle: 'Rate & Explore' };
    case 'STORE_OWNER':
      return { title: 'Owner Dashboard', subtitle: 'Your Store Ratings' };
    default:
      return { title: 'Dashboard', subtitle: '' };
  }
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const navItems = getNavItems(user.role);
  const { title, subtitle } = getBrandTitle(user.role);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b border-gray-200 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Star className="h-5 w-5 fill-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-gray-900">{title}</h1>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin/dashboard' &&
              item.href !== '/owner/dashboard' &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 px-3 py-4">
        <div className="mb-2 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
            <p className="truncate text-xs text-gray-500">{roleLabel(user.role)}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — desktop fixed, mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-white transition-transform duration-200 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
