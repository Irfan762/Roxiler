'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Mail, MapPin, User as UserIcon, Store, Star } from 'lucide-react';
import { adminApi } from '../../../../services/admin.service';
import type { User } from '../../../../types';
import { Navbar } from '../../../../components/layout/Navbar';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner';
import { ErrorState } from '../../../../components/ui/ErrorState';
import { RatingDisplay } from '../../../../components/ui/Rating';
import { roleBadgeColor, roleLabel, formatDate } from '../../../../lib/utils';
import { ROUTES } from '../../../../lib/constants';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminApi.getUserDetails(id);
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  return (
    <>
      <Navbar title="User Details" subtitle="View user information" />

      <div className="space-y-4">
        <Button variant="secondary" onClick={() => router.push(ROUTES.ADMIN_USERS)}>
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => router.push(ROUTES.ADMIN_USERS)} />
        ) : user ? (
          <div className="space-y-6">
            {/* User info card */}
            <div className="card p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-700">
                    {user.name
                      .split(' ')
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                    <Badge color={roleBadgeColor(user.role)} className="mt-1">
                      {roleLabel(user.role)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
                  <Mail className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
                  <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Address</p>
                    <p className="text-sm text-gray-900">{user.address || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
                  <UserIcon className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Joined</p>
                    <p className="text-sm text-gray-900">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Store info (if store owner) */}
            {user.role === 'STORE_OWNER' && user.store && (
              <div className="card p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Store className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-base font-semibold text-gray-900">Owned Store</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-emerald-50 p-4">
                    <p className="text-xs font-medium text-emerald-600">Store Name</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{user.store.name}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-4">
                    <p className="text-xs font-medium text-emerald-600">Store Email</p>
                    <p className="mt-1 text-sm text-gray-900">{user.store.email}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-4">
                    <p className="text-xs font-medium text-emerald-600">Store Address</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.store.address || 'Not provided'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-4">
                    <p className="mb-2 text-xs font-medium text-emerald-600">
                      Overall Rating
                    </p>
                    <RatingDisplay value={user.store.averageRating} />
                    <p className="mt-1 text-xs text-gray-500">
                      {user.store.totalRatings} total rating(s)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Store owner without store */}
            {user.role === 'STORE_OWNER' && !user.store && (
              <div className="card p-6">
                <div className="flex items-center gap-2 text-gray-500">
                  <Store className="h-5 w-5" />
                  <p className="text-sm">This store owner does not have a store assigned yet.</p>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}
