import { ENUM_CHECKIN_STATUS } from "@/lib/enum";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "../ui/selects";
import { addColorByCheckInStatus } from "@/lib/utils/getStatusClass";
import clsx from "clsx";
import { checkinStatusMap } from "@/lib/constants";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import React, { useState } from "react";
import { api } from "@/trpc/react";
import { useFindEvent } from "@/lib/hooks/event";
import { useInvalidateQueries } from "@/lib/hooks/useInvalidateQueries";
import { toast } from "../ui/use-toast";

export const CheckInStatusSelect = ({
  initialValue,
  name,
  registerId,
}: {
  registerId: string;
  name: string;
  initialValue: ENUM_CHECKIN_STATUS | undefined;
}) => {
  const { event } = useFindEvent();
  const { invalidateDataTablePagination } = useInvalidateQueries();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(initialValue);

  const { mutateAsync: updateCheckinStatus, isPending } =
    api.inscricao.updateCheckinStatus.useMutation({
      async onSuccess() {
        await invalidateDataTablePagination();
        setOpen(false);
      },
    });

  const handleConfirm = async () => {
    try {
      await updateCheckinStatus({
        eventoId: event.id,
        id: registerId,
        checkinStatus: selected ?? ENUM_CHECKIN_STATUS.WAITING_FOR_DOCUMENTS,
        documentId: null,
      });
    } catch (error) {
      toast({
        title: "Não foi possível concluir operação",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    setSelected(initialValue);
  }, [initialValue]);

  return (
    <>
      <Select
        value={selected}
        onValueChange={(value) => {
          setSelected(value as ENUM_CHECKIN_STATUS);
          setOpen(true);
        }}
      >
        <SelectTrigger className="w-[140px]" size="sm">
          <p
            className={clsx(
              selected && addColorByCheckInStatus(selected, "text"),
              "font-medium",
            )}
          >
            {selected ? checkinStatusMap[selected] : "Selecione"}
          </p>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={ENUM_CHECKIN_STATUS.VALID_DOCUMENTS}>
              <span
                className={addColorByCheckInStatus(
                  ENUM_CHECKIN_STATUS.VALID_DOCUMENTS,
                  "text",
                )}
              >
                Válido
              </span>
            </SelectItem>
            <SelectItem value={ENUM_CHECKIN_STATUS.WAITING_FOR_DOCUMENTS}>
              <span
                className={addColorByCheckInStatus(
                  ENUM_CHECKIN_STATUS.WAITING_FOR_DOCUMENTS,
                  "text",
                )}
              >
                Aguardando
              </span>
            </SelectItem>
            <SelectItem value={ENUM_CHECKIN_STATUS.DOCUMENTS_SENT}>
              <span
                className={addColorByCheckInStatus(
                  ENUM_CHECKIN_STATUS.DOCUMENTS_SENT,
                  "text",
                )}
              >
                Enviado
              </span>
            </SelectItem>
            <SelectItem value={ENUM_CHECKIN_STATUS.INVALID_DOCUMENTS}>
              <span
                className={addColorByCheckInStatus(
                  ENUM_CHECKIN_STATUS.INVALID_DOCUMENTS,
                  "text",
                )}
              >
                Inválido
              </span>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar ação</DialogTitle>
            <DialogDescription>
              Deseja alterar a verificação do documento do inscrito{" "}
              <b>{name}</b>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose onClick={() => setSelected(initialValue)}>
              Cancelar
            </DialogClose>
            <Button loading={isPending} onClick={handleConfirm}>
              Sim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
