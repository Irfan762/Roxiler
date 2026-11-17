'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import type { z } from 'zod';
import { createStoreSchema } from '../../../schemas/admin.schema';
import { adminApi } from '../../../services/admin.service';
import { useToast } from '../../../hooks/useToast';
import { Navbar } from '../../../components/layout/Navbar';
import { Input, Textarea } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ROUTES } from '../../../lib/constants';

type FormData = z.infer<typeof createStoreSchema>;

export default function AddStorePage() {
  const router = useRouter();
  const { success, error: errorToast } = useToast();
  const [owners, setOwners] = useState<{ id: string; name: string }[]>([]);
  const [loadingOwners, setLoadingOwners] = useState(true);

  // Fetch store owners for the dropdown
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const result = await adminApi.getUsers({ role: 'STORE_OWNER', limit: 100 });
        setOwners(result.data.map((u) => ({ id: u.id, name: u.name })));
      } catch (err) {
        errorToast('Failed to load store owners');
      } finally {
        setLoadingOwners(false);
      }
    };
    fetchOwners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(createStoreSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await adminApi.createStore({
        name: data.name,
        email: data.email,
        address: data.address,
        ownerId: data.ownerId,
      });
      success('Store created successfully');
      router.push(ROUTES.ADMIN_STORES);
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Failed to create store');
    }
  };

  return (
    <>
      <Navbar title="Add Store" subtitle="Create a new store" />

      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="secondary" onClick={() => router.push(ROUTES.ADMIN_STORES)}>
          <ArrowLeft className="h-4 w-4" />
          Back to Stores
        </Button>

        <div className="card p-6 sm:p-8">
          {loadingOwners ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : owners.length === 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              No store owners available. Please create a user with the Store Owner role first.
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Store Name"
                placeholder="Enter store name (20-60 characters)"
                error={errors.name?.message}
                hint="Must be 20-60 characters"
                {...register('name')}
              />

              <Input
                label="Store Email"
                type="email"
                placeholder="store@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Textarea
                label="Store Address"
                rows={2}
                placeholder="Enter store address"
                error={errors.address?.message}
                hint="Max 400 characters"
                {...register('address')}
              />

              <Select
                label="Store Owner"
                placeholder="Select a store owner"
                options={owners.map((o) => ({ value: o.id, label: o.name }))}
                error={errors.ownerId?.message}
                {...register('ownerId')}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => router.push(ROUTES.ADMIN_STORES)}>
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Create Store
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
