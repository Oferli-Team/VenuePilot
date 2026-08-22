import { FormProvider, useForm } from "react-hook-form";
import {
  healthSchema,
  healthRemSchema,
  type DataSectionProps,
} from "./schemas";
import { GridThreeColumns } from "../grid-three-column";
import { SectionHeading } from "../section-heading";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEditUser } from "./use-edit-user";
import { DynamicFieldsMapped } from "./dynamic-fields-mapped";
import { calcIMC } from "@/lib/utils/calcIMC";
import { stringToBoolean } from "@/lib/constants";
import React from "react";
import { useEventStore } from "@/lib/store/EventStore";
import { ENUM_EVENT_TYPE } from "@/lib/enum";
import { z } from "zod";

const convertToTrueOrFalse = (value: boolean | null | undefined): string => {
  return value === true ? `true` : `false`;
};

export const HealthParticipantInfo = ({
  title = "Dados de Saúde",
  user,
  fields,
}: DataSectionProps) => {
  const { isEditing, updateRegister, loading, handleChangeIsEditing } =
    useEditUser(user);

  const { event } = useEventStore();

  const isLegendaryEvent =
    (event?.type as ENUM_EVENT_TYPE) === ENUM_EVENT_TYPE.LEGENDARIOS;
  const schema = isLegendaryEvent ? healthSchema : healthRemSchema;

  type FormDataHealth = z.infer<typeof healthSchema>;
  type FormDataHealthRem = z.infer<typeof healthRemSchema>;

  const createForm = useForm<FormDataHealth | FormDataHealthRem>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...user,
      ...(isLegendaryEvent && {
        peso: user.peso ? user.peso?.toString() : undefined,
        altura: user.altura ? user.altura?.toString() : undefined,
        possuiPlanoSaude: convertToTrueOrFalse(user?.possuiPlanoSaude),
        possuiAlergia: convertToTrueOrFalse(user?.possuiAlergia),
        possuiProblemasCardiacos: convertToTrueOrFalse(
          user?.possuiProblemasCardiacos,
        ),
        possuiProblemasMusculoesqueleticos: convertToTrueOrFalse(
          user?.possuiProblemasMusculoesqueleticos,
        ),
        possuiProblemasRespiratorios: convertToTrueOrFalse(
          user?.possuiProblemasRespiratorios,
        ),
        possuiConvulsoes: convertToTrueOrFalse(user?.possuiConvulsoes),
        possuiDesmaios: convertToTrueOrFalse(user?.possuiDesmaios),
        possuiDiabetes: convertToTrueOrFalse(user?.possuiDiabetes),
        possuiDisturbiosAlimentares: convertToTrueOrFalse(
          user?.possuiDisturbiosAlimentares,
        ),
        cuidadosPsiquiatricos: convertToTrueOrFalse(
          user?.cuidadosPsiquiatricos,
        ),
        medicacaoDepressao: convertToTrueOrFalse(user?.medicacaoDepressao),
      }),
      isPregnant: convertToTrueOrFalse(user.isPregnant),
      hasHealthIssues: convertToTrueOrFalse(user.hasHealthIssues),
      healthIssuesDescription: user.healthIssuesDescription,
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    register,
    watch,
    setValue,
  } = createForm;

  const healthDataLegendary = (data: any): data is FormDataHealth => {
    console.log("chamou lgnd");
    return data;
  };

  const healthDataRem = (data: any): data is FormDataHealthRem => {
    console.log("chamou rem");
    return data;
  };

  const onSubmit = async (data: FormDataHealth | FormDataHealthRem) => {
    if (!user) return;

    if (
      event?.type === ENUM_EVENT_TYPE.LEGENDARIOS &&
      healthDataLegendary(data)
    ) {
      await updateRegister({
        eventoId: user.eventoId,
        id: user.id,
        peso: Number(data.peso),
        altura: Number(data.altura),
        imc: calcIMC(peso, altura),
        biotipo: data.biotipo ?? undefined,
        nomePlanoSaude: data.nomePlanoSaude ?? undefined,
        possuiAlergia: stringToBoolean(data.possuiAlergia),
        possuiDesmaios: stringToBoolean(data.possuiDesmaios),
        possuiConvulsoes: stringToBoolean(data.possuiConvulsoes),
        possuiDiabetes: stringToBoolean(data.possuiDiabetes),
        possuiPlanoSaude: stringToBoolean(data.possuiPlanoSaude),
        possuiDisturbiosAlimentares: stringToBoolean(
          data.possuiDisturbiosAlimentares,
        ),
        possuiProblemasCardiacos: stringToBoolean(
          data.possuiProblemasCardiacos,
        ),
        possuiProblemasMusculoesqueleticos: stringToBoolean(
          data.possuiProblemasMusculoesqueleticos,
        ),
        possuiProblemasRespiratorios: stringToBoolean(
          data.possuiProblemasRespiratorios,
        ),
        cuidadosPsiquiatricos: stringToBoolean(data.cuidadosPsiquiatricos),
        medicacaoDepressao: stringToBoolean(data.medicacaoDepressao),
      });
    }

    if (event?.type === ENUM_EVENT_TYPE.REM && healthDataRem(data)) {
      await updateRegister({
        eventoId: user.eventoId,
        id: user.id,
        isPregnant: data.isPregnant
          ? stringToBoolean(data.isPregnant)
          : undefined,
        hasHealthIssues: data.hasHealthIssues
          ? stringToBoolean(data.hasHealthIssues)
          : undefined,
        healthIssuesDescription: data.healthIssuesDescription ?? undefined,
      });
    }

    handleChangeIsEditing("health");
  };

  const peso = Number(watch("peso"));
  const altura = Number(watch("altura"));

  React.useEffect(() => {
    if (isLegendaryEvent) {
      setValue("imc", calcIMC(peso, altura).toString());
    }
  }, [peso, altura, setValue, isLegendaryEvent]);

  return (
    <FormProvider {...createForm}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridThreeColumns className="rounded-md border border-input bg-card p-4 sm:grid-cols-2">
          <SectionHeading
            title={title}
            isEditing={isEditing.health}
            onClick={() => handleChangeIsEditing("health")}
            loading={loading}
          />
          <DynamicFieldsMapped
            user={user}
            fields={fields}
            categories={["HEALTH"]}
            isEditing={isEditing.health}
            control={control}
            register={register}
            errors={errors}
          />
        </GridThreeColumns>
      </form>
    </FormProvider>
  );
};
