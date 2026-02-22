import { Actor } from '../types/actor.types';
import ActorCard from './ActorCard';
import EmptyState from '@/shared/components/feedback/EmptyState';

interface ActorListProps {
  actors: Actor[];
}

export default function ActorList({ actors }: ActorListProps) {
  if (actors.length === 0) {
    return <EmptyState title="No actors found" description="Try adjusting your search terms." />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {actors.map((actor) => (
        <ActorCard key={actor.id} actor={actor} />
      ))}
    </div>
  );
}
