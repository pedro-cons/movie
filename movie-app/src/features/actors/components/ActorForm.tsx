'use client';

import { useState, FormEvent } from 'react';
import Input from '@/shared/components/ui/Input';
import Button from '@/shared/components/ui/Button';
import { Actor } from '../types/actor.types';
import { useCreateActor, useUpdateActor } from '../hooks/useActorMutations';

interface ActorFormProps {
  actor?: Actor;
  onSuccess: () => void;
}

export default function ActorForm({ actor, onSuccess }: ActorFormProps) {
  const isEdit = !!actor;
  const [firstName, setFirstName] = useState(actor?.firstName ?? '');
  const [lastName, setLastName] = useState(actor?.lastName ?? '');
  const [birthDate, setBirthDate] = useState(
    actor?.birthDate ? actor.birthDate.slice(0, 10) : '',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateActor();
  const updateMutation = useUpdateActor();
  const isPending = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      ...(birthDate && { birthDate }),
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: actor.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onSuccess();
    } catch {
      // Error is handled by React Query
    }
  }

  const mutationError = createMutation.error || updateMutation.error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="firstName"
        label="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        error={errors.firstName}
        placeholder="First name"
      />
      <Input
        id="lastName"
        label="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        error={errors.lastName}
        placeholder="Last name"
      />
      <Input
        id="birthDate"
        label="Birth Date"
        type="date"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
      />

      {mutationError && (
        <p className="text-sm text-red-600">
          {(mutationError as Error).message || 'An error occurred'}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : isEdit ? 'Update Actor' : 'Create Actor'}
        </Button>
      </div>
    </form>
  );
}
