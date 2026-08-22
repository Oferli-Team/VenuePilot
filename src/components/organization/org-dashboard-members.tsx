"use client";

import { Button } from "@/components/ui/button";
import { CardWithTitle } from "@/components/ui/card-with-title";
import { Plus, User } from "lucide-react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";
import { useRouter } from "nextjs-toploader/app";
import { Role } from "@prisma/client";
import { getCurrentMembership } from "@/lib/hooks/member";
import { isAdmin } from "@/lib/utils/hasRole";

type Member = {
  user: {
    name: string | null;
  };
  id: string;
  role: Role;
};

export const OrgDashboardMembers = ({
  members,
}: {
  members: Member[] | null;
}) => {
  const router = useRouter();
  const { orgsRoutes } = useEventRoutes({});
  const { membership } = getCurrentMembership();

  return (
    <CardWithTitle
      title="Membros da Organização"
      description={`${members?.length ?? 0} membros`}
      className="relative"
    >
      <CardContent className="flex flex-col gap-2 pt-2">
        {members?.length === 0 ? (
          <div className="mb-8 flex flex-col gap-3 text-center">
            <p className="text-muted-foreground">Não há membros na sua Pista</p>
            <span className="font-bold">Convide um membro!</span>
          </div>
        ) : (
          members &&
          members.length > 0 &&
          members.slice(0, 6).map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 rounded-md bg-background p-3"
            >
              <User className="h-5 w-5" />
              <div className="space-y-2">
                <p>{member.user.name}</p>
                <span className="text-xs text-muted-foreground">
                  {member.role.replace("_", " ")}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>

      {isAdmin(membership) && (
        <CardFooter>
          {members && members?.length > 6 && (
            <Button
              onClick={() => router.push(orgsRoutes.members)}
              variant="link"
              className="self-end text-muted-foreground"
            >
              Ver todos
            </Button>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={() => router.push(orgsRoutes.members)}
          >
            <Plus className="mr-1 h-4 w-4" /> Convidar
          </Button>
        </CardFooter>
      )}
    </CardWithTitle>
  );
};
