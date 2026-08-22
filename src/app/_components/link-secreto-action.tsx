"use client";
import { useEventStore } from "@/lib/store/EventStore";
import { api } from "@/trpc/react";
import { type LinkSecreto } from "@prisma/client";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertModal } from "./coupon/alert-modal";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { toast } from "./ui/use-toast";
import { useEventRoutes } from "@/lib/hooks/useEventRoutes";

type CellActionProps = {
  data?: LinkSecreto;
};

export function LinkSecretoAction({ data }: CellActionProps) {
  const router = useRouter();

  const { event } = useEventStore();
  const { orgsRoutes } = useEventRoutes({ linkId: data?.id });

  const [alertModalOpen, setAlertModalOpen] = useState(false);

  const { refetch } = api.linkSecreto.getAll.useQuery(
    { eventoId: event?.id ?? "" },
    {
      enabled: false,
    },
  );

  const { mutate: deleteLink, isPending: deleteLinkPending } =
    api.linkSecreto.delete.useMutation({
      onError: async (_) => {
        toast({
          title: "Não foi possível deletar o Link Secreto",
          variant: "destructive",
        });
      },
      onSuccess: async (_) => {
        setAlertModalOpen(false);
        toast({
          title: "Link Secreto deletado com sucesso!",
          variant: "success",
        });
        router.refresh();
        await refetch();
      },
    });

  const disabledDeleteIfLinkIsAlreadyUsed = () => {
    if (data?.usadoCount && data.usadoCount > 0) {
      return true;
    }
    return false;
  };

  return (
    <div className="flex justify-end space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-secondary"
              onClick={() => {
                router.push(orgsRoutes.event.secretLinks.byId);
              }}
            >
              <Pencil className="h-4 w-4 text-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Editar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-secondary"
              onClick={() => {
                setAlertModalOpen(true);
              }}
              disabled={disabledDeleteIfLinkIsAlreadyUsed()}
            >
              <Trash2 className="h-4 w-4 text-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Deletar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {alertModalOpen && (
        <AlertModal
          title="Certeza que deseja excluir?"
          description="Essa ação não pode ser revertida."
          name={data?.link}
          isOpen={alertModalOpen}
          onClose={() => setAlertModalOpen(false)}
          onConfirm={() => deleteLink({ id: data?.id ?? "" })}
          loading={deleteLinkPending}
        />
      )}
    </div>
  );
}
