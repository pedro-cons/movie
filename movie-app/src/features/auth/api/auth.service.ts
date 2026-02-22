import api from '@/shared/api/axios';
import { LoginCredentials, AuthResponse } from '../types/auth.types';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', credentials);
  return data;
}

export async function register(credentials: LoginCredentials) {
  const { data } = await api.post('/auth/register', credentials);
  return data;
}
