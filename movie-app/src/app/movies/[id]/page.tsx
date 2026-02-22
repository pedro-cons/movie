'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageContainer from '@/shared/components/layout/PageContainer';
import Spinner from '@/shared/components/ui/Spinner';
import Button from '@/shared/components/ui/Button';
import Modal from '@/shared/components/ui/Modal';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import MovieDetail from '@/features/movies/components/MovieDetail';
import MovieActors from '@/features/movies/components/MovieActors';
import MovieRatings from '@/features/movies/components/MovieRatings';
import MovieForm from '@/features/movies/components/MovieForm';
import AddRatingForm from '@/features/ratings/components/AddRatingForm';
import { useMovie } from '@/features/movies/hooks/useMovie';
import { useDeleteMovie } from '@/features/movies/hooks/useMovieMutations';
import { useAuth } from '@/features/auth/context/AuthContext';

export default function MovieDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { data: movie, isLoading, error } = useMovie(Number(id));
  const { isAuthenticated } = useAuth();
  const deleteMutation = useDeleteMovie();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <PageContainer>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-gray-900">Movie not found</h2>
          <Link href="/movies" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to movies
          </Link>
        </div>
      </PageContainer>
    );
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(Number(id));
      router.push('/movies');
    } catch {
      // Error handled by React Query
    }
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/movies"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to movies
        </Link>
        {isAuthenticated && (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setShowEditModal(true)}>
              Edit
            </Button>
            <Button size="sm" variant="danger" onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </Button>
          </div>
        )}
      </div>

      <MovieDetail movie={movie} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <MovieActors actors={movie.actors} />
        <div>
          <MovieRatings ratings={movie.ratings} />
          {isAuthenticated && <AddRatingForm movieId={movie.id} />}
        </div>
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Movie"
      >
        <MovieForm movie={movie} onSuccess={() => setShowEditModal(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Movie"
        message={`Are you sure you want to delete "${movie.title}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
