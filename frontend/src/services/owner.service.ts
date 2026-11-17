import api from './api';
import type {
  StoreOwnerDashboard,
  RatingWithUser,
  PaginatedResponse,
  ApiResponse,
} from '../types';

export interface OwnerRatingParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const ownerApi = {
  async getDashboard(): Promise<StoreOwnerDashboard> {
    const { data } = await api.get<ApiResponse<StoreOwnerDashboard>>('/owner/dashboard');
    return data.data;
  },

  async getRatings(
    params: OwnerRatingParams,
  ): Promise<PaginatedResponse<RatingWithUser>> {
    const { data } = await api.get<PaginatedResponse<RatingWithUser>>('/owner/ratings', {
      params,
    });
    return data;
  },
};
