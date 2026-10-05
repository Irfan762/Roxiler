'use client';

import { useEffect, useState } from 'react';
import { Store, Star, Users } from 'lucide-react';
import { ownerApi } from '../../../services/owner.service';
import type { StoreOwnerDashboard } from '../../../types';
import { Navbar } from '../../../components/layout/Navbar';
import { DashboardCard } from '../../../components/ui/DashboardCard';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorState } from '../../../components/ui/ErrorState';
import { RatingDisplay } from '../../../components/ui/Rating';
import { EmptyState } from '../../../components/ui/EmptyState';

export default function OwnerDashboardPage() {
  const [data, setData] = useState<StoreOwnerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ownerApi.getDashboard();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <>
      <Navbar title="Owner Dashboard" subtitle="Your store overview" />

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDashboard} />
      ) : data ? (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DashboardCard
              label="Average Rating"
              value={data.averageRating > 0 ? data.averageRating.toFixed(1) : 'N/A'}
              icon={<Star className="h-6 w-6" />}
              accent="amber"
            />
            <DashboardCard
              label="Total Ratings"
              value={data.totalRatings}
              icon={<Users className="h-6 w-6" />}
              accent="blue"
            />
          </div>

          {/* Store info */}
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Store className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base font-semibold text-gray-900">Your Store</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500">Store Name</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{data.store.name}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500">Store Email</p>
                <p className="mt-1 text-sm text-gray-900">{data.store.email}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500">Store Address</p>
                <p className="mt-1 text-sm text-gray-900">
                  {data.store.address || 'Not provided'}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-2 text-xs font-medium text-gray-500">Overall Rating</p>
                <RatingDisplay value={data.averageRating} />
                <p className="mt-1 text-xs text-gray-500">
                  Based on {data.totalRatings} rating(s)
                </p>
              </div>
            </div>
          </div>

          {data.totalRatings === 0 && (
            <EmptyState
              icon={<Star className="h-12 w-12" />}
              title="No ratings yet"
              message="Once users start rating your store, you'll see the details here."
            />
          )}
        </div>
      ) : null}
    </>
  );
}
