import { Movie } from '../types/movie.types';
import Badge from '@/shared/components/ui/Badge';
import RatingBadge from '@/features/ratings/components/RatingBadge';
import { formatDate } from '@/shared/utils/format';

interface MovieDetailProps {
  movie: Movie;
}

export default function MovieDetail({ movie }: MovieDetailProps) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{movie.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            {movie.genre && <Badge variant="info">{movie.genre}</Badge>}
            <span className="text-sm text-gray-500">{formatDate(movie.releaseDate)}</span>
          </div>
        </div>
        <RatingBadge ratings={movie.ratings} className="text-sm px-3 py-1" />
      </div>

      {movie.description && (
        <p className="text-gray-700 leading-relaxed mb-8">{movie.description}</p>
      )}
    </div>
  );
}
