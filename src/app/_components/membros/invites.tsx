import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFindManyInvites } from "@/lib/hooks/invite";
import { api } from "@/trpc/react";
import { Button } from "../ui/button";

import { getCurrentOrgFromCookie } from "@/lib/utils/getCurrentOrgFromCookie";
import { toast } from "../ui/use-toast";
import { Separator } from "../ui/separator";
import CopyToClipboard from "react-copy-to-clipboard";

type InvitesProps = {
  className?: string;
};

export const Invites = ({ className }: InvitesProps) => {
  const orgSlug = getCurrentOrgFromCookie();
  const { invites, isLoading, refetch } = useFindManyInvites();
  const { mutate: revokeInvite, isPending: revokeInviteIsPending } =
    api.invite.revokeInvite.useMutation({
      onSuccess: async () => {
        toast({
          variant: "success",
          title: "Convite revogado com sucesso",
          description: "O convite foi revogado com sucesso",
        });
        await refetch();
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Não foi possível revogar o convite",
        });
      },
    });

  if (!invites?.length) {
    return null;
  }

  return (
    <Card className={`mb-12 p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-xl font-bold">Convites</h3>
      </div>

      <div>
        {isLoading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <>
              <div key={`skeleton-${index + 1}`}>
                <div className="py-4">
                  <div>
                    <Skeleton className="mb-2 h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <div className="py-4 text-right">
                  <Skeleton className="ml-auto h-8 w-8 rounded-full" />
                </div>
              </div>

              {invites.length - 1 > index && <Separator className="w-full" />}
            </>
          ))
        ) : (
          <>
            {invites.length > 0 &&
              invites.map((invite, index) => (
                <>
                  <div
                    key={invite.id}
                    className="flex flex-col items-start justify-between gap-2 py-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <span className="text-sm text-muted-foreground">
                        {invite.role}
                      </span>
                    </div>
                    <div className="flex gap-2 self-end">
                      <CopyToClipboard
                        onCopy={() => {
                          toast({
                            variant: "success",
                            title:
                              "Link do convite copiado para a área de transferência",
                          });
                        }}
                        text={`${window.location.origin}/invite/${invite.id}`}
                      >
                        <Button variant="outline">Copiar link</Button>
                      </CopyToClipboard>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          revokeInvite({
                            inviteId: invite.id,
                            orgSlug: orgSlug ?? "",
                          })
                        }
                        disabled={revokeInviteIsPending}
                      >
                        Revogar
                      </Button>
                    </div>
                  </div>
                  {invites.length - 1 > index && (
                    <Separator className="w-full" />
                  )}
                </>
              ))}
          </>
        )}
      </div>
    </Card>
  );
};
