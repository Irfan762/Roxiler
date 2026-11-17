import api from './api';
import type {
  DashboardStats,
  User,
  StoreWithRating,
  PaginatedResponse,
  ApiResponse,
  Role,
} from '../types';

export interface UserQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  role?: Role;
}

export interface StoreQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export const adminApi = {
  async getDashboard(): Promise<DashboardStats> {
    const { data } = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard');
    return data.data;
  },

  async getUsers(params: UserQueryParams): Promise<PaginatedResponse<User>> {
    const { data } = await api.get<PaginatedResponse<User>>('/admin/users', { params });
    return data;
  },

  async createUser(body: {
    name: string;
    email: string;
    password: string;
    address: string;
    role: Role;
  }): Promise<User> {
    const { data } = await api.post<ApiResponse<User>>('/admin/users', body);
    return data.data;
  },

  async getUserDetails(id: string): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>(`/admin/users/${id}`);
    return data.data;
  },

  async getStores(params: StoreQueryParams): Promise<PaginatedResponse<StoreWithRating>> {
    const { data } = await api.get<PaginatedResponse<StoreWithRating>>('/admin/stores', {
      params,
    });
    return data;
  },

  async createStore(body: {
    name: string;
    email: string;
    address: string;
    ownerId: string;
  }): Promise<void> {
    await api.post('/admin/stores', body);
  },
};
