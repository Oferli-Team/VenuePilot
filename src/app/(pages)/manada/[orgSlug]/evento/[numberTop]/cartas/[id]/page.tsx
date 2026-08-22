import { PersonalUser } from "@/components/personal-user";
import { PersonalUserSkeleton } from "@/components/personal-user-skeleton";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type CartasPageParams = {
  params: {
    id: string;
  };
};

export default async function CartasPage({ params }: CartasPageParams) {
  const { id } = params;
  // cpf and event
  const user = await api.inscricao.getPByUserId({ id: id });

  if (!user) {
    redirect("/404");
  }

  return (
    <Suspense fallback={<PersonalUserSkeleton />}>
      <PersonalUser user={user} />
    </Suspense>
  );
}
