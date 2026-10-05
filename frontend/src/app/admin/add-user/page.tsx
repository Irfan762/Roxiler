'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import type { z } from 'zod';
import { createUserSchema } from '../../../schemas/admin.schema';
import { adminApi } from '../../../services/admin.service';
import { useToast } from '../../../hooks/useToast';
import { Navbar } from '../../../components/layout/Navbar';
import { Input, Textarea } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { ROUTES } from '../../../lib/constants';

type FormData = z.infer<typeof createUserSchema>;

export default function AddUserPage() {
  const router = useRouter();
  const { success, error: errorToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: '' as any },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await adminApi.createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        address: data.address,
        role: data.role,
      });
      success('User created successfully');
      router.push(ROUTES.ADMIN_USERS);
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  return (
    <>
      <Navbar title="Add User" subtitle="Create a new user account" />

      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="secondary" onClick={() => router.push(ROUTES.ADMIN_USERS)}>
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>

        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Enter full name (20-60 characters)"
              error={errors.name?.message}
              hint="Must be 20-60 characters"
              {...register('name')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="user@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Textarea
              label="Address"
              rows={2}
              placeholder="Enter street address"
              error={errors.address?.message}
              hint="Max 400 characters"
              {...register('address')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              hint="8-16 chars, 1 uppercase, 1 special char"
              {...register('password')}
            />

            <Select
              label="Role"
              placeholder="Select a role"
              options={[
                { value: 'NORMAL_USER', label: 'Normal User' },
                { value: 'SYSTEM_ADMIN', label: 'System Admin' },
                { value: 'STORE_OWNER', label: 'Store Owner' },
              ]}
              error={errors.role?.message}
              {...register('role')}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => router.push(ROUTES.ADMIN_USERS)}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Create User
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
