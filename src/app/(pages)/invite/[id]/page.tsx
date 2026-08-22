import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, LogIn, LogOut } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

interface InvitePageProps {
  params: {
    id: string;
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const inviteId = params.id;

  const invite = await api.invite.getInvite({ inviteId });
  const isUserAuthenticated = await getServerAuthSession();

  let currentUserEmail = null;

  if (isUserAuthenticated) {
    const { user } = isUserAuthenticated;
    currentUserEmail = user.email;
  }

  const userIsAuthenticatedWithSameEmailFromInvite =
    currentUserEmail === invite?.email;

  async function signInFromInvite() {
    "use server";

    cookies().set("inviteId", inviteId);

    const encodedEmail = encodeURIComponent(invite?.email ?? "");
    redirect(`/auth/signin?email=${encodedEmail}`);
  }

  async function acceptInviteAction() {
    "use server";

    await api.invite.acceptInvite({ inviteId });

    redirect(`/manada/${invite?.organization.slug}`);
  }

  if (!invite) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="flex w-full max-w-sm flex-col justify-center space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-balance text-center leading-relaxed text-muted-foreground">
              Ops! Não encontramos nenhum convite.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col justify-center space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-balance text-center leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">
              {invite?.author?.name ?? "Alguém"}
            </span>{" "}
            convidou você para se juntar ao{" "}
            <span className="font-medium text-foreground">
              {invite?.organization.name}
            </span>
            .{" "}
            <span className="text-xs">
              {formatDistanceToNow(new Date(invite?.createdAt ?? new Date()), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </p>
        </div>

        <Separator />

        {!isUserAuthenticated && (
          <form action={signInFromInvite}>
            <Button type="submit" variant="secondary" className="w-full">
              <LogIn className="mr-2 size-4" />
              Entre para aceitar o convite
            </Button>
          </form>
        )}

        {userIsAuthenticatedWithSameEmailFromInvite && (
          <form action={acceptInviteAction}>
            <Button type="submit" variant="secondary" className="w-full">
              <CheckCircle className="mr-2 size-4" />
              Fazer parte de {invite?.organization.name}
            </Button>
          </form>
        )}

        {isUserAuthenticated && !userIsAuthenticatedWithSameEmailFromInvite && (
          <div className="space-y-4">
            <p className="text-balance text-center text-sm leading-relaxed text-muted-foreground">
              Este convite foi enviado a{" "}
              <span className="font-medium text-foreground">
                {invite?.email}
              </span>{" "}
              mas você está autenticado(a) como{" "}
              <span className="font-medium text-foreground">
                {currentUserEmail}
              </span>
              .
            </p>

            <div className="space-y-2">
              <Button className="w-full" variant="secondary" asChild>
                <a href="/api/auth/signout">
                  <LogOut className="mr-2 size-4" />
                  Sair de {currentUserEmail}
                </a>
              </Button>

              <Button className="w-full" variant="outline" asChild>
                <Link href="/">Voltar para a página inicial</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
