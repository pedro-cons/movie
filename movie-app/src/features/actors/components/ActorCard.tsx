import Link from 'next/link';
import { Actor } from '../types/actor.types';
import { Card, CardHeader, CardContent } from '@/shared/components/ui/Card';
import { formatDate } from '@/shared/utils/format';

interface ActorCardProps {
  actor: Actor;
}

export default function ActorCard({ actor }: ActorCardProps) {
  return (
    <Link href={`/actors/${actor.id}`}>
      <Card className="h-full cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-semibold text-blue-700">
              {actor.firstName[0]}{actor.lastName[0]}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {actor.firstName} {actor.lastName}
              </h3>
              {actor.birthDate && (
                <p className="text-xs text-gray-500">
                  Born: {formatDate(actor.birthDate)}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">View filmography</p>
        </CardContent>
      </Card>
    </Link>
  );
}
