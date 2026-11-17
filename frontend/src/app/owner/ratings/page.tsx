'use client';

import { useEffect, useState, useCallback } from 'react';
import { ownerApi, type OwnerRatingParams } from '../../../services/owner.service';
import type { RatingWithUser, PaginationMeta } from '../../../types';
import { Navbar } from '../../../components/layout/Navbar';
import { Table, type Column } from '../../../components/ui/Table';
import { Pagination } from '../../../components/ui/Pagination';
import { ErrorState } from '../../../components/ui/ErrorState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { RatingDisplay } from '../../../components/ui/Rating';
import { formatDate } from '../../../lib/utils';
import { Star } from 'lucide-react';

export default function OwnerRatingsPage() {
  const [ratings, setRatings] = useState<RatingWithUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchRatings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: OwnerRatingParams = { page, limit: 10, sortBy, sortOrder };
      const result = await ownerApi.getRatings(params);
      setRatings(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ratings');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const columns: Column<RatingWithUser>[] = [
    {
      key: 'user',
      header: 'User Name',
      sortable: true,
      render: (row) => (
        <span className="font-medium text-gray-900">{row.user.name}</span>
      ),
    },
    { key: 'email', header: 'Email', render: (row) => row.user.email },
    {
      key: 'rating',
      header: 'Rating',
      sortable: true,
      render: (row) => <RatingDisplay value={row.rating} size="sm" />,
    },
    {
      key: 'createdAt',
      header: 'Submitted Date',
      sortable: true,
      render: (row) => (
        <span className="text-gray-500">{formatDate(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <>
      <Navbar title="Store Ratings" subtitle="Users who rated your store" />

      <div className="space-y-4">
        {error ? (
          <ErrorState message={error} onRetry={fetchRatings} />
        ) : ratings.length === 0 && !loading ? (
          <EmptyState
            icon={<Star className="h-12 w-12" />}
            title="No ratings yet"
            message="Once users rate your store, you'll see the list here."
          />
        ) : (
          <>
            <Table
              columns={columns}
              data={ratings}
              loading={loading}
              emptyMessage="No ratings found"
              onSort={handleSort}
              sortKey={sortBy}
              sortOrder={sortOrder}
            />
            {meta && (
              <Pagination
                currentPage={meta.currentPage}
                totalPages={meta.totalPages}
                totalRecords={meta.totalRecords}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
