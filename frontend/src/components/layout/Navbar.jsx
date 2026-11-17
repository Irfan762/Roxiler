'use client';

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { roleLabel, getInitials } from '../../lib/utils';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { ROLE_HOME } from '../../lib/constants';
import { Zap, ShieldCheck, Store, UserCheck } from 'lucide-react';

export function Navbar({ title, subtitle, actions }) {
  const { user, login } = useAuth();
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  const quickSwitch = async (email, password) => {
    try {
      const loggedIn = await login(email, password);
      window.location.href = ROLE_HOME[loggedIn.role] || '/login';
    } catch (err) {
      alert('Failed to switch role');
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3.5 lg:px-8">
        <div className="ml-12 lg:ml-0">
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {actions}

          {/* Quick 1-Tap Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSwitchMenu(!showSwitchMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition shadow-sm"
              title="1-Tap Switch Role"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
              <span className="hidden sm:inline">1-Tap Switch</span>
            </button>

            {showSwitchMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-xl z-50">
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Switch Active Role:
                </p>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => quickSwitch('admin@rolex.com', 'Admin@123')}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-purple-700 hover:bg-purple-50 transition text-left"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <div>
                      <p>System Admin</p>
                      <p className="text-[10px] font-normal text-gray-400">Rajesh Sharma</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => quickSwitch('owner1@example.com', 'Owner@123')}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-amber-800 hover:bg-amber-50 transition text-left"
                  >
                    <Store className="w-4 h-4 text-amber-600" />
                    <div>
                      <p>Store Owner</p>
                      <p className="text-[10px] font-normal text-gray-400">Rameshwar Agarwal</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => quickSwitch('alice@example.com', 'Password@123')}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-50 transition text-left"
                  >
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <div>
                      <p>Normal User</p>
                      <p className="text-[10px] font-normal text-gray-400">Aarav Kulkarni</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

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
