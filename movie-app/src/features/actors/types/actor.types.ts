export interface Actor {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActorPayload {
  firstName: string;
  lastName: string;
  birthDate?: string;
}

export type UpdateActorPayload = Partial<CreateActorPayload>;
