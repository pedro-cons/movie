import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMovie, updateMovie, deleteMovie } from '../api/movies.service';
import { CreateMoviePayload, UpdateMoviePayload } from '../types/movie.types';
import { QUERY_KEYS } from '@/shared/utils/constants';

export function useCreateMovie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMoviePayload) => createMovie(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.movies] });
    },
  });
}

export function useUpdateMovie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMoviePayload }) => updateMovie(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.movies] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.movie, variables.id] });
    },
  });
}

export function useDeleteMovie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteMovie(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.movies] });
    },
  });
}
