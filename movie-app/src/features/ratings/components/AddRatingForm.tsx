'use client';

import { useState, FormEvent } from 'react';
import Textarea from '@/shared/components/ui/Textarea';
import Button from '@/shared/components/ui/Button';
import { useCreateRating } from '../hooks/useRatingMutations';

interface AddRatingFormProps {
  movieId: number;
}

export default function AddRatingForm({ movieId }: AddRatingFormProps) {
  const [value, setValue] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const mutation = useCreateRating();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (value < 1 || value > 10) {
      setError('Rating must be between 1 and 10');
      return;
    }
    setError('');

    try {
      await mutation.mutateAsync({
        value,
        movieId,
        ...(comment.trim() && { comment: comment.trim() }),
      });
      setValue(5);
      setComment('');
    } catch {
      // Error handled by React Query
    }
  }

  return (
    <div className="mt-6 p-4 rounded-lg border border-gray-200 bg-gray-50">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Add a Rating</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating ({value}/10)
          </label>
          <div className="flex items-center gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setValue(i + 1)}
                className="focus:outline-none"
              >
                <svg
                  className={`h-6 w-6 transition-colors ${
                    i < value ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <Textarea
          id="comment"
          label="Comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts..."
        />

        {mutation.error && (
          <p className="text-sm text-red-600">
            {(mutation.error as Error).message || 'Failed to submit rating'}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={mutation.isPending}>
            {mutation.isPending ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </div>
      </form>
    </div>
  );
}
