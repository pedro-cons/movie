import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRating } from '../api/ratings.service';
import { CreateRatingPayload } from '../types/rating.types';
import { QUERY_KEYS } from '@/shared/utils/constants';

export function useCreateRating() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRatingPayload) => createRating(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.movie, variables.movieId] });
    },
  });
}
