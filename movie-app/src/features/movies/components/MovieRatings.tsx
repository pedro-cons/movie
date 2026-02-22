import { Rating } from '@/features/ratings/types/rating.types';
import RatingStars from '@/features/ratings/components/RatingStars';

interface MovieRatingsProps {
  ratings: Rating[];
}

export default function MovieRatings({ ratings }: MovieRatingsProps) {
  if (!ratings || ratings.length === 0) {
    return (
      <div className="text-sm text-gray-500">No ratings yet.</div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Ratings ({ratings.length})
      </h2>
      <div className="space-y-3">
        {ratings.map((rating) => (
          <div
            key={rating.id}
            className="p-4 rounded-lg border border-gray-200 bg-white"
          >
            <RatingStars value={rating.value} />
            {rating.comment && (
              <p className="mt-2 text-sm text-gray-600">{rating.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
