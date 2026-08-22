"use client";

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

interface CheckinObsModalProps {
  readonly inscricao: Inscricao;
}

export function CheckinObsModal({ inscricao }: CheckinObsModalProps) {
  const { invalidateDataTablePagination } = useInvalidateQueries();
  const { event } = useEventStore();

  const [obs, setObs] = useState(inscricao.check_obs ?? "");
  const { isModalOpen, closeModal, setInscricao } = useModalStore();

  const updateCheckinObs = api.inscricao.updateCheckin.useMutation({
    async onSuccess() {
      await invalidateDataTablePagination();
    },
  });

  const handleSubmit = async () => {
    try {
      if (!event?.id) return;

      await updateCheckinObs.mutateAsync({
        eventoId: event.id,
        id: inscricao.id,
        check_obs: obs,
      });
      toast({
        title: "Observação adicionada",
        description: "A observação de check-in foi atualizada com sucesso.",
        variant: "success",
      });
      closeModal("checkIn_obs");
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
      closeModal("checkIn_obs");
      setInscricao(null);
    }
  };

  return (
    <Dialog
      open={isModalOpen("checkIn_obs", inscricao)}
      onOpenChange={handleOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar observação de check-in</DialogTitle>
          <DialogDescription>
            Para o participante:{" "}
            <strong className="text-primary">{inscricao.nome}</strong>
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
            loading={updateCheckinObs.isPending}
            onClick={() => handleSubmit()}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
