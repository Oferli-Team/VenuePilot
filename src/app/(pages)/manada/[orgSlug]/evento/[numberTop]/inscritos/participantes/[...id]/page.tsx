"use client";

import { PersonalUser } from "@/components/personal-user";
import { PersonalUserSkeleton } from "@/components/personal-user-skeleton";
import { api } from "@/trpc/react";

type RegisterPageParams = {
  params: {
    id: string[];
  };
};

export default function RegisterPage({ params }: RegisterPageParams) {
  const [userId, eventId] = params.id;

  const { data: user, isLoading } = api.inscricao.getPByUserId.useQuery(
    {
      id: userId ?? "",
      eventoId: eventId ?? "",
    },
    {
      enabled: !!userId && !!eventId,
    },
  );

  if (isLoading) {
    return <PersonalUserSkeleton />;
  }

  return <PersonalUser user={user!} />;
}
