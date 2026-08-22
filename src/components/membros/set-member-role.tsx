import { Role } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/selects";
import { api } from "@/trpc/react";
import { toast } from "../ui/use-toast";
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
import { Button } from "../ui/button";
import { useInvalidateQueries } from "@/lib/hooks/useInvalidateQueries";
import { getCurrentMembership } from "@/lib/hooks/member";
import { isAdmin } from "@/lib/utils/hasRole";

type Member = {
  name: string | null;
  id: string;
  role: Role;
  isOwner: boolean;
};

export const SetMemberRole = ({ name, id, role, isOwner }: Member) => {
  const orgSlug = getCurrentOrgFromCookie();
  const { membership } = getCurrentMembership();
  const { invalidateMembers } = useInvalidateQueries();

  const [selected, setSelected] = useState<Role | "">("");
  const [openDialog, setOpenDialog] = useState(false);

  const { mutateAsync: updateMember, isPending } =
    api.member.updateMember.useMutation({
      onSuccess: async () => {
        toast({
          title: "Permissão atualizada com sucesso",
          variant: "success",
        });
        setOpenDialog(false);
        await invalidateMembers();
      },
    });

  const updateMemberRole = async () => {
    try {
      await updateMember({
        slug: orgSlug ?? "",
        memberId: id,
        role: selected as Role,
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar Permissão",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Select
        disabled={!isAdmin(membership) || isOwner}
        value={selected || role}
        onValueChange={(value) => {
          setSelected(value as Role);
          setOpenDialog(true);
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={Role.SUPER_ADMIN}>Super Admin</SelectItem>
          <SelectItem value={Role.ADMIN}>Admin</SelectItem>
          <SelectItem value={Role.HAKUNA}>Hakuna</SelectItem>
          <SelectItem value={Role.CHECKIN}>Check-in</SelectItem>
          <SelectItem value={Role.LADIES}>Lady</SelectItem>
          <SelectItem value={Role.BILLING}>Faturamento</SelectItem>
          <SelectItem value={Role.MEMBER}>Membro</SelectItem>
        </SelectContent>
      </Select>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogTrigger />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja alterar a permissão de <b>{name}</b>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelected("")}>
              Cancelar
            </AlertDialogCancel>
            <Button loading={isPending} onClick={updateMemberRole}>
              Sim
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
