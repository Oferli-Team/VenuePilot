"use client";

import React from "react";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { api } from "@/trpc/react";
import { convertToBasisPoint } from "@/lib/utils/basisPoint";
import { useEventStore } from "@/lib/store/EventStore";
import { eventTicketInfoSchema } from "@/app/zod-validation/schemas";
import { toast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { useEventStepsStore } from "@/app/(pages)/manada/[orgSlug]/criar-evento/event-step-store";
import { ENUM_EVENT_TYPE } from "@/lib/enum";
import { TicketLegendary } from "./ticket-legendary";
import { TicketRem } from "./ticket-rem";
import { useResetEventStepData } from "@/lib/hooks/useResetEventStepData";

const eventTypeTicketMap: Record<ENUM_EVENT_TYPE, React.FC> = {
  [ENUM_EVENT_TYPE.LEGENDARIOS]: TicketLegendary,
  [ENUM_EVENT_TYPE.REM]: TicketRem,
  [ENUM_EVENT_TYPE.LEGADO_FILHA]: () => null,
  [ENUM_EVENT_TYPE.LEGADO_FILHO]: () => null,
  [ENUM_EVENT_TYPE.MANADADAY]: () => null,
};

type FormData = z.infer<typeof eventTicketInfoSchema>;

export const FormEventTicket = ({ isEdit }: { isEdit: boolean }) => {
  const { event, setEvent } = useEventStore();
  const { formData, setFormTicketData, setStep, setDirtyStep } =
    useEventStepsStore();

  const { resetEventStepData } = useResetEventStepData("tickets");

  const { mutateAsync: updateEvent, isPending: updateEventIsPending } =
    api.evento.updateTicketInfo.useMutation({
      onError: async () => {
        toast({
          title: "Não foi possível alterar ingressos",
          variant: "destructive",
        });
      },
      onSuccess: async (updatedEvent) => {
        if (updatedEvent && event) {
          setEvent({
            ...event,
            ...updatedEvent,
          });
        }

        await resetEventStepData();

        toast({
          title: "Ingresso alterado com sucesso!",
          variant: "success",
        });
      },
    });

  const getDefaultValues = (isEdit: boolean): Partial<FormData> => {
    if (isEdit && event) {
      return {
        ...event,
        vagasParticipar: String(event?.vagasParticipar),
        vagasServir: String(event?.vagasServir),
        valorParticipante: String(
          convertToBasisPoint(event?.valorParticipante ?? 0),
        ),
        valorParaLgndCertificados: String(
          convertToBasisPoint(event?.valorParaLgndCertificados ?? 0),
        ),
        valorParaObterCertificacao: String(
          convertToBasisPoint(event?.valorParaObterCertificacao ?? 0),
        ),
      };
    }

    if (!isEdit && formData?.slug !== "") {
      return {
        ...formData,
        vagasParticipar: String(formData?.vagasParticipar),
        vagasServir: String(formData?.vagasServir),
        valorParticipante: String(
          convertToBasisPoint(formData?.valorParticipante ?? 0),
        ),
        valorParaLgndCertificados: String(
          convertToBasisPoint(formData?.valorParaLgndCertificados ?? 0),
        ),
        valorParaObterCertificacao: String(
          convertToBasisPoint(formData?.valorParaObterCertificacao ?? 0),
        ),
      };
    }

    return {};
  };

  const defaultValues = React.useMemo(() => {
    return getDefaultValues(isEdit);
  }, [isEdit]);

  const createForm = useForm<FormData>({
    resolver: zodResolver(eventTicketInfoSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isDirty },
  } = createForm;

  const onSubmit = async (data: FormData) => {
    const {
      vagasParticipar,
      vagasServir,
      valorParticipante,
      valorParaLgndCertificados,
      valorParaObterCertificacao,
      linkWhatsappGrupoParticipante,
      linkWhatsappGrupoServir,
    } = data;

    if (event && !isEdit) {
      const formDataUpdated = {
        linkWhatsappGrupoParticipante,
        linkWhatsappGrupoServir,
        vagasParticipar,
        vagasServir,
        valorParticipante,
        valorParaLgndCertificados,
        valorParaObterCertificacao,
      };
      setFormTicketData(formDataUpdated);
      setStep("terms");
      return;
    }

    if (isEdit && event) {
      await updateEvent({
        id: event?.id,
        linkWhatsappGrupoParticipante,
        linkWhatsappGrupoServir,
        vagasParticipar,
        vagasServir,
        valorParticipante,
        valorParaLgndCertificados,
        valorParaObterCertificacao,
      });
    }
  };

  function renderTicket(type?: ENUM_EVENT_TYPE) {
    const Component = type ? eventTypeTicketMap[type] : null;
    return Component ? <Component /> : null;
  }

  React.useEffect(() => {
    if (isEdit && isDirty) {
      setDirtyStep("tickets", isDirty);
    }
  }, [isDirty, isEdit, setDirtyStep]);

  return (
    <FormProvider {...createForm}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col space-y-4 rounded-md bg-card"
      >
        {isEdit && renderTicket(event?.type as ENUM_EVENT_TYPE)}
        {!isEdit && renderTicket(formData?.type as ENUM_EVENT_TYPE)}

        <Button
          loading={updateEventIsPending}
          className="mt-6 w-36 self-end"
          type="submit"
        >
          Confirmar
        </Button>
      </form>
    </FormProvider>
  );
};
