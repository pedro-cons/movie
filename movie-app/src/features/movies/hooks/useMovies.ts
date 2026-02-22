import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getMovies } from '../api/movies.service';
import { QUERY_KEYS } from '@/shared/utils/constants';

export function useMovies(params: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: [QUERY_KEYS.movies, params],
    queryFn: () => getMovies(params),
    placeholderData: keepPreviousData,
  });
}
