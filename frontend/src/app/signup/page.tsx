'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import type { z } from 'zod';
import { signupSchema } from '../../schemas/auth.schema';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ROUTES, ROLE_HOME } from '../../lib/constants';

type FormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signup, user, isLoading } = useAuth();
  const { error: errorToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(signupSchema),
  });

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(ROLE_HOME[user.role] || ROUTES.LOGIN);
    }
  }, [user, isLoading, router]);

  const onSubmit = async (data: FormData) => {
    try {
      const newUser = await signup({
        name: data.name,
        email: data.email,
        address: data.address,
        password: data.password,
      });
      router.replace(ROLE_HOME[newUser.role] || ROUTES.LOGIN);
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Signup failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-emerald-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/20">
            <Star className="h-7 w-7 fill-white text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create an Account</h1>
          <p className="mt-1 text-sm text-gray-500">Join as a normal user to rate stores</p>
        </div>

        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Your full name (20-60 characters)"
              error={errors.name?.message}
              hint="Must be 20-60 characters"
              {...register('name')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Address"
              placeholder="Your street address"
              error={errors.address?.message}
              hint="Max 400 characters"
              {...register('address')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                hint="8-16 chars, 1 uppercase, 1 special char"
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

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href={ROUTES.LOGIN} className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Only normal users can register publicly. Admins and store owners are created by the system admin.
        </p>
      </div>
    </div>
  );
}
