import api from '@/shared/api/axios';
import { Actor, CreateActorPayload, UpdateActorPayload } from '../types/actor.types';
import { Movie } from '@/features/movies/types/movie.types';
import { PaginatedResponse } from '@/shared/types/api.types';

export async function getActors(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse<Actor>> {
  const { data } = await api.get<PaginatedResponse<Actor>>('/actors', { params });
  return data;
}

export async function getActor(id: number): Promise<Actor & { movies: Movie[] }> {
  const { data } = await api.get<Actor & { movies: Movie[] }>(`/actors/${id}`);
  return data;
}

export async function getActorMovies(id: number): Promise<Movie[]> {
  const { data } = await api.get<Movie[]>(`/actors/${id}/movies`);
  return data;
}

export async function createActor(payload: CreateActorPayload): Promise<Actor> {
  const { data } = await api.post<Actor>('/actors', payload);
  return data;
}

export async function updateActor(id: number, payload: UpdateActorPayload): Promise<Actor> {
  const { data } = await api.patch<Actor>(`/actors/${id}`, payload);
  return data;
}

export async function deleteActor(id: number): Promise<void> {
  await api.delete(`/actors/${id}`);
}
