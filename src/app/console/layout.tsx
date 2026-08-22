import { getServerAuthSession } from "@/server/auth";
import { Unauthorized } from "@/components/unauthorized";
import { type ReactNode } from "react";
import { ContainerSpace } from "@/components/ui/container";

const staffEmails = [
  "tgmarinho@gmail.com",
  "robersonsouza@outlook.com",
  "delacyr@gmail.com",
  "renatakarolinarko@gmail.com",
];

export default async function TransfersLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerAuthSession();
  const usersEmail = session?.user.email ?? "";

  if (!staffEmails.includes(usersEmail)) {
    return (
      <ContainerSpace className="h-screen items-center justify-center">
        <Unauthorized description="Você não tem permissão para acessar esta página." />
      </ContainerSpace>
    );
  }

  return <>{children}</>;
}
