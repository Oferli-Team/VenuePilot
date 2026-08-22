"use client";

import { zodResolver } from "@hookform/resolvers/zod";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { type z } from "zod";
import { type LinkSecreto } from "@prisma/client";
import Radio from "../Radio";
import { api } from "@/trpc/react";
import { useStepsRegister } from "@/app/hook/useStepsRegister";
import { Checkbox } from "../ui/checkbox";
import { TermAndConditional } from "../term-and-conditionals";
import { createFardamentoETermoSchema } from "@/app/zod-validation/schemas";
import { useFormStore } from "./useFormStore";
import { stringToBoolean } from "@/lib/constants";
import { unmask } from "remask";
import { add } from "date-fns";
import { GridTwoColumns } from "../grid-two-columns";
import { FormFooterButton } from "../form-footer-buttons";
import { toast } from "../ui/use-toast";
import { useSearchParams } from "next/navigation";
import { getLinkSecreto } from "@/lib/queries/client";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import Fieldset from "../Fiedset";

export const shirtSizes = [
  { size: "PPP", value: "PPP", description: "Altura 61.0 e Largura 50.8" },
  { size: "PP", value: "PP", description: "Altura 61.6 e Largura 53.3" },
  { size: "P", value: "P", description: "Altura 62.2 e Largura 55.9" },
  { size: "M", value: "M", description: "Altura 62.9 e Largura 59.1" },
  { size: "G", value: "G", description: "Altura 63.5 e Largura 62.2" },
  { size: "GG", value: "GG", description: "Altura 64.8 e Largura 68" },
  { size: "2GG", value: "2GG", description: "Altura 64.8 e Largura 68" },
  { size: "3GG", value: "3GG", description: "Altura 65.4 e Largura 71.1" },
  { size: "4GG", value: "4GG", description: "Altura 66 e Largura 76.2" },
  { size: "5GG", value: "5GG", description: "Altura 66.7 e Largura 81.3" },
];

type FormData = z.infer<typeof createFardamentoETermoSchema>;

export default function Fardamento() {
  const searchParams = useSearchParams();
  const hasLinkParams = searchParams.has("link");

  const [loading, setLoading] = useState<"initial" | "loading">("initial");

  // Hook do Zustand
  const { formData, setFormData, eventRegister } = useFormStore();
  const { handleStepChange } = useStepsRegister();

  const createForm = useForm<FormData>({
    resolver: zodResolver(createFardamentoETermoSchema),
    defaultValues: {
      tamanho_farda: formData.tamanho_farda,
      aceitaTermos: formData.aceitaTermos,
    },
  });

  const {
    handleSubmit,
    setValue,
    formState: { errors },
    control,
  } = createForm;

  const updateInscricao = api.inscricao.updateInscricao.useMutation();
  const createInscricao =
    api.inscricao.createInscricaoParticipante.useMutation();
  const usarLink = api.linkSecreto.usarLink.useMutation();

  const checkSecretLink = async (): Promise<LinkSecreto | null> => {
    try {
      if (!hasLinkParams) {
        return null;
      }

      if (!eventRegister) return null;

      const link = searchParams.get("link");
      const data = await getLinkSecreto(link!, eventRegister.id);
      if (data) return data;

      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const onSubmit = async ({ aceitaTermos, tamanho_farda }: FormData) => {
    setLoading("loading");
    setFormData({ aceitaTermos, tamanho_farda });

    try {
      if (!eventRegister) {
        toast({
          title: "Algo deu errado!",
          variant: "destructive",
        });
        return;
      }

      const dataNascimento = add(formData.data_nascimento, { hours: 12 }); // add 12pm
      const linkSecreto = await checkSecretLink();

      const dataToSave = {
        ...formData,
        eventoId: eventRegister.id,
        dataNascimento,
        peso: Number(unmask(formData.peso)),
        altura: Number(unmask(formData.altura)),
        qtdFilhos: Number(formData.qtd_filhos),
        temFilhos: stringToBoolean(formData.tem_filhos),
        nomeContatoCartas: formData.nome_contato_cartas,
        celularContatoCartas: formData.celular_contato_cartas,
        estadoCivil: formData.estado_civil,
        ruaNumero: formData.rua_numero,
        ruaComplemento: formData.rua_complemento,
        celularContatoEmergencia: formData.celular_contato_emergencia,
        nomeContatoEmergencia: formData.nome_contato_emergencia,
        tipoVinculoContatoEmergencia: formData.tipo_vinculo_contato_emergencia,
        biotipo: formData.biotipo,
        nomePlanoSaude: formData.nome_plano_saude,
        possuiPlanoSaude: stringToBoolean(formData.possui_plano_saude),
        possuiAlergia: stringToBoolean(formData.possui_alergia),
        possuiDiabetes: stringToBoolean(formData.possui_diabetes),
        possuiConvulsoes: stringToBoolean(formData.possui_convulsoes),
        possuiDesmaios: stringToBoolean(formData.possui_desmaios),
        possuiProblemasCardiacos: stringToBoolean(
          formData.possui_problemas_cardiacos,
        ),
        possuiDisturbiosAlimentares: stringToBoolean(
          formData.possui_disturbios_alimentares,
        ),
        possuiProblemasRespiratorios: stringToBoolean(
          formData.possui_problemas_respiratorios,
        ),
        cuidadosPsiquiatricos: stringToBoolean(formData.cuidados_psiquiatricos),
        medicacaoDepressao: stringToBoolean(formData.medicacao_depressao),
        possuiProblemasMusculoesqueleticos: stringToBoolean(
          formData.possui_problemas_musculoesqueleticos,
        ),
        medicacoes: formData.medicacoes,
        motivosDietaEspecial: formData.motivos_dieta_especial,
        doencaOuCondicao: formData.doenca_ou_condicao,
        outrasInformacoesMedicas: formData.outras_informacoes_medicas,
        comoConheceuLegendarios: formData.como_conheceu_legendarios,
        quemConvidou: formData.quem_convidou,
        aceitaTermos,
        tamanhoFarda: tamanho_farda,
        estado: formData.estado.toUpperCase(),
        igrejaPastor: formData.igreja_pastor,
      };

      // se existir inscricao então fazer o update dessa inscricao com os dados do formData
      if (formData?.id) {
        // update da inscricao
        await updateInscricao.mutateAsync({
          ...dataToSave,
          id: formData.id,
          status: "INSCREVENDO",
        });
        handleStepChange("payment");
        return;
      }

      const { id } = await createInscricao.mutateAsync(dataToSave);

      if (linkSecreto) {
        await usarLink.mutateAsync({
          id: linkSecreto.id,
          eventoId: eventRegister.id,
          inscricaoId: id,
        });
      }

      setFormData({ id });

      handleStepChange("payment");
    } catch (error) {
      toast({
        title: "Algo deu errado!",
        description:
          "Confirme os dados nos passos anteriores ou chame o suporte",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoading("initial");
    }
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
        className="flex flex-col gap-8 pt-4"
      >
        <GridTwoColumns title="Escolha o tamanho da sua camisa">
          <Fieldset>
            <Controller
              name="tamanho_farda"
              render={({ field }) => (
                <RadioGroup {...field} onValueChange={field.onChange}>
                  {shirtSizes.map((size) => (
                    <div
                      key={size.value}
                      className="group flex items-center gap-2"
                    >
                      <RadioGroupItem
                        value={size.value}
                        variant="rect"
                        className="w-16"
                        id={size.value}
                      >
                        {size.size}
                      </RadioGroupItem>
                      <Label
                        htmlFor={size.value}
                        className={`text-sm text-muted-foreground ${
                          field.value === size.value
                            ? "font-bold text-foreground"
                            : ""
                        }`}
                      >
                        - {size.description}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          </Fieldset>

          <div>
            <Image
              src={"/farda.png"}
              alt="imagem ilustrativa modelo do uniforme dos Legendários"
              width={600}
              height={600}
              className="h-auto rounded-md object-contain"
              loading="eager"
              blurDataURL="/emptyImg.png"
              placeholder="blur"
            />
          </div>
        </GridTwoColumns>

        <GridTwoColumns title="Termos e Condições" className="md:grid-cols-1">
          <TermAndConditional />
          <div className="flex w-full flex-col gap-2">
            <label
              htmlFor="check-term"
              className="flex cursor-pointer items-center space-x-2"
            >
              <Controller
                name="aceitaTermos"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="check-term"
                    checked={field.value}
                    onCheckedChange={(e) => field.onChange(e)}
                  />
                )}
              />
              <span className="text-sm">Declaro que li e estou de acordo.</span>
            </label>
            <p className="text-sm text-destructive">
              {errors.aceitaTermos?.message}
            </p>
          </div>
        </GridTwoColumns>

        <FormFooterButton
          handleBackStep={() => handleStepChange("health")}
          loading={loading === "loading" || createInscricao.isPending}
        />
      </form>
    </FormProvider>
  );
}
