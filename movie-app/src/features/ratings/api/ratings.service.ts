import api from '@/shared/api/axios';
import { Rating, CreateRatingPayload } from '../types/rating.types';
import { PaginatedResponse } from '@/shared/types/api.types';

export async function getRatings(params: {
  movieId?: number;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Rating>> {
  const { data } = await api.get<PaginatedResponse<Rating>>('/ratings', { params });
  return data;
}

export async function createRating(payload: CreateRatingPayload): Promise<Rating> {
  const { data } = await api.post<Rating>('/ratings', payload);
  return data;
}
