import { useQuery } from '@tanstack/react-query';
import { getActor } from '../api/actors.service';
import { QUERY_KEYS } from '@/shared/utils/constants';

export function useActor(id: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.actor, id],
    queryFn: () => getActor(id),
    enabled: !!id,
  });
}
