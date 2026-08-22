"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  type Control,
  Controller,
  type FieldError,
  FormProvider,
  useForm,
} from "react-hook-form";
import { type z } from "zod";
import Fieldset from "../Fiedset";
import { Textarea } from "../Textarea";
import { useStepsRegister } from "@/app/hook/useStepsRegister";
import { createDadosSaudeSchema } from "@/app/zod-validation/schemas";
import { type Loading } from "@/lib/types";
import { useFormStore } from "./useFormStore";
import { GridTwoColumns } from "../grid-two-columns";
import { FormFooterButton } from "../form-footer-buttons";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type FormData = z.infer<typeof createDadosSaudeSchema>;

type Names =
  | "possui_plano_saude"
  | "nome_plano_saude"
  | "possui_alergia"
  | "possui_diabetes"
  | "possui_convulsoes"
  | "possui_desmaios"
  | "possui_problemas_cardiacos"
  | "possui_disturbios_alimentares"
  | "possui_problemas_respiratorios"
  | "cuidados_psiquiatricos"
  | "medicacao_depressao"
  | "possui_problemas_musculoesqueleticos"
  | "doenca_ou_condicao"
  | "medicacoes"
  | "outras_informacoes_medicas"
  | "motivos_dieta_especial";

type Props = {
  name: Names;
  legend?: string;
  validationMessage: Pick<FieldError, "message"> | undefined;
  control: Control<FormData>;
};

const RadioFieldset = ({ name, legend, validationMessage, control }: Props) => (
  <Fieldset isRequired legend={legend} validationMessage={validationMessage}>
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <RadioGroup className="flex" onValueChange={field.onChange} {...field}>
          {[
            { value: "true", label: "Sim" },
            { value: "false", label: "Não" },
          ].map((opt) => (
            <RadioGroupItem
              key={opt.value}
              value={opt.value}
              variant="rect"
              className="px-4"
            >
              {opt.label}
            </RadioGroupItem>
          ))}
        </RadioGroup>
      )}
    />
  </Fieldset>
);

const TextareaWithCounter = ({
  name,
  control,
  validationMessage,
  legend,
}: Props) => (
  <Fieldset legend={legend} validationMessage={validationMessage}>
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="relative">
          <Textarea name={name} value={field.value} maxLength={1000} />
          {field.value && (
            <span className="pointer-events-none absolute right-0 text-xs text-primary">
              {field.value.length}
            </span>
          )}
        </div>
      )}
    />
  </Fieldset>
);

export default function DadosSaude() {
  const [loading, setLoading] = useState<Loading>("initial");

  // Hook do Zustand
  const { formData, setFormData } = useFormStore();

  const { handleStepChange } = useStepsRegister();

  const createForm = useForm<FormData>({
    resolver: zodResolver(createDadosSaudeSchema),
    defaultValues: formData,
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = createForm;

  const possui_plano: string = watch("possui_plano_saude");

  const onSubmit = async (data: FormData) => {
    setLoading("loading");

    setFormData(data);
    handleStepChange("uniform_terms");
  };

  // Sincronize o react-hook-form com o Zustand
  useEffect(() => {
    // Atualize o formulário com os dados do Zustand sempre que eles mudarem
    for (const key in formData) {
      setValue(key as keyof FormData, formData[key]);
    }
  }, [formData, setValue]);

  return (
    <FormProvider {...createForm}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-12 pt-4"
      >
        <GridTwoColumns className="gap-6" title="Dados de Saúde">
          <div className="space-y-2">
            <RadioFieldset
              name="possui_plano_saude"
              legend="Possui Plano de Saúde?"
              validationMessage={errors.possui_plano_saude}
              control={control}
            />
            {possui_plano === "true" && (
              <Fieldset
                legend="Qual plano de saúde?"
                validationMessage={errors.nome_plano_saude}
              >
                <Controller
                  name="nome_plano_saude"
                  control={control}
                  render={({ field }) => (
                    <Input
                      name="nome_plano_saude"
                      placeholder="ex: Cassems"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Fieldset>
            )}
          </div>
          <RadioFieldset
            name="possui_alergia"
            legend="Alergias?"
            validationMessage={errors.possui_alergia}
            control={control}
          />
          <RadioFieldset
            name="possui_diabetes"
            legend="Diabetes?"
            validationMessage={errors.possui_diabetes}
            control={control}
          />
          <RadioFieldset
            name="possui_convulsoes"
            legend="Convulsões?"
            validationMessage={errors.possui_convulsoes}
            control={control}
          />
          <RadioFieldset
            name="possui_desmaios"
            legend="Episódios de desmaio?"
            validationMessage={errors.possui_desmaios}
            control={control}
          />
          <RadioFieldset
            name="possui_problemas_cardiacos"
            legend="Problemas cardíacos?"
            validationMessage={errors.possui_problemas_cardiacos}
            control={control}
          />
        </GridTwoColumns>

        <GridTwoColumns className="gap-6">
          <RadioFieldset
            name="possui_disturbios_alimentares"
            legend="Transtornos alimentares ou problemas estomacais?"
            validationMessage={errors.possui_disturbios_alimentares}
            control={control}
          />

          <RadioFieldset
            name="possui_problemas_respiratorios"
            legend="Problemas respiratórios como asma, enfisema, DPOC?"
            validationMessage={errors.possui_problemas_respiratorios}
            control={control}
          />

          <RadioFieldset
            name="cuidados_psiquiatricos"
            legend="Cuidados psiquiátricos?"
            validationMessage={errors.cuidados_psiquiatricos}
            control={control}
          />

          <RadioFieldset
            name="medicacao_depressao"
            legend="Faz uso de medicamentos para depressão ou problemas de comportamento?"
            validationMessage={errors.medicacao_depressao}
            control={control}
          />

          <RadioFieldset
            name="possui_problemas_musculoesqueleticos"
            legend="Transtornos músculo-esquelético (artrodese, lesões na coluna, etc)?"
            validationMessage={errors.possui_problemas_musculoesqueleticos}
            control={control}
          />
        </GridTwoColumns>

        <div className="mt-4">
          <TextareaWithCounter
            name="doenca_ou_condicao"
            control={control}
            validationMessage={errors.doenca_ou_condicao}
            legend="Se você respondeu SIM a alguma das perguntas anteriores, explique qual é a doença e/ou condição:"
          />
          <TextareaWithCounter
            name="medicacoes"
            control={control}
            validationMessage={errors.medicacoes}
            legend="Faz uso de qualquer medicação atualmente (indique):"
          />
          <TextareaWithCounter
            name="outras_informacoes_medicas"
            control={control}
            validationMessage={errors.outras_informacoes_medicas}
            legend="Detalhe qualquer outra informação médica importante que a equipe organizadora deva saber durante a sua estadia no evento de LEGENDÁRIOS:"
          />
          <TextareaWithCounter
            name="motivos_dieta_especial"
            control={control}
            validationMessage={errors.motivos_dieta_especial}
            legend="Por razões médicas requer uma dieta especial? (descreva):"
          />
        </div>

        <FormFooterButton
          handleBackStep={() => handleStepChange("personal")}
          loading={loading === "loading"}
        />
      </form>
    </FormProvider>
  );
}
