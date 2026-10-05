'use client';

import { type ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { roleLabel, getInitials } from '../../lib/utils';
import { ChangePasswordDialog } from './ChangePasswordDialog';

interface NavbarProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function Navbar({ title, subtitle, actions }: NavbarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3.5 lg:px-8">
        <div className="ml-12 lg:ml-0">
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {actions}
          {user && (
            <>
              <ChangePasswordDialog />
              <div className="flex items-center gap-2.5 rounded-lg border border-gray-200 px-3 py-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {getInitials(user.name)}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{roleLabel(user.role)}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
