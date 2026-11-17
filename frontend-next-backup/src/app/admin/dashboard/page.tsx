'use client';

import { useEffect, useState } from 'react';
import { Users, Store, Star, UserCog } from 'lucide-react';
import { adminApi } from '../../../services/admin.service';
import type { DashboardStats } from '../../../types';
import { DashboardCard } from '../../../components/ui/DashboardCard';
import { Navbar } from '../../../components/layout/Navbar';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { roleLabel } from '../../../lib/utils';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getDashboard();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <>
      <Navbar title="Admin Dashboard" subtitle="System overview and statistics" />
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchStats} />
      ) : stats ? (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DashboardCard
              label="Total Users"
              value={stats.totalUsers}
              icon={<Users className="h-6 w-6" />}
              accent="blue"
            />
            <DashboardCard
              label="Total Stores"
              value={stats.totalStores}
              icon={<Store className="h-6 w-6" />}
              accent="emerald"
            />
            <DashboardCard
              label="Total Ratings"
              value={stats.totalRatings}
              icon={<Star className="h-6 w-6" />}
              accent="amber"
            />
          </div>

          {/* User breakdown by role */}
          <div className="card p-5">
            <h3 className="mb-4 text-base font-semibold text-gray-900">Users by Role</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {stats.usersByRole.map((item) => (
                <div
                  key={item.role}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {roleLabel(item.role)}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
