import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createActor, updateActor, deleteActor } from '../api/actors.service';
import { CreateActorPayload, UpdateActorPayload } from '../types/actor.types';
import { QUERY_KEYS } from '@/shared/utils/constants';

export function useCreateActor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateActorPayload) => createActor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.actors] });
    },
  });
}

export function useUpdateActor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateActorPayload }) => updateActor(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.actors] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.actor, variables.id] });
    },
  });
}

export function useDeleteActor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteActor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.actors] });
    },
  });
}
