'use client';

import { Suspense, useState } from 'react';
import PageContainer from '@/shared/components/layout/PageContainer';
import SearchBar from '@/shared/components/SearchBar';
import Pagination from '@/shared/components/Pagination';
import Spinner from '@/shared/components/ui/Spinner';
import Button from '@/shared/components/ui/Button';
import Modal from '@/shared/components/ui/Modal';
import MovieList from '@/features/movies/components/MovieList';
import MovieForm from '@/features/movies/components/MovieForm';
import { useMovies } from '@/features/movies/hooks/useMovies';
import { usePagination } from '@/shared/hooks/usePagination';
import { useAuth } from '@/features/auth/context/AuthContext';

function MoviesContent() {
  const { page, limit, search, setPage, setSearch } = usePagination();
  const { data, isLoading } = useMovies({ page, limit, search: search || undefined });
  const { isAuthenticated } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Movies</h1>
          {isAuthenticated && (
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              + Add Movie
            </Button>
          )}
        </div>
        <div className="w-full sm:w-80">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search movies..."
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <MovieList movies={data?.data || []} />
          {data && (
            <Pagination
              page={data.page}
              total={data.total}
              limit={data.limit}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Movie"
      >
        <MovieForm onSuccess={() => setShowCreateModal(false)} />
      </Modal>
    </PageContainer>
  );
}

export default function MoviesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Spinner size="lg" /></div>}>
      <MoviesContent />
    </Suspense>
  );
}
