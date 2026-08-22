"use client";

import { PersonalUser } from "@/components/personal-user";
import { PersonalUserSkeleton } from "@/components/personal-user-skeleton";
import { api } from "@/trpc/react";

type RegisterLegendaryParams = {
  params: {
    id: string[];
  };
};

export default function RegisterLegendaryPage({
  params,
}: RegisterLegendaryParams) {
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

  if (!user) {
    return null;
  }

  return <PersonalUser user={user} />;
}
