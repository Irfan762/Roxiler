'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Store as StoreIcon, Mail, MapPin } from 'lucide-react';
import { storeApi } from '../../../../services/store.service';
import type { StoreWithRating } from '../../../../types';
import { useToast } from '../../../../hooks/useToast';
import { Navbar } from '../../../../components/layout/Navbar';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner';
import { ErrorState } from '../../../../components/ui/ErrorState';
import { RatingDisplay, RatingSelector } from '../../../../components/ui/Rating';
import { ROUTES } from '../../../../lib/constants';

export default function StoreDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { success, error: errorToast } = useToast();

  const [store, setStore] = useState<StoreWithRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchStore = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await storeApi.getStore(id);
      setStore(data);
      setRating(data.userRating || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load store');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async () => {
    if (rating === 0) {
      errorToast('Please select a rating from 1 to 5');
      return;
    }
    setSubmitting(true);
    try {
      if (store?.userRating) {
        await storeApi.updateRating(id, rating);
        success('Rating updated successfully');
      } else {
        await storeApi.submitRating(id, rating);
        success('Rating submitted successfully');
      }
      fetchStore();
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar title="Store Details" subtitle="Rate this store" />

      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="secondary" onClick={() => router.push(ROUTES.USER_STORES)}>
          <ArrowLeft className="h-4 w-4" />
          Back to Stores
        </Button>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchStore} />
        ) : store ? (
          <div className="space-y-6">
            {/* Store info */}
            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <StoreIcon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{store.name}</h2>
                  <div className="mt-2 space-y-1.5">
                    <p className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="h-4 w-4" /> {store.email}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" /> {store.address || 'No address'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">Overall Rating</p>
                  <div className="mt-2">
                    <RatingDisplay value={store.averageRating} />
                  </div>
                  {store.totalRatings > 0 && (
                    <Badge color="bg-gray-100 text-gray-500 mt-2">
                      {store.totalRatings} review(s)
                    </Badge>
                  )}
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">Your Rating</p>
                  <div className="mt-2">
                    {store.userRating ? (
                      <RatingDisplay value={store.userRating} />
                    ) : (
                      <span className="text-sm text-gray-400">Not rated yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Rate form */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {store.userRating ? 'Update Your Rating' : 'Submit a Rating'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {store.userRating
                  ? 'Select a new rating to replace your previous one.'
                  : 'Select a rating from 1 to 5 stars.'}
              </p>

              <div className="mt-6 flex flex-col items-center gap-4 rounded-lg bg-gray-50 py-8">
                <RatingSelector value={rating} onChange={setRating} />
                <p className="text-sm font-medium text-gray-600">
                  {rating === 0
                    ? 'Click a star to rate'
                    : `${rating} star${rating > 1 ? 's' : ''} selected`}
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => router.push(ROUTES.USER_STORES)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} loading={submitting} disabled={rating === 0}>
                  {store.userRating ? 'Update Rating' : 'Submit Rating'}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
