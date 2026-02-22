import { useQuery } from '@tanstack/react-query';
import { getMovie } from '../api/movies.service';
import { QUERY_KEYS } from '@/shared/utils/constants';

export function useMovie(id: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.movie, id],
    queryFn: () => getMovie(id),
    enabled: !!id,
  });
}
