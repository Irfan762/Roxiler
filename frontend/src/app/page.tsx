'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { ROUTES, ROLE_HOME } from '../lib/constants';
import { PageLoader } from '../components/ui/LoadingSpinner';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      router.replace(ROLE_HOME[user.role] || ROUTES.LOGIN);
    } else {
      router.replace(ROUTES.LOGIN);
    }
  }, [user, isLoading, router]);

  return <PageLoader message="Loading..." />;
}
