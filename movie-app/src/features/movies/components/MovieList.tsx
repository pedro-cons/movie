import { Movie } from '../types/movie.types';
import MovieCard from './MovieCard';
import EmptyState from '@/shared/components/feedback/EmptyState';

interface MovieListProps {
  movies: Movie[];
}

export default function MovieList({ movies }: MovieListProps) {
  if (movies.length === 0) {
    return <EmptyState title="No movies found" description="Try adjusting your search terms." />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
