'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
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
    const { error: errorToast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(loginSchema),
    });
    useEffect(() => {
        if (!isLoading && user) {
            router.replace(ROLE_HOME[user.role] || ROUTES.LOGIN);
        }
    }, [user, isLoading, router]);
    const directSignIn = async (email, pass) => {
        try {
            const loggedIn = await login(email, pass);
            router.replace(ROLE_HOME[loggedIn.role] || ROUTES.LOGIN);
        }
        catch (err) {
            errorToast(err instanceof Error ? err.message : 'Login failed');
        }
    };
    const onSubmit = async (data) => {
        try {
            const loggedIn = await login(data.email, data.password);
            router.replace(ROLE_HOME[loggedIn.role] || ROUTES.LOGIN);
        }
        catch (err) {
            errorToast(err instanceof Error ? err.message : 'Login failed');
        }
    };
    return (<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-emerald-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/20">
            <Star className="h-7 w-7 fill-white text-white"/>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Store Rating System</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
        </div>

        <div className="card p-6 sm:p-8">
          {/* 1-Tap Direct Sign In Section */}
          <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
            <p className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-gray-500">
              ⚡ 1-Tap Direct Sign In
            </p>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => directSignIn('admin@rolex.com', 'Admin@123')} className="flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 transition hover:bg-purple-100">
                <span>👑 System Admin</span>
                <span className="font-mono text-[11px] opacity-75">admin@rolex.com</span>
              </button>

              <button type="button" onClick={() => directSignIn('owner1@example.com', 'Owner@123')} className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100">
                <span>🏪 Store Owner (Rameshwar)</span>
                <span className="font-mono text-[11px] opacity-75">owner1@example.com</span>
              </button>

              <button type="button" onClick={() => directSignIn('alice@example.com', 'Password@123')} className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100">
                <span>👤 Normal User (Aarav)</span>
                <span className="font-mono text-[11px] opacity-75">alice@example.com</span>
              </button>
            </div>
          </div>

          <div className="relative mb-5 text-center text-xs text-gray-400">
            <span className="bg-white px-2">or sign in with password</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')}/>

            <div className="relative">
              <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" error={errors.password?.message} {...register('password')}/>
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[34px] text-gray-400 transition-colors hover:text-gray-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
              </button>
            </div>

            <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
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
          Use one common login page for all roles — admin, user, and store owner.
        </p>
      </div>
    </div>);
}
