import { Actor } from '@/features/actors/types/actor.types';
import { Rating } from '@/features/ratings/types/rating.types';

export interface Movie {
  id: number;
  title: string;
  description: string | null;
  releaseDate: string | null;
  genre: string | null;
  actors: Actor[];
  ratings: Rating[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMoviePayload {
  title: string;
  description?: string;
  releaseDate?: string;
  genre?: string;
  actorIds?: number[];
}

export type UpdateMoviePayload = Partial<CreateMoviePayload>;
