"use client";

import { useEventStepsStore } from "@/app/(pages)/manada/[orgSlug]/criar-evento/event-step-store";
import { ENUM_EVENT_TYPE } from "@/lib/enum";
import { useEventStore } from "@/lib/store/EventStore";
import { getCurrentOrgFromCookie } from "@/lib/utils/getCurrentOrgFromCookie";
import { slugify } from "@/lib/utils/slugify";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Link, Pin, X } from "lucide-react";
import React, { useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { type z } from "zod";
import { eventGeneralInfoSchema } from "../../zod-validation/schemas";
import Fieldset from "../Fiedset";
import { GridTwoColumns } from "../grid-two-columns";
import { Tiptap } from "../tiptap/tip-tap-editor";
import { Spinner } from "../ui/spinner";
import { Button } from "../ui/button";
import { DatePicker } from "../ui/date-picker";
import { Input } from "../ui/input";
import { InputUpload } from "../ui/input-upload";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/selects";
import { createWhatsappLink } from "@/lib/whatsapp";
import { ITOP } from "@/lib/constants";
import { toast } from "../ui/use-toast";
import { useResetEventStepData } from "@/lib/hooks/useResetEventStepData";

type FormData = z.infer<typeof eventGeneralInfoSchema>;

const ErrorEditMessage = ({ isEdit }: { isEdit: boolean }) => {
  const { event } = useEventStore();

  return (
    isEdit && (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <p className="">Não é possível alterar o número do evento. </p>
        <a
          target="_blank"
          href={createWhatsappLink({
            phone: ITOP.whatsapp_suporte,
            text: `Olá, time iTOP. Consigo alterar o número/tipo do evento da minha organização ${event?.pista}?`,
          })}
        >
          Se precisar, fale com time iTOP
        </a>
      </div>
    )
  );
};

export const FormCreateEvent = ({ isEdit }: { isEdit: boolean }) => {
  const { event } = useEventStore();
  const { formData, setFormGeneralData, setStep, setDirtyStep } =
    useEventStepsStore();
  const orgSlug = getCurrentOrgFromCookie();

  const { resetEventStepData } = useResetEventStepData("general");

  const [topNumberInput, setTopNumberInput] = React.useState<{
    value: number;
    isBlur: boolean;
  } | null>(null);

  const { mutate: updateEvent, isPending: updateIsPending } =
    api.evento.updateGeneralInfo.useMutation({
      onError: async () => {
        toast({
          title: "Não foi possível alterar o evento.",
          variant: "destructive",
        });
      },
      onSuccess: async () => {
        await resetEventStepData();

        toast({
          title: "Evento alterado com sucesso!",
          variant: "success",
        });
      },
    });

  const { data: existTopNumber, isLoading } =
    api.evento.checkIfTopNumberExists.useQuery(
      { topNumero: topNumberInput?.value ?? 0 },
      { enabled: !isEdit && topNumberInput?.isBlur },
    );

  const getDefaultValues = (isEdit: boolean): Partial<FormData> => {
    if (isEdit && event) {
      return {
        ...event,
        topNumero: event.topNumero ? String(event.topNumero) : "",
        dataInicio: event.dataInicio ? new Date(event.dataInicio) : undefined,
        dataFim: event.dataFim ? new Date(event.dataFim) : undefined,
      };
    }

    if (!isEdit && formData?.slug !== "") {
      return {
        ...formData,
        topNumero: formData?.topNumero ? String(formData.topNumero) : "",
        dataInicio: formData?.dataInicio
          ? new Date(formData?.dataInicio)
          : undefined,
        dataFim: formData?.dataFim ? new Date(formData?.dataFim) : undefined,
      };
    }

    return {};
  };

  const defaultValues = React.useMemo(() => {
    return getDefaultValues(isEdit);
  }, [isEdit]);

  const createForm = useForm<FormData>({
    resolver: zodResolver(eventGeneralInfoSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { errors, isDirty },
    control,
  } = createForm;

  const onSubmit = async (data: FormData) => {
    const startDate = new Date(data.dataInicio);
    const endDate = new Date(data.dataFim);
    const dayStart = format(startDate, "dd", { locale: ptBR });
    const dayEnd = format(endDate, "dd", { locale: ptBR });
    const month = format(startDate, "MMMM", { locale: ptBR });
    const year = format(startDate, "yyyy");
    const periodo = `${dayStart} a ${dayEnd} de ${month.charAt(0).toUpperCase() + month.slice(1)} de ${year}`;
    const type = data.type as ENUM_EVENT_TYPE;

    if (!event || !orgSlug) {
      return;
    }

    if (!isEdit) {
      const formData = {
        ...data,
        slug: slugify(data.topNumero),
        topNumero: Number(data.topNumero),
        periodo,
        type,
      };
      setFormGeneralData(formData);
      setStep("tickets");
      return;
    }

    if (isEdit) {
      updateEvent({
        id: event.id,
        ...data,
        periodo,
        type,
      });
    }
  };

  const handleTopNumberOnBlur = (
    e: React.FocusEvent<HTMLInputElement, Element>,
  ) => {
    const value = e.target.value;
    setTopNumberInput({ value: Number(value), isBlur: true });
  };

  const rightIcon = React.useMemo(() => {
    if (isLoading) return <Spinner />;

    if (existTopNumber && topNumberInput?.value)
      return <X className="h-4 w-4 text-destructive" />;
    if (!existTopNumber && topNumberInput?.value)
      return <Check className="h-4 w-4 text-success" />;

    return <></>;
  }, [existTopNumber, isLoading, topNumberInput?.value]);

  useEffect(() => {
    if (isEdit && isDirty) {
      setDirtyStep("general", isDirty);
    }
  }, [isDirty, isEdit, setDirtyStep]);

  return (
    <FormProvider {...createForm}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col justify-end"
      >
        <GridTwoColumns>
          <Fieldset legend="Tipo do Evento" validationMessage={errors.type}>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isEdit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={ENUM_EVENT_TYPE.LEGENDARIOS}>
                        Legendários
                      </SelectItem>
                      <SelectItem value={ENUM_EVENT_TYPE.REM}>
                        REM - Reto de Empoderamento Matrimonial
                      </SelectItem>
                      <SelectItem value={ENUM_EVENT_TYPE.LEGADO_FILHA}>
                        Legado (filha)
                      </SelectItem>
                      <SelectItem value={ENUM_EVENT_TYPE.LEGADO_FILHO}>
                        Legado (filho)
                      </SelectItem>
                      <SelectItem value={ENUM_EVENT_TYPE.MANADADAY}>
                        Manada Day
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />

            <ErrorEditMessage isEdit={isEdit} />
          </Fieldset>

          <Fieldset
            legend="Número do Evento"
            validationMessage={errors.topNumero}
          >
            <Controller
              control={control}
              name="topNumero"
              render={({ field }) => (
                <Input
                  {...field}
                  disabled={isEdit}
                  value={field.value ?? ""}
                  type="tel"
                  onBlur={handleTopNumberOnBlur}
                  rightIcon={rightIcon}
                />
              )}
            />

            <ErrorEditMessage isEdit={isEdit} />
          </Fieldset>

          <Fieldset legend="Título" validationMessage={errors.titulo}>
            <Controller
              control={control}
              name="titulo"
              render={({ field }) => (
                <Input {...field} value={field.value || ""} />
              )}
            />
          </Fieldset>
          <Fieldset legend="Subtítulo" validationMessage={errors.subtitulo}>
            <Controller
              control={control}
              name="subtitulo"
              render={({ field }) => (
                <Input {...field} value={field.value || ""} />
              )}
            />
          </Fieldset>
        </GridTwoColumns>

        <Fieldset
          className="col-span-full"
          legend="Descrição"
          validationMessage={errors.description}
        >
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <Tiptap content={field.value} onChange={field.onChange} />
            )}
          />
        </Fieldset>

        <GridTwoColumns className="mt-4">
          <Fieldset legend="Data Início" validationMessage={errors.dataInicio}>
            <Controller
              control={control}
              name="dataInicio"
              render={({ field }) => (
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                  ref={field.ref}
                />
              )}
            />
          </Fieldset>

          <Fieldset legend="Data Final" validationMessage={errors.dataFim}>
            <Controller
              control={control}
              name="dataFim"
              render={({ field }) => (
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                  ref={field.ref}
                />
              )}
            />
          </Fieldset>
        </GridTwoColumns>

        <GridTwoColumns className="mt-4">
          <Fieldset legend="Local do evento" validationMessage={errors.local}>
            <Controller
              control={control}
              name="local"
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Cidade onde irá acontecer o evento"
                  leftIcon={<Pin className="size-4" />}
                />
              )}
            />
          </Fieldset>

          <Fieldset
            legend="Local onde será o check-in do evento"
            validationMessage={errors.localSaida}
          >
            <Controller
              control={control}
              name="localSaida"
              render={({ field }) => (
                <Input {...field} value={field.value ?? ""} />
              )}
            />
          </Fieldset>

          <Fieldset
            legend="Endeço onde será o check-in do evento"
            validationMessage={errors.localUrl}
            className="col-span-full"
          >
            <Controller
              control={control}
              name="localUrl"
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  leftIcon={<Link className="size-4" />}
                />
              )}
            />

            <a
              href="https://www.google.com/maps"
              target="_blank"
              className="w-fit text-sm text-muted-foreground duration-150 hover:text-blue-500/80"
            >
              Buscar endereço no Google Maps
            </a>
          </Fieldset>

          <Fieldset legend="Imagem / Banner" validationMessage={errors.banner}>
            <Controller
              name="banner"
              control={control}
              render={({ field }) => (
                <InputUpload
                  multiple={false}
                  onUpload={field.onChange}
                  value={field.value}
                />
              )}
            />
          </Fieldset>
        </GridTwoColumns>

        <Button
          disabled={existTopNumber}
          loading={updateIsPending}
          className="mt-6 self-end md:w-36"
          type="submit"
        >
          Confirmar
        </Button>
      </form>
    </FormProvider>
  );
};
