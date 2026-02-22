import { cn } from '@/shared/utils/cn';

interface RatingBadgeProps {
  ratings: { value: number }[];
  className?: string;
}

export default function RatingBadge({ ratings, className }: RatingBadgeProps) {
  if (!ratings || ratings.length === 0) {
    return (
      <span className={cn('text-xs text-gray-400', className)}>No ratings</span>
    );
  }

  const average = ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length;
  const rounded = Math.round(average * 10) / 10;

  const colorClass =
    rounded >= 8
      ? 'bg-green-100 text-green-800'
      : rounded >= 5
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        colorClass,
        className,
      )}
    >
      {rounded}/10
    </span>
  );
}
