import Link from 'next/link';
import { Movie } from '@/features/movies/types/movie.types';
import RatingBadge from '@/features/ratings/components/RatingBadge';
import { formatYear } from '@/shared/utils/format';

interface ActorMoviesProps {
  movies: Movie[];
}

export default function ActorMovies({ movies }: ActorMoviesProps) {
  if (!movies || movies.length === 0) {
    return (
      <div className="text-sm text-gray-500">No movies found for this actor.</div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Filmography ({movies.length})
      </h2>
      <div className="space-y-3">
        {movies.map((movie) => (
          <Link
            key={movie.id}
            href={`/movies/${movie.id}`}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div>
              <h3 className="font-medium text-gray-900">{movie.title}</h3>
              <p className="text-sm text-gray-500">
                {formatYear(movie.releaseDate)}
                {movie.genre && ` \u2022 ${movie.genre}`}
              </p>
            </div>
            {movie.ratings && <RatingBadge ratings={movie.ratings} />}
          </Link>
        ))}
      </div>
    </div>
  );
}
