'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, Eye, EyeOff, ShieldCheck, Store, UserCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { loginSchema } from '../../schemas/auth.schema';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ROUTES, ROLE_HOME } from '../../lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();
  const { error: errorToast, success: successToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [activeOneTap, setActiveOneTap] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!isLoading && user) {
      window.location.href = ROLE_HOME[user.role] || ROUTES.LOGIN;
    }
  }, [user, isLoading]);

  // One-Tap Direct Login handler
  const handleOneTap = async (roleName, email, password) => {
    try {
      setActiveOneTap(roleName);
      setValue('email', email);
      setValue('password', password);

      const loggedIn = await login(email, password);
      successToast(`Signed in successfully as ${loggedIn.name}`);
      
      const targetUrl = ROLE_HOME[loggedIn.role] || ROUTES.LOGIN;
      window.location.href = targetUrl;
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Login failed');
      setActiveOneTap(null);
    }
  };

  const onSubmit = async (data) => {
    try {
      const loggedIn = await login(data.email, data.password);
      successToast(`Signed in successfully as ${loggedIn.name}`);
      const targetUrl = ROLE_HOME[loggedIn.role] || ROUTES.LOGIN;
      window.location.href = targetUrl;
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-emerald-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/20">
            <Star className="h-7 w-7 fill-white text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Store Rating System</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
        </div>

        <div className="card p-6 sm:p-8 shadow-xl border border-gray-100 bg-white rounded-2xl">
          {/* ONE-TAP INSTANT LOGIN SECTION */}
          <div className="mb-6 rounded-2xl border-2 border-brand-100 bg-gradient-to-b from-blue-50/60 to-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700 flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ⚡ 1-Tap Instant Login
              </span>
              <span className="text-[11px] text-gray-400 font-medium">Click any role to enter</span>
            </div>

            <div className="space-y-2">
              {/* Admin Button */}
              <button
                type="button"
                disabled={activeOneTap !== null}
                onClick={() => handleOneTap('admin', 'admin@rolex.com', 'Admin@123')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-purple-200 bg-purple-50/80 hover:bg-purple-100/90 hover:border-purple-300 transition text-left group shadow-sm disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-purple-200 text-purple-800 rounded-lg group-hover:scale-105 transition">
                    {activeOneTap === 'admin' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-900 leading-tight">System Admin</p>
                    <p className="text-[11px] text-purple-600">Rajesh Sharma Admin</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-white/80 px-2 py-0.5 rounded text-purple-700 border border-purple-200">
                  {activeOneTap === 'admin' ? 'Entering...' : 'Tap to Login →'}
                </span>
              </button>

              {/* Store Owner Button */}
              <button
                type="button"
                disabled={activeOneTap !== null}
                onClick={() => handleOneTap('owner', 'owner1@example.com', 'Owner@123')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-amber-200 bg-amber-50/80 hover:bg-amber-100/90 hover:border-amber-300 transition text-left group shadow-sm disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-200 text-amber-800 rounded-lg group-hover:scale-105 transition">
                    {activeOneTap === 'owner' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Store className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-900 leading-tight">Store Owner</p>
                    <p className="text-[11px] text-amber-700">Rameshwar Nath Agarwal</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-white/80 px-2 py-0.5 rounded text-amber-800 border border-amber-200">
                  {activeOneTap === 'owner' ? 'Entering...' : 'Tap to Login →'}
                </span>
              </button>

              {/* Normal User Button */}
              <button
                type="button"
                disabled={activeOneTap !== null}
                onClick={() => handleOneTap('user', 'alice@example.com', 'Password@123')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100/90 hover:border-blue-300 transition text-left group shadow-sm disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-200 text-blue-800 rounded-lg group-hover:scale-105 transition">
                    {activeOneTap === 'user' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-900 leading-tight">Normal User / Customer</p>
                    <p className="text-[11px] text-blue-600">Aarav Rajesh Kulkarni</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-white/80 px-2 py-0.5 rounded text-blue-700 border border-blue-200">
                  {activeOneTap === 'user' ? 'Entering...' : 'Tap to Login →'}
                </span>
              </button>
            </div>
          </div>

          <div className="relative mb-5 text-center text-xs text-gray-400">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <span className="relative bg-white px-3 text-gray-400">or enter credentials manually</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-gray-400 transition-colors hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button type="submit" fullWidth loading={isSubmitting || activeOneTap !== null} className="mt-2">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href={ROUTES.SIGNUP} className="font-semibold text-brand-600 hover:text-brand-700">
              Sign up
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Store Rating System • Role-based Dashboard & Ratings
        </p>
      </div>
    </div>
  );
}
