"use client";

import { api } from "@/trpc/react";
import { type ChangeEvent, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "../ui/use-toast";
import { mask } from "remask";
import { Check, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Spinner } from "../ui/spinner";
import { useEventStore } from "@/lib/store/EventStore";

export const InputQuantityFamily = () => {
  const { event } = useEventStore();

  const utils = api.useUtils();

  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const { mutateAsync: cleanBoardingPlan } =
    api.inscricao.cleanBoardingPlanWhenFamiliesChange.useMutation();

  const {
    mutate: updateWithFamily,
    reset,
    isPending,
    status,
    isError,
  } = api.inscricao.updateInscrioesWithFamily.useMutation({
    async onSuccess() {
      await Promise.all([
        utils.inscricao.getAllRegistersWithPagination.invalidate(),
        utils.inscricao.getChartFamily.invalidate(),
      ]);
      await cleanBoardingPlan({ eventId: event?.id });
      setEnabled(false);
      setValue("");
    },
  });

  const { refetch: getRegister } =
    api.inscricao.getInscricoesToClassificateFamily.useQuery(
      {
        eventoId: event?.id ?? "",
        quantityFamily: Number(value),
      },
      { enabled },
    );

  const onChangeValue = async (e: ChangeEvent<HTMLInputElement>) => {
    setValue("");

    const { value } = e.target;
    const regexAccept = /^\d+$/.test(value);
    if (!regexAccept) {
      setError("Informe apenas números");
      return;
    }
    setValue(value);
    setError("");
  };

  const handleOpenDialog = () => {
    if (!value) {
      setError("Informe a quantidade de famílias no TOP");
      setOpen(false);
      return;
    }
    setOpen(true);
  };

  const handleConfirmClick = async () => {
    if (!event?.id) {
      return;
    }
    setEnabled(true);

    try {
      const { data } = await getRegister();

      if (!data?.length) {
        toast({
          title: "Não foi possível classificar famílias",
          description: "Não encontramos nenhuma inscrição para classificar",
          variant: "destructive",
        });
        return;
      }

      updateWithFamily({ inscricoes: data, eventId: event.id });
    } catch (error) {
      toast({
        title: "Ops, algo deu errado",
        description: "Não foi possível classificar famílias",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <Label className="leading-5">
          Infome a quantidade total de família que terá no TOP
        </Label>
        <div className="flex flex-row items-center justify-between gap-3">
          <Input
            value={mask(value, "99") || ""}
            onChange={onChangeValue}
            inputSize="sm"
          />
          <Button variant="blue" onClick={handleOpenDialog}>
            <Check />
          </Button>
        </div>

        <span className="text-xs text-destructive">{error}</span>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger></DialogTrigger>
        <DialogContent>
          <DialogHeader className="space-y-2">
            {status === "pending" ? (
              <DialogTitle className="flex items-center gap-2">
                <Spinner size={20} /> Iniciando Classificação de Família
              </DialogTitle>
            ) : (
              <DialogTitle>Classificação de Família</DialogTitle>
            )}

            {status === "idle" && (
              <DialogDescription>
                Certeza que deseja definir o total de{" "}
                <strong>
                  {value} famílias para TOP#{event?.topNumero}
                </strong>
                ?
                <span className="mt-2 block text-primary">
                  Atenção: esta ação irá desfazer o Plano de Embarque de todos
                  os participantes vinculados. Prossiga apenas se tiver certeza
                  da atualização.
                </span>
              </DialogDescription>
            )}

            {status === "pending" && (
              <DialogDescription>
                Iniciando processo de distribuição dos participantes em {value}{" "}
                famílias
              </DialogDescription>
            )}

            {status === "success" && (
              <DialogDescription className="flex items-center gap-2">
                <Check className="text-success" />
                Distribuição de famílias concluída!
              </DialogDescription>
            )}

            {isError && (
              <DialogDescription className="flex items-center gap-2">
                <X className="text-destructive" />
                Erro na operação de Distribuição de famílias!
              </DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter>
            <DialogClose onClick={() => reset()}>
              {status === "success" ? "Concluir" : "Cancelar"}
            </DialogClose>

            {status !== "success" && !isError && (
              <Button disabled={isPending} onClick={handleConfirmClick}>
                Confirmar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
