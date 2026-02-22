export interface Rating {
  id: number;
  value: number;
  comment: string | null;
  movieId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRatingPayload {
  value: number;
  comment?: string;
  movieId: number;
}
