import api from './api';
import type { StoreWithRating, PaginatedResponse, ApiResponse } from '../types';

export interface StoreQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export const storeApi = {
  async getStores(params: StoreQueryParams): Promise<PaginatedResponse<StoreWithRating>> {
    const { data } = await api.get<PaginatedResponse<StoreWithRating>>('/stores', {
      params,
    });
    return data;
  },

  async getStore(id: string): Promise<StoreWithRating> {
    const { data } = await api.get<ApiResponse<StoreWithRating>>(`/stores/${id}`);
    return data.data;
  },

  async submitRating(storeId: string, rating: number): Promise<void> {
    await api.post(`/stores/${storeId}/rating`, { rating });
  },

  async updateRating(storeId: string, rating: number): Promise<void> {
    await api.put(`/stores/${storeId}/rating`, { rating });
  },
};
