import api from './api';
import type { AuthResponse, User, ApiResponse } from '../types';

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    return data.data;
  },

  async signup(body: {
    name: string;
    email: string;
    address: string;
    password: string;
  }): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/signup', body);
    return data.data;
  },

  async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<{ message: string }> {
    const { data } = await api.post<
      ApiResponse<{ message: string }>
    >('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async me(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data;
  },
};
