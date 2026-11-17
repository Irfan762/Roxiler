import React, { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import { Store, Star, Users, MapPin, Mail, Calendar } from 'lucide-react';

export default function OwnerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashRes, ratingsRes] = await Promise.all([
          api.get('/owner/dashboard'),
          api.get('/owner/ratings?limit=50'),
        ]);
        setDashboardData(dashRes.data.data);
        setRatings(ratingsRes.data.data);
      } catch (err) {
        console.error('Failed to load owner data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const store = dashboardData?.store;
  const averageRating = dashboardData?.averageRating || 0;
  const totalRatings = dashboardData?.totalRatings || 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Store Owner Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor your store's customer ratings and review feedback
          </p>
        </div>

        {/* Store Profile Card */}
        {store ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                  Your Store
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">{store.name}</h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{store.address || 'Address not listed'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{store.email}</span>
                  </div>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center min-w-[130px]">
                  <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                    <Star className="w-5 h-5 fill-amber-400" />
                    <span className="text-2xl font-black text-amber-900">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-amber-700 uppercase tracking-wide">
                    Avg Rating
                  </span>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center min-w-[130px]">
                  <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                    <Users className="w-5 h-5" />
                    <span className="text-2xl font-black text-blue-900">{totalRatings}</span>
                  </div>
                  <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                    Total Reviews
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500 mb-8">
            No store linked to this owner account. Contact administrator.
          </div>
        )}

        {/* Customer Reviews Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-base font-bold text-gray-900">Customer Ratings & Reviews</h3>
            <p className="text-xs text-gray-500">List of verified users who reviewed your store</p>
          </div>

          {ratings.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No ratings received yet. Once customers rate your store, they will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Customer Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Rating</th>
                    <th className="px-6 py-3">Date Reviewed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white text-sm">
                  {ratings.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {r.user?.name || 'Anonymous User'}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{r.user?.email || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= r.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                          <span className="ml-2 font-bold text-gray-700 text-xs">
                            {r.rating} / 5
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{new Date(r.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
