import { apiClient } from './apiClient';
import { ApiEnvelope, User } from '@/types';

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface AuthPayload {
  user: User;
  accessToken: string;
}

export const authService = {
  async signup(input: SignupInput) {
    const { data } = await apiClient.post<ApiEnvelope<AuthPayload>>('/auth/signup', input);
    return data.data;
  },

  async login(input: LoginInput) {
    const { data } = await apiClient.post<ApiEnvelope<AuthPayload>>('/auth/login', input);
    return data.data;
  },

  async logout() {
    await apiClient.post('/auth/logout');
  },

  async getMe() {
    const { data } = await apiClient.get<ApiEnvelope<{ user: User }>>('/auth/me');
    return data.data.user;
  },

  async forgotPassword(email: string) {
    await apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string) {
    await apiClient.post('/auth/reset-password', { token, password });
  },

  async verifyEmail(token: string) {
    await apiClient.post('/auth/verify-email', { token });
  },

  async resendVerification() {
    await apiClient.post('/auth/resend-verification');
  },

  async changePassword(currentPassword: string, newPassword: string) {
    await apiClient.post('/auth/change-password', { currentPassword, newPassword });
  },
};
