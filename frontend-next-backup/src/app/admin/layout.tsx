'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../lib/constants';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { Sidebar } from '../../components/layout/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(ROUTES.LOGIN);
    } else if (user.role !== 'SYSTEM_ADMIN') {
      router.replace(ROUTES.USER_STORES);
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'SYSTEM_ADMIN') {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
