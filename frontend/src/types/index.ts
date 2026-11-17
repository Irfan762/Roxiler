export type Role = 'SYSTEM_ADMIN' | 'NORMAL_USER' | 'STORE_OWNER';

export interface User {
  id: string;
  name: string;
  email: string;
  address: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
  store?: StoreWithRating | null;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreWithRating {
  id: string;
  name: string;
  email: string;
  address: string | null;
  ownerId: string;
  averageRating: number;
  totalRatings: number;
  userRating: number | null;
  owner?: { id: string; name: string; email: string };
}

export interface StoreOwnerDashboard {
  store: {
    id: string;
    name: string;
    email: string;
    address: string | null;
  };
  averageRating: number;
  totalRatings: number;
}

export interface RatingWithUser {
  id: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string };
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
  usersByRole: { role: string; count: number }[];
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
}
