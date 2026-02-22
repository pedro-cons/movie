import Link from 'next/link';
import { Actor } from '@/features/actors/types/actor.types';

interface MovieActorsProps {
  actors: Actor[];
}

export default function MovieActors({ actors }: MovieActorsProps) {
  if (!actors || actors.length === 0) {
    return (
      <div className="text-sm text-gray-500">No actors listed for this movie.</div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Cast</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actors.map((actor) => (
          <Link
            key={actor.id}
            href={`/actors/${actor.id}`}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
              {actor.firstName[0]}{actor.lastName[0]}
            </div>
            <span className="text-sm font-medium text-gray-900">
              {actor.firstName} {actor.lastName}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
