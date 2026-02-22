import api from '@/shared/api/axios';
import { Movie, CreateMoviePayload, UpdateMoviePayload } from '../types/movie.types';
import { Actor } from '@/features/actors/types/actor.types';
import { PaginatedResponse } from '@/shared/types/api.types';

export async function getMovies(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse<Movie>> {
  const { data } = await api.get<PaginatedResponse<Movie>>('/movies', { params });
  return data;
}

export async function getMovie(id: number): Promise<Movie> {
  const { data } = await api.get<Movie>(`/movies/${id}`);
  return data;
}

export async function getMovieActors(id: number): Promise<Actor[]> {
  const { data } = await api.get<Actor[]>(`/movies/${id}/actors`);
  return data;
}

export async function createMovie(payload: CreateMoviePayload): Promise<Movie> {
  const { data } = await api.post<Movie>('/movies', payload);
  return data;
}

export async function updateMovie(id: number, payload: UpdateMoviePayload): Promise<Movie> {
  const { data } = await api.patch<Movie>(`/movies/${id}`, payload);
  return data;
}

export async function deleteMovie(id: number): Promise<void> {
  await api.delete(`/movies/${id}`);
}
