import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getActors } from '../api/actors.service';
import { QUERY_KEYS } from '@/shared/utils/constants';

export function useSearchActors(search: string, page: number = 1, limit: number = 12) {
  return useQuery({
    queryKey: [QUERY_KEYS.actors, { search, page, limit }],
    queryFn: () => getActors({ search, page, limit }),
    placeholderData: keepPreviousData,
    enabled: search.length >= 2,
  });
}
