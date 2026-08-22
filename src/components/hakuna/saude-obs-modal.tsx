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

interface SaudeObsModalProps {
  readonly inscricao: Inscricao;
}

export function SaudeObsModal({ inscricao }: SaudeObsModalProps) {
  const { invalidateDataTablePagination } = useInvalidateQueries();

  const updateSaudeObs = api.inscricao.updateInscricaoWithSaude.useMutation({
    async onSuccess() {
      await invalidateDataTablePagination();
    },
  });

  const { isModalOpen, setInscricao, closeModal } = useModalStore();
  const { event } = useEventStore();

  const [obs, setObs] = useState(inscricao.saude_obs ?? "");

  const handleSubmit = async () => {
    try {
      if (!event?.id) return;
      await updateSaudeObs.mutateAsync({
        inscricaoId: inscricao.id,
        eventoId: event.id,
        saude_obs: obs,
      });
      toast({
        title: "Observação adicionada",
        description: "A observação de Saúde foi atualizada com sucesso.",
        variant: "success",
      });
      closeModal("health_obs");
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
      closeModal("health_obs");
      setInscricao(null);
    }
  };

  return (
    <Dialog
      open={isModalOpen("health_obs", inscricao)}
      onOpenChange={handleOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar observação de Saúde</DialogTitle>
          <DialogDescription>
            Para o participante:{" "}
            <strong className="text-primary">{inscricao.nome}</strong>
          </DialogDescription>
        </DialogHeader>
        <div>
          <Input
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Digite a observação..."
          />
        </div>
        <DialogFooter>
          <DialogClose>Cancelar</DialogClose>
          <Button
            onClick={() => handleSubmit()}
            loading={updateSaudeObs.isPending}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
