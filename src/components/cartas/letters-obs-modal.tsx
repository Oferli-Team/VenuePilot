import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useInvalidateQueries } from "@/lib/hooks/useInvalidateQueries";
import { useEventStore } from "@/lib/store/EventStore";
import { useModalStore } from "@/lib/store/ModalStore";
import { api } from "@/trpc/react";
import { type Inscricao } from "@prisma/client";
import { useState } from "react";

interface LettersObsModalProps {
  inscricao: Inscricao;
}

export function LettersObsModal({ inscricao }: LettersObsModalProps) {
  const { event } = useEventStore();
  const { invalidateDataTablePagination } = useInvalidateQueries();

  const [obs, setObs] = useState(inscricao.cartas_obs ?? "");
  const { isModalOpen, closeModal, setInscricao } = useModalStore();

  const updateCheckinObs = api.inscricao.updateLettersReceived.useMutation({
    async onSuccess() {
      await invalidateDataTablePagination();
    },
  });

  const handleSubmit = async () => {
    try {
      if (!event?.id || !inscricao) return;

      await updateCheckinObs.mutateAsync({
        eventoId: event.id,
        id: inscricao.id,
        cartas_obs: obs,
      });
      toast({
        title: "Observação adicionada",
        description: "A observação de Cartas foi atualizada com sucesso.",
        variant: "success",
      });
      closeModal("letters_obs");
      setObs("");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a observação.",
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeModal("letters_obs");
      setInscricao(null);
    }
  };

  return (
    <Dialog
      open={isModalOpen("letters_obs", inscricao)}
      onOpenChange={handleOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar observação de Cartas</DialogTitle>
          <DialogDescription>
            Para o participante:{" "}
            <strong className="text-primary">{inscricao?.nome}</strong>
          </DialogDescription>
        </DialogHeader>
        <Input
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          placeholder="Digite a observação..."
        />
        <DialogFooter>
          <DialogClose>Cancelar</DialogClose>
          <Button
            onClick={() => handleSubmit()}
            loading={updateCheckinObs.isPending}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
