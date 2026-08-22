"use client";

import { type LinkSecreto } from "@prisma/client";
import { type Row } from "@tanstack/react-table";
import { Switch } from "./ui/switch";
import { api } from "@/trpc/react";
import { useState } from "react";
import { toast } from "./ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export const ActiveSecretLink = ({ row }: { row: Row<LinkSecreto> }) => {
  const [ativo, setAtivo] = useState<boolean>(row.getValue("ativo"));

  const { mutate: updatedActiveSecretLink, isPending } =
    api.linkSecreto.updateActive.useMutation({
      onSuccess: async (data) => {
        try {
          setAtivo(data.ativo);
        } catch (error) {
          toast({
            title: "Ops, erro na operação",
          });
          console.error("Erro ao atualizar o link secreto", error);
        }
      },
    });

  const handleCheckedChange = () => {
    const novoAtivo = !ativo;

    setAtivo(novoAtivo);
    updatedActiveSecretLink({
      id: row.original.id,
      ativo: novoAtivo,
    });
  };

  return (
    <div className="text-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-block">
              <Switch
                onCheckedChange={handleCheckedChange}
                checked={ativo}
                disabled={isPending}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{ativo ? "Desativar" : "Ativar"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
