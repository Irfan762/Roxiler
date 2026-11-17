'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Store as StoreIcon, Star, Pencil, Plus } from 'lucide-react';
import { storeApi, type StoreQueryParams } from '../../../services/store.service';
import type { StoreWithRating, PaginationMeta } from '../../../types';
import { Navbar } from '../../../components/layout/Navbar';
import { SearchBar } from '../../../components/ui/SearchBar';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Pagination } from '../../../components/ui/Pagination';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorState } from '../../../components/ui/ErrorState';
import { RatingDisplay } from '../../../components/ui/Rating';
import { ROUTES } from '../../../lib/constants';

export default function UserStoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<StoreWithRating[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: StoreQueryParams = { page, limit: 12, sortBy, sortOrder };
      if (search) params.search = search;

      const result = await storeApi.getStores(params);
      setStores(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stores');
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, sortOrder]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      else fetchStores();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <>
      <Navbar
        title="Browse Stores"
        subtitle="Discover and rate stores in your area"
        actions={
          <div className="hidden items-center gap-2 sm:flex">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [s, o] = e.target.value.split('-');
                setSortBy(s);
                setSortOrder(o as 'asc' | 'desc');
                setPage(1);
              }}
              className="input-field py-2 text-sm"
            >
              <option value="createdAt-desc">Newest</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
            </select>
          </div>
        }
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by store name or address..."
          />
          <div className="sm:hidden">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [s, o] = e.target.value.split('-');
                setSortBy(s);
                setSortOrder(o as 'asc' | 'desc');
                setPage(1);
              }}
              className="input-field py-2 text-sm"
            >
              <option value="createdAt-desc">Newest</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
            </select>
          </div>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={fetchStores} />
        ) : loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : stores.length === 0 ? (
          <EmptyState
            icon={<StoreIcon className="h-12 w-12" />}
            title="No stores found"
            message="Try adjusting your search or check back later."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <div
                key={store.id}
                className="card card-hover flex flex-col p-5"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <StoreIcon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{store.name}</h3>
                  </div>
                </div>

                <p className="mb-4 flex items-start gap-1.5 text-sm text-gray-500">
                  <span className="mt-0.5">📍</span>
                  {store.address || 'No address'}
                </p>

                {/* Overall rating */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500">Overall Rating</p>
                  <div className="mt-1 flex items-center gap-2">
                    <RatingDisplay value={store.averageRating} size="sm" />
                    {store.totalRatings > 0 && (
                      <Badge color="bg-gray-100 text-gray-500">
                        {store.totalRatings} review(s)
                      </Badge>
                    )}
                  </div>
                </div>

                {/* User's rating */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500">Your Rating</p>
                  <div className="mt-1">
                    {store.userRating ? (
                      <RatingDisplay value={store.userRating} size="sm" />
                    ) : (
                      <span className="text-sm text-gray-400">Not rated yet</span>
                    )}
                  </div>
                </div>

                {/* Action button */}
                <div className="mt-auto pt-2">
                  {store.userRating ? (
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => router.push(ROUTES.USER_STORE_DETAIL(store.id))}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Rating
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      onClick={() => router.push(ROUTES.USER_STORE_DETAIL(store.id))}
                    >
                      <Plus className="h-4 w-4" />
                      Submit Rating
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {meta && stores.length > 0 && (
          <Pagination
            currentPage={meta.currentPage}
            totalPages={meta.totalPages}
            totalRecords={meta.totalRecords}
            onPageChange={setPage}
          />
        )}
      </div>
    </>
  );
}
