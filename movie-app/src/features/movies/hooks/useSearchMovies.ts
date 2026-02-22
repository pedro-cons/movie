import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getMovies } from '../api/movies.service';
import { QUERY_KEYS } from '@/shared/utils/constants';

export function useSearchMovies(search: string, page: number = 1, limit: number = 12) {
  return useQuery({
    queryKey: [QUERY_KEYS.movies, { search, page, limit }],
    queryFn: () => getMovies({ search, page, limit }),
    placeholderData: keepPreviousData,
    enabled: search.length >= 2,
  });
}
