import { api } from "@/trpc/react";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { Trash2 } from "lucide-react";
import { getCurrentOrgFromCookie } from "@/lib/utils/getCurrentOrgFromCookie";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-modal";
import { useState } from "react";
import { useInvalidateQueries } from "@/lib/hooks/useInvalidateQueries";
import { isSuperAdmin } from "@/lib/utils/hasRole";
import { getCurrentMembership } from "@/lib/hooks/member";

type Member = {
  name: string | null;
  id: string;
  isOwner: boolean;
};

export const DeleteMemberButton = ({ id, name, isOwner }: Member) => {
  const orgSlug = getCurrentOrgFromCookie();
  const { membership } = getCurrentMembership();
  const { invalidateMembers } = useInvalidateQueries();

  const [openDialog, setOpenDialog] = useState(false);

  const { mutate: deleteMember, isPending } =
    api.member.removeMember.useMutation({
      onSuccess: async () => {
        toast({
          title: "Membro removido com sucesso",
          variant: "success",
        });
        setOpenDialog(false);
        await invalidateMembers();
      },
      onError: () => {
        toast({
          title: "Não foi possível remover o membro",
        });
      },
    });

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="flex items-center text-red-600 hover:text-red-600"
        onClick={() => setOpenDialog(true)}
        aria-label="Remover membro"
        disabled={!isSuperAdmin(membership) || isOwner}
      >
        <Trash2 size={18} />
      </Button>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogTrigger />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja excluir <b>{name}</b> da sua Pista?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              loading={isPending}
              onClick={() => {
                deleteMember({
                  slug: orgSlug ?? "",
                  memberId: id,
                });
              }}
            >
              Sim
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
