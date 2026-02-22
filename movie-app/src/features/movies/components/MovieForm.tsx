'use client';

import { useState, FormEvent } from 'react';
import Input from '@/shared/components/ui/Input';
import Textarea from '@/shared/components/ui/Textarea';
import Button from '@/shared/components/ui/Button';
import Spinner from '@/shared/components/ui/Spinner';
import { Movie, CreateMoviePayload } from '../types/movie.types';
import { Actor } from '@/features/actors/types/actor.types';
import { useActors } from '@/features/actors/hooks/useActors';
import { useCreateMovie, useUpdateMovie } from '../hooks/useMovieMutations';

interface MovieFormProps {
  movie?: Movie;
  onSuccess: () => void;
}

export default function MovieForm({ movie, onSuccess }: MovieFormProps) {
  const isEdit = !!movie;
  const [title, setTitle] = useState(movie?.title ?? '');
  const [description, setDescription] = useState(movie?.description ?? '');
  const [releaseDate, setReleaseDate] = useState(
    movie?.releaseDate ? movie.releaseDate.slice(0, 10) : '',
  );
  const [genre, setGenre] = useState(movie?.genre ?? '');
  const [selectedActorIds, setSelectedActorIds] = useState<number[]>(
    movie?.actors?.map((a) => a.id) ?? [],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: actorsData, isLoading: actorsLoading } = useActors({ page: 1, limit: 100 });
  const createMutation = useCreateMovie();
  const updateMutation = useUpdateMovie();
  const isPending = createMutation.isPending || updateMutation.isPending;

  function toggleActor(id: number) {
    setSelectedActorIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const payload: CreateMoviePayload = {
      title: title.trim(),
      ...(description.trim() && { description: description.trim() }),
      ...(releaseDate && { releaseDate }),
      ...(genre.trim() && { genre: genre.trim() }),
      ...(selectedActorIds.length > 0 && { actorIds: selectedActorIds }),
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: movie.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onSuccess();
    } catch {
      // Error is handled by React Query — mutation.error will be set
    }
  }

  const mutationError = createMutation.error || updateMutation.error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="title"
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="Movie title"
      />
      <Textarea
        id="description"
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Movie description"
      />
      <Input
        id="releaseDate"
        label="Release Date"
        type="date"
        value={releaseDate}
        onChange={(e) => setReleaseDate(e.target.value)}
      />
      <Input
        id="genre"
        label="Genre"
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
        placeholder="e.g. Action, Drama"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Actors</label>
        {actorsLoading ? (
          <Spinner size="sm" />
        ) : (
          <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-300 p-2 space-y-1">
            {actorsData?.data.map((actor: Actor) => (
              <label key={actor.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 px-1 rounded">
                <input
                  type="checkbox"
                  checked={selectedActorIds.includes(actor.id)}
                  onChange={() => toggleActor(actor.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {actor.firstName} {actor.lastName}
              </label>
            ))}
            {actorsData?.data.length === 0 && (
              <p className="text-sm text-gray-500 px-1">No actors available</p>
            )}
          </div>
        )}
      </div>

      {mutationError && (
        <p className="text-sm text-red-600">
          {(mutationError as Error).message || 'An error occurred'}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : isEdit ? 'Update Movie' : 'Create Movie'}
        </Button>
      </div>
    </form>
  );
}
