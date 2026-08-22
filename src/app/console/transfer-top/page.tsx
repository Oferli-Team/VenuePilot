"use client";

import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { ArrowLeftRight, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/selects";
import { ContainerSpace } from "@/components/ui/container";
import React from "react";
import { ItemUser } from "@/components/qr-code/item-user";
import { GridTwoColumns } from "@/components/grid-two-columns";
import {
  getInscricaoByCPF,
  sendInngestEventConfirmedRegisterNotification,
} from "@/lib/queries/client";
import type { Evento, Inscricao } from "@prisma/client";
import { reais } from "@/lib/utils/money";
import { ENUM_PAYMENT_STATUS, ENUM_STATUS } from "@/lib/enum";
import { toast } from "@/components/ui/use-toast";
import { convertFromBasisPoint } from "@/lib/utils/basisPoint";
import type { Loading } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  addColorByPaymentStatus,
  getStatusClass,
} from "@/lib/utils/getStatusClass";
import { paymentStatusOptions, statusOptions } from "@/lib/constants";
import { FaWhatsapp } from "react-icons/fa6";

const SelectEvent = ({
  value,
  onValueChange,
  events,
  placeholder = "Selecione o TOP",
}: {
  value: string;
  onValueChange: (value: string) => void;
  events: Evento[];
  placeholder?: string;
}) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {events?.map((event) => (
            <SelectItem key={event.topNumero} value={event.id}>
              {event.pista} - TOP#{event.topNumero}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

type Register = Pick<
  Inscricao,
  | "id"
  | "celular"
  | "nome"
  | "cpf"
  | "status"
  | "tipoInscricao"
  | "reembolso_status"
  | "pagamento_status"
  | "pagamento_total_value"
  | "obs"
  | "pagamento_link_url"
  | "metodo_pagamento"
  | "flags"
> & {
  evento: Pick<
    Evento,
    | "id"
    | "pista"
    | "topNumero"
    | "linkWhatsappGrupoParticipante"
    | "linkWhatsappGrupoServir"
    | "dataInicio"
  >;
};

type RegisterInfoProps = {
  title: string;
  eventIdSelected: string;
  events: Evento[] | undefined;
  hasTicket?: boolean;
  hasPayment?: boolean;
  hasMessageSendButton?: boolean;
  register: Register;
  className?: string;
};

const RegisterInfo = ({
  register,
  events,
  title,
  hasTicket = false,
  hasPayment = false,
  hasMessageSendButton = false,
  eventIdSelected,
  className,
}: RegisterInfoProps) => {
  const [loading, setLoading] = React.useState<Loading>("initial");

  const sendConfirmationMessage = async () => {
    setLoading("loading");
    try {
      await sendInngestEventConfirmedRegisterNotification({
        event: register.evento,
        register: {
          id: register.id,
          nome: register.nome,
          tipoInscricao: register.tipoInscricao,
          celular: register.celular,
          flags: register.flags,
        },
      });

      toast({
        title: "Mensagem de confirmação enviada com sucesso!",
        variant: "success",
      });
    } catch (error) {
      console.log({ error });
      toast({
        title: "Ops, não foi possível enviar mensagem.",
        variant: "destructive",
      });
    } finally {
      setLoading("initial");
    }
  };

  return (
    <GridTwoColumns title={title} className={cn(className)}>
      <ItemUser
        className="text-muted-foreground"
        classNameDesc="text-foreground"
        label="Evento"
        description={`TOP#${events?.find((event) => event.id === eventIdSelected)?.topNumero}`}
      />
      <ItemUser
        className="text-muted-foreground"
        classNameDesc="text-foreground"
        label="Nome"
        description={register?.nome ?? ""}
      />
      <ItemUser
        className="text-muted-foreground"
        classNameDesc="text-foreground"
        label="Documento"
        description={register?.cpf ?? ""}
      />

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Status</p>
        <Badge
          variant="success"
          className={cn(
            getStatusClass(register.status as ENUM_STATUS),
            "py-1 text-sm",
          )}
        >
          {
            statusOptions.find((status) => status.value === register.status)
              ?.label
          }
        </Badge>
      </div>

      <ItemUser
        className="text-muted-foreground"
        classNameDesc="text-foreground"
        label="Tipo Inscrição"
        description={register?.tipoInscricao ?? "-"}
      />
      <ItemUser
        className="text-muted-foreground"
        classNameDesc="text-foreground"
        label="Obersavação"
        description={register?.obs ?? "-"}
      />

      {register.metodo_pagamento && (
        <ItemUser
          className="text-muted-foreground"
          classNameDesc="text-foreground"
          label="Pagamento"
          description={`${register?.metodo_pagamento} - Valor: ${reais(convertFromBasisPoint(register?.pagamento_total_value ?? 0) ?? register.pagamento_topValue ?? 0)}`}
        />
      )}

      {hasPayment && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">
            Status de Pagamento
          </p>
          <Badge
            variant="success"
            className={cn(
              addColorByPaymentStatus(
                register.pagamento_status as ENUM_PAYMENT_STATUS,
                "bg",
              ),
              "py-1",
            )}
          >
            {paymentStatusOptions.find(
              (status) => status.value === register.pagamento_status,
            )?.label ?? "Não encontrado dados de pagamento"}
          </Badge>
        </div>
      )}

      {register.pagamento_link_url && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">
            Comprovante
          </p>
          <a
            className="underline"
            target="_blank"
            href={register.pagamento_link_url ?? "#"}
          >
            {register.pagamento_link_url ?? "-"}
          </a>
        </div>
      )}

      {register.reembolso_status && (
        <ItemUser
          className="text-muted-foreground"
          classNameDesc="text-foreground"
          label="Reembolso"
          description={register.reembolso_status ?? "Não possui reembolso"}
        />
      )}

      {hasTicket && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Ticket</p>
          <Button variant="blue" asChild>
            <Link
              className="underline"
              target="_blank"
              href={`/ticket/${register.evento.id}/${register.cpf}`}
            >
              Ver ticket
            </Link>
          </Button>
        </div>
      )}

      {hasMessageSendButton && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">
            Mensagem de Confirmação de Inscrição
          </p>
          <Button
            loading={loading === "loading"}
            onClick={sendConfirmationMessage}
            variant="success"
          >
            <FaWhatsapp className="mr-2 size-4" />
            Enviar mensagem
          </Button>
        </div>
      )}
    </GridTwoColumns>
  );
};

export default function TransfersEventPage() {
  const { data: events } = api.evento.getAllEvento.useQuery();
  const {
    mutateAsync: createTransferToAnotherEvent,
    isPending: creatingRegister,
  } = api.inscricao.createTransferToAnotherEvent.useMutation();

  const [inputObs, setInputObs] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState<Loading>("initial");
  const [eventIdToTransfer, setEventIdToTransfer] = React.useState("");
  const [registerFound, setRegisterFound] = React.useState<Register | null>(
    null,
  );
  const [currentRegister, setCurrentRegister] = React.useState({
    eventId: "",
    document: "",
  });
  const [transferDone, setTransferDone] = React.useState<{
    old: Register | null;
    new: Register | null;
  }>({
    old: null,
    new: null,
  });

  const getRegister = async () => {
    try {
      setRegisterFound(null);
      setLoading("loading");
      if (currentRegister.document === "" || currentRegister.eventId === "") {
        setError("Informe documento e o evento para buscar inscrição");
        return;
      }

      const register = await getInscricaoByCPF(
        currentRegister.document,
        currentRegister.eventId,
      );

      if (!register) {
        setError("Não encontramos inscrição para o TOP selecionado");
        return;
      }

      setError("");
      setRegisterFound(register);
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading("initial");
    }
  };

  const handleConfirmTransfer = async () => {
    try {
      setError("");

      if (inputObs === "" || eventIdToTransfer === "") {
        setError("Adicione uma Observação ou selecione o evento");
        return;
      }

      const register = await createTransferToAnotherEvent({
        register: registerFound,
        eventId: eventIdToTransfer,
        obs: inputObs,
      });

      toast({
        title: `Inscrição transferida com sucesso`,
        variant: "success",
      });

      setTransferDone(register);

      setRegisterFound(null);
      setInputObs("");
      setEventIdToTransfer("");
      setCurrentRegister({
        document: "",
        eventId: "",
      });
    } catch (error) {
      console.log({ error });
    }
  };

  const registerIsPaid = (status: ENUM_PAYMENT_STATUS) => {
    const notConfirmed = [
      ENUM_PAYMENT_STATUS.CHARGE_CREATED,
      ENUM_PAYMENT_STATUS.CHARGE_EXPIRED,
      ENUM_PAYMENT_STATUS.PAGAMENTO_CARTAO_PENDENTE,
    ];
    if (notConfirmed.includes(status)) return false;
    return true;
  };
  const hasRefundOrStatusCancel = React.useMemo(() => {
    const isPaid =
      registerFound?.pagamento_status &&
      registerIsPaid(registerFound?.pagamento_status as ENUM_PAYMENT_STATUS);
    if (
      registerFound?.status === ENUM_STATUS.CANCELADA_PELO_CLIENTE ||
      registerFound?.reembolso_status ||
      !isPaid
    )
      return true;
    return false;
  }, [registerFound]);

  const eventsCanTransfer = React.useMemo(() => {
    return events?.filter((event) => {
      const dateNow = new Date();
      const eventInitialDate = new Date(event?.dataInicio);

      if (dateNow < eventInitialDate) return event;
    });
  }, [events]);

  return (
    <Section>
      <ContainerSpace className="mt-24">
        <Heading title="Transferência de TOP" icon={ArrowLeftRight} />

        <div className="space-y-3">
          <h3 className="font-medium">
            Selecione o TOP da inscrição do participante e o documento
          </h3>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            {events ? (
              events.length > 0 && (
                <SelectEvent
                  value={currentRegister.eventId}
                  onValueChange={(value) => {
                    setCurrentRegister((prevState) => ({
                      ...prevState,
                      eventId: value,
                    }));
                    setTransferDone({ old: null, new: null });
                  }}
                  events={events}
                />
              )
            ) : (
              <div className="flex h-14 w-full items-center rounded-md border border-muted">
                Carregando eventos...
              </div>
            )}
            <Input
              placeholder="Documento da inscrição"
              value={currentRegister.document}
              onChange={(e) => {
                setCurrentRegister((prevState) => ({
                  ...prevState,
                  document: e.target.value,
                }));
                setTransferDone({ old: null, new: null });
              }}
              rightIcon={
                <Button loading={loading === "loading"} onClick={getRegister}>
                  Buscar
                </Button>
              }
            />
          </div>
          <p className="ml-2 text-sm text-destructive">{error}</p>
        </div>

        {registerFound && (
          <div className="space-y-6 rounded-md bg-card p-4">
            <RegisterInfo
              title="Inscrição"
              events={events}
              eventIdSelected={currentRegister.eventId}
              register={registerFound}
              hasPayment
            />

            {hasRefundOrStatusCancel ? (
              <p className="flex items-center gap-1 text-destructive">
                <X size={16} />
                Não é possível realizar a transferência: inscrição está
                cancelada, não houve pagamento ou já foi reembolsado
              </p>
            ) : (
              <p className="flex items-center gap-1 text-success">
                <Check size={16} /> Apto para realizar transferência de TOP
              </p>
            )}

            {!hasRefundOrStatusCancel && (
              <div className="flex items-center gap-4">
                {eventsCanTransfer && eventsCanTransfer.length > 0 && (
                  <SelectEvent
                    value={eventIdToTransfer}
                    onValueChange={(value) => setEventIdToTransfer(value)}
                    events={eventsCanTransfer}
                    placeholder="Selecione o TOP que irá transferir"
                  />
                )}

                <Input
                  defaultValue={"transferencia de TOP."}
                  placeholder="Adicione uma observação"
                  onBlur={(e) => setInputObs(e.target.value)}
                />

                <Button
                  onClick={handleConfirmTransfer}
                  loading={creatingRegister}
                >
                  Confirmar Transferência
                </Button>
              </div>
            )}
          </div>
        )}

        {transferDone.new && transferDone.old && (
          <GridTwoColumns
            className="flex flex-wrap items-center justify-between gap-4"
            title="✅ Transferência concluída - Resumo"
          >
            <RegisterInfo
              className="w-full rounded-md bg-gradient-to-l from-destructive/20 to-card p-4"
              title="Inscrição antiga"
              events={events}
              eventIdSelected={transferDone.old?.evento.id}
              register={transferDone.old}
            />

            <RegisterInfo
              className="w-full rounded-md bg-gradient-to-l from-success/20 to-card p-4"
              title="Inscrição nova"
              events={events}
              eventIdSelected={transferDone.new?.evento.id}
              register={transferDone.new}
              hasTicket
              hasMessageSendButton
            />
          </GridTwoColumns>
        )}
      </ContainerSpace>
    </Section>
  );
}
