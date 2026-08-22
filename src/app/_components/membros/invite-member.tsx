import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFindManyInvites } from "@/lib/hooks/invite";
import { getCurrentOrgFromCookie } from "@/lib/utils/getCurrentOrgFromCookie";
import { api } from "@/trpc/react";
import { Role } from "@prisma/client";
import { useState, type FormEvent } from "react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/selects";
import { toast } from "../ui/use-toast";
import { sendInviteEmail } from "@/lib/actions/mail";
import { useFindManyOrganizations } from "@/lib/hooks/organization";

type InviteMemberProps = {
  className?: string;
};

export const InviteMember = ({ className }: InviteMemberProps) => {
  const { organizations, isLoading } = useFindManyOrganizations();
  const { refetch } = useFindManyInvites();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const orgSlug = getCurrentOrgFromCookie();
  const currentOrganization = organizations?.find(
    (org) => org.slug === orgSlug,
  );

  const { mutate: createInvite, isPending: createInviteIsPending } =
    api.invite.create.useMutation({
      onSuccess: async (invite) => {
        toast({
          title: "Convite criado com sucesso",
          description: "O convite foi criado com sucesso",
        });

        if (invite) {
          await sendInviteEmail(
            email,
            currentOrganization?.name ?? "",
            invite.id,
          );
        }

        setEmail("");
        setRole("");
        await refetch();
      },
      onError: (error) => {
        toast({
          title: "Não foi possível criar o convite",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const validateForm = () => {
    const isValid =
      email.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      role !== "";
    return isValid;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Formulário inválido",
        description: "Por favor, preencha todos os campos corretamente",
        variant: "destructive",
      });
      return;
    }

    if (!orgSlug) {
      toast({
        title: "Organização não encontrada",
        description: "Não foi possível identificar a organização atual",
        variant: "destructive",
      });
      return;
    }

    createInvite({
      email,
      role: role as Role,
      slug: orgSlug,
    });
  };

  return (
    <Card className={`mb-12 p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-bold">Convidar novo membro</h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <p className="mb-4">
            Envie um convite para entrarem no time de administradores
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-2 block">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Email do convidado"
                className="w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="permission" className="mb-2 block">
                Permissão
              </label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as Role)}
                required
              >
                <SelectTrigger id="permission">
                  <SelectValue placeholder="Selecione" />
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
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="default"
              type="submit"
              disabled={createInviteIsPending}
            >
              Enviar convite
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};
