"use client";

import { Button } from "@/components/ui/button";
import { CardWithTitle } from "@/components/ui/card-with-title";
import { User } from "lucide-react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";
import { useRouter } from "nextjs-toploader/app";
import { Invite } from "@prisma/client";

export const OrgDashboardInvites = ({
  invites,
}: {
  invites: Invite[] | null;
}) => {
  const router = useRouter();
  const { orgsRoutes } = useEventRoutes({});

  return (
    <CardWithTitle
      title="Convites"
      description={`${invites?.length ?? 0} convites pendentes`}
      className="h-full"
    >
      <CardContent className="flex flex-col gap-2 pt-2">
        {invites?.length === 0 ? (
          <div className="mb-8 flex flex-col gap-3 text-center">
            <p className="text-muted-foreground">Não há convites pendentes</p>
          </div>
        ) : (
          invites &&
          invites.length > 0 &&
          invites.slice(0, 6).map((invite) => (
            <div
              key={invite.id}
              className="flex items-center gap-2 rounded-md bg-background p-3"
            >
              <User className="h-5 w-5" />
              <div className="space-y-2">
                <p>{invite.email}</p>
                <span className="text-xs text-muted-foreground">
                  {invite.role.replace("_", " ")}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <CardFooter>
        {invites && invites?.length > 6 && (
          <Button
            onClick={() => router.push(orgsRoutes.members)}
            variant="link"
            className="self-end text-muted-foreground"
          >
            Ver todos
          </Button>
        )}
      </CardFooter>
    </CardWithTitle>
  );
};
