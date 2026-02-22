import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getActors } from '../api/actors.service';
import { QUERY_KEYS } from '@/shared/utils/constants';

export function useActors(params: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: [QUERY_KEYS.actors, params],
    queryFn: () => getActors(params),
    placeholderData: keepPreviousData,
  });
}
