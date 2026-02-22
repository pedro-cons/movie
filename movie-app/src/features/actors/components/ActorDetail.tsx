import { Actor } from '../types/actor.types';
import { formatDate } from '@/shared/utils/format';

interface ActorDetailProps {
  actor: Actor;
}

export default function ActorDetail({ actor }: ActorDetailProps) {
  return (
    <div className="flex items-center gap-6 mb-8">
      <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700 shrink-0">
        {actor.firstName[0]}{actor.lastName[0]}
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {actor.firstName} {actor.lastName}
        </h1>
        {actor.birthDate && (
          <p className="text-sm text-gray-500 mt-1">
            Born: {formatDate(actor.birthDate)}
          </p>
        )}
      </div>
    </div>
  );
}
