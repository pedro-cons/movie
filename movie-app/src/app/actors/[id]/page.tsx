'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageContainer from '@/shared/components/layout/PageContainer';
import Spinner from '@/shared/components/ui/Spinner';
import Button from '@/shared/components/ui/Button';
import Modal from '@/shared/components/ui/Modal';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import ActorDetail from '@/features/actors/components/ActorDetail';
import ActorMovies from '@/features/actors/components/ActorMovies';
import ActorForm from '@/features/actors/components/ActorForm';
import { useActor } from '@/features/actors/hooks/useActor';
import { useDeleteActor } from '@/features/actors/hooks/useActorMutations';
import { useAuth } from '@/features/auth/context/AuthContext';

export default function ActorDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { data: actor, isLoading, error } = useActor(Number(id));
  const { isAuthenticated } = useAuth();
  const deleteMutation = useDeleteActor();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !actor) {
    return (
      <PageContainer>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-gray-900">Actor not found</h2>
          <Link href="/actors" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to actors
          </Link>
        </div>
      </PageContainer>
    );
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(Number(id));
      router.push('/actors');
    } catch {
      // Error handled by React Query
    }
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/actors"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to actors
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

      <ActorDetail actor={actor} />
      <ActorMovies movies={actor.movies} />

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Actor"
      >
        <ActorForm actor={actor} onSuccess={() => setShowEditModal(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Actor"
        message={`Are you sure you want to delete "${actor.firstName} ${actor.lastName}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
