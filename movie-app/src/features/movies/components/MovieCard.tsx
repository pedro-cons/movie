import Link from 'next/link';
import { Movie } from '../types/movie.types';
import { Card, CardHeader, CardContent } from '@/shared/components/ui/Card';
import Badge from '@/shared/components/ui/Badge';
import RatingBadge from '@/features/ratings/components/RatingBadge';
import { formatYear } from '@/shared/utils/format';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/movies/${movie.id}`}>
      <Card className="h-full cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1">{movie.title}</h3>
            <RatingBadge ratings={movie.ratings} />
          </div>
          <div className="flex items-center gap-2 mt-1">
            {movie.genre && <Badge variant="info">{movie.genre}</Badge>}
            <span className="text-xs text-gray-500">{formatYear(movie.releaseDate)}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 line-clamp-2">
            {movie.description || 'No description available.'}
          </p>
          {movie.actors && movie.actors.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              {movie.actors.map((a) => `${a.firstName} ${a.lastName}`).join(', ')}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
