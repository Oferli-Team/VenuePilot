import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import { Phone, PhoneCall, PhoneMissed } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { type Inscricao } from "@prisma/client";
import { useInvalidateQueries } from "@/lib/hooks/useInvalidateQueries";
import { useEventStore } from "@/lib/store/EventStore";

interface ContactIsValidButtonProps {
  readonly inscricao: Inscricao;
  readonly initialState: boolean | null;
}

export function ContactIsValidButton({
  inscricao,
  initialState,
}: ContactIsValidButtonProps) {
  const { invalidateLetters } = useInvalidateQueries();
  const { event } = useEventStore();

  const [isChecked, setIsChecked] = useState(initialState);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showConfirmCheckinDialog, setShowConfirmCheckinDialog] =
    useState(false);

  const updateLettersReceived =
    api.inscricao.updateLettersContactIsValid.useMutation({
      onSuccess: async () => {
        await invalidateLetters();
      },
    });

  const handleCheckinToggle = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    if (isChecked) {
      setShowConfirmDialog(true);
    } else {
      setShowConfirmCheckinDialog(true);
    }
  };

  const performCheckinUpdate = async () => {
    try {
      if (!event?.id) return;

      await updateLettersReceived.mutateAsync({
        eventoId: event.id,
        id: inscricao.id,
        cartas_contato_valido: !isChecked,
      });

      toast({
        title: "Sucesso",
        variant: "success",
        description: isChecked
          ? "Atualizado para Contato não válido"
          : "Contato válido atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao atualizar status de cartas_contato_valido", error);
      toast({
        title: "Erro",
        description: `Não foi possível atualizar o contato para ${isChecked ? "Válido" : "Não válido"}`,
        variant: "destructive",
      });
    } finally {
      setShowConfirmDialog(false);
      setShowConfirmCheckinDialog(false);
    }
  };

  useEffect(() => {
    setIsChecked(initialState);
  }, [initialState]);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            asChild
            className="flex w-full items-center justify-center"
          >
            <Button
              onClick={handleCheckinToggle}
              variant="ghost"
              size="icon"
              className="transition-all duration-150"
            >
              <PhoneCall
                size={20}
                className={`transform text-success transition-all duration-150 ${isChecked ? "scale-100" : "h-0 w-0 scale-0"}`}
              />

              <PhoneMissed
                size={20}
                className={`transform text-destructive transition-all duration-150 ${isChecked === false ? "scale-100" : "h-0 w-0 scale-0"}`}
              />

              <Phone
                size={20}
                className={`transform text-orange-500 transition-all duration-150 ${isChecked === null ? "scale-100" : "h-0 w-0 scale-0"}`}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isChecked
              ? "Marcar como Contato Inválido"
              : "Marcar como Contato Válido"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog
        open={showConfirmCheckinDialog}
        onOpenChange={setShowConfirmCheckinDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar ação</DialogTitle>
            <DialogDescription>
              Confirma que o contato do participante{" "}
              <strong className="text-primary">{inscricao.nome}</strong> é
              válido?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancelar</DialogClose>
            <Button
              loading={updateLettersReceived.isPending}
              onClick={performCheckinUpdate}
            >
              Sim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar ação</DialogTitle>
            <DialogDescription>
              Certeza que deseja marcar como Contato não válido?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Cancelar</DialogClose>
            <Button
              loading={updateLettersReceived.isPending}
              onClick={performCheckinUpdate}
            >
              Sim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
