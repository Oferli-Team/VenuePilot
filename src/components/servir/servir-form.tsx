"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  URL_CEP_API,
  stringToBoolean,
  vinculoOptions,
  yesOrNoOptions,
} from "@/lib/constants";
import { type Loading } from "@/lib/types";
import { useState, useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { mask, unmask } from "remask";
import { type z } from "zod";
import Fieldset from "../Fiedset";
import { api } from "@/trpc/react";
import { add } from "date-fns";
import { Input } from "../ui/input";
import { useStepsServir } from "@/app/hook/useStepsServir";
import { formatDateToYYYYMMDD } from "@/lib/utils/formatDateToYYYYMMDD";
import { createServirSchema } from "@/app/zod-validation/schemas";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/selects";
import { rewriteWifeVinculo } from "@/lib/utils/rewriteVinculoType";
import { maritalStatusOptions } from "@/app/zod-validation/validation";
import { useFormStore } from "../participante/useFormStore";
import { convertDateToDDMMYYYY } from "@/lib/utils/convertToDDMMYYYY";
import { toast } from "../ui/use-toast";
import { updateVinculoType } from "@/lib/utils/updateVinculoType";
import { ToastAction } from "../ui/toast";
import Link from "next/link";
import { GridTwoColumns } from "../grid-two-columns";
import { GridThreeColumns } from "../grid-three-column";
import { FormFooterButton } from "../form-footer-buttons";
import { useSearchParams } from "next/navigation";
import { type LinkSecreto } from "@prisma/client";
import { getLinkSecreto } from "@/lib/queries/client";
import { InputPhone } from "../ui/input-phone";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type FormData = z.infer<typeof createServirSchema>;

export default function ServirForm() {
  const searchParams = useSearchParams();
  const hasLinkParams = searchParams.has("link");

  const [loading, setLoading] = useState<Loading>("initial");
  const [errorCep, setErrorCep] = useState("");
  const [vinculoType, setVinculoType] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");

  const { handleStepChange } = useStepsServir();
  const { formData, setFormData, eventRegister } = useFormStore();

  const createForm = useForm<FormData>({
    resolver: zodResolver(createServirSchema),
    defaultValues: {
      ...formData,
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    register,
  } = createForm;

  const updateInscricao = api.inscricao.updateInscricaoLgnd.useMutation();
  const createInscricaoLgnd = api.inscricao.createInscricaoLgnd.useMutation();
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

  const onSubmit = async (data: FormData) => {
    setLoading("loading");

    if (!eventRegister) {
      toast({
        title: "Ops, não encontramos o evento",
        action: (
          <ToastAction altText="Tente novamente">
            <Link href="/">Tente novamente</Link>
          </ToastAction>
        ),
      });
      return;
    }

    const bornDateYYYYMMDD = formatDateToYYYYMMDD(data.data_nascimento);
    const force_mid_day = add(bornDateYYYYMMDD, { hours: 12 }); // add 12pm

    const cpf = unmask(data.cpf);
    const cep = unmask(data.cep);
    const lgnd_certificado = stringToBoolean(formData.lgnd_certificado);

    setFormData({
      ...data,
      data_nascimento: bornDateYYYYMMDD,
      cpf,
      estado_civil: data.estado_civil,
      cep,
      tipo_vinculo_contato_emergencia: data.tipo_vinculo_contato_emergencia,
      celular_contato_emergencia: data.celular_contato_emergencia ?? "",
      pais: data.pais,
    });

    // Atualizando formData com os novos valores
    const dataToSave = {
      eventoId: eventRegister.id,
      nrLgnd: data?.nrLgnd ?? "",
      nome: data?.nome ?? "",
      cpf,
      celular: data.celular ?? "",
      email: data?.email ?? "",
      dataNascimento: force_mid_day ?? "",
      estadoCivil: data?.estado_civil ?? "",
      cep: cep ?? "",
      pais: data.pais ?? "",
      estado: data?.estado.toUpperCase() ?? "",
      cidade: data?.cidade ?? "",
      rua: data?.rua ?? "",
      bairro: data?.bairro ?? "",
      ruaNumero: data?.rua_numero ?? "",
      igreja: data?.igreja ?? "",
      igrejaPastor: data.orientador_espiritual,
      nomeContatoEmergencia: data?.nome_contato_emergencia ?? "",
      celularContatoEmergencia: data.celular_contato_emergencia ?? "",
      tipoVinculoContatoEmergencia: data?.tipo_vinculo_contato_emergencia ?? "",
      possuiAutorizacaoServir: stringToBoolean(data?.possui_autorizacao_servir),
      aceitaTermos: formData.aceitaTermos,
      lgndCertificado: lgnd_certificado,
    };

    try {
      if (formData.id) {
        await updateInscricao.mutateAsync({
          ...dataToSave,
          id: formData.id,
          status: "INSCREVENDO",
        });
        handleStepChange("payment");
        return;
      }

      const linkSecreto = await checkSecretLink();
      const { id } = await createInscricaoLgnd.mutateAsync({
        ...dataToSave,
        status: "INSCREVENDO",
      });

      setFormData({
        id,
      });

      if (linkSecreto) {
        await usarLink.mutateAsync({
          id: linkSecreto.id,
          eventoId: eventRegister.id,
          inscricaoId: id,
        });
      }

      handleStepChange("payment");
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading("initial");
    }
  };

  useEffect(() => {
    // Atualize o formulário com os dados do Zustand sempre que eles mudarem
    for (const key in formData) {
      setValue(key as keyof FormData, formData[key]);
      if (formData.data_nascimento) {
        setValue(
          "data_nascimento",
          convertDateToDDMMYYYY(formData.data_nascimento),
        );
      }
    }
    setMaritalStatus(formData.estado_civil);
    setTimeout(() => {
      setVinculoType(formData.tipo_vinculo_contato_emergencia);
      setValue(
        "tipo_vinculo_contato_emergencia",
        formData.tipo_vinculo_contato_emergencia,
      );
    }, 1000);
  }, [formData, setValue]);

  function showToast(message: string) {
    toast({
      title: message,
      variant: "destructive",
    });
  }

  const checkSelectsInput = () => {
    if (!maritalStatusOptions.includes(maritalStatus)) {
      showToast("Verifique o campo Estado Civil");
      return;
    }

    if (!vinculoOptions.map((option) => option.label).includes(vinculoType)) {
      showToast("Verifique o campo Vínculo do contato de emergência");
      return;
    }
  };

  useEffect(() => {
    updateVinculoType(maritalStatus, setValue, setVinculoType);
  }, [maritalStatus]);

  return (
    <FormProvider {...createForm}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 pt-4"
      >
        <GridTwoColumns title="Dados do Legendário">
          <Fieldset
            isRequired
            legend="Número LGND"
            validationMessage={errors.nrLgnd}
          >
            <Input {...register("nrLgnd")} />
          </Fieldset>
          <Fieldset isRequired legend="CPF">
            <Controller
              name="cpf"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  name="cpf"
                  value={mask(field.value, "999.999.999-99")}
                  disabled
                />
              )}
            />
          </Fieldset>
          <Fieldset isRequired legend="Nome" validationMessage={errors.nome}>
            <Input {...register("nome")} />
          </Fieldset>
          <Fieldset isRequired legend="Email" validationMessage={errors.email}>
            <Input {...register("email")} type="email" />
          </Fieldset>
          <Fieldset
            isRequired
            legend="Celular"
            validationMessage={errors.celular}
          >
            <Controller
              name="celular"
              control={control}
              render={({ field }) => (
                <InputPhone
                  {...field}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  disableDialCodeAndPrefix
                  showDisabledDialCodeAndPrefix
                />
              )}
            />
          </Fieldset>
          <Fieldset
            isRequired
            legend="Data de nascimento"
            validationMessage={errors.data_nascimento}
          >
            <Controller
              control={control}
              name="data_nascimento"
              render={({ field }) => (
                <Input
                  {...field}
                  value={mask(field.value, "99/99/9999")}
                  placeholder="dd/mm/aaaa"
                  maxLength={10}
                />
              )}
            />
          </Fieldset>
          <Fieldset
            isRequired
            legend="Estado civil"
            validationMessage={errors.estado_civil}
          >
            <Controller
              name="estado_civil"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    setMaritalStatus(value);
                    field.onChange(value);
                  }}
                  value={field.value}
                  name="estado_civil"
                >
                  <SelectTrigger ref={field.ref} name="estado_civil">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {maritalStatusOptions.map((option, i) => (
                        <SelectItem key={`${option} - ${i}`} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </Fieldset>
        </GridTwoColumns>

        <GridThreeColumns title="Contato de emergência">
          <Fieldset
            isRequired
            legend="Vínculo"
            validationMessage={errors.tipo_vinculo_contato_emergencia}
          >
            <Controller
              name="tipo_vinculo_contato_emergencia"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setVinculoType(value);
                  }}
                  value={field.value}
                  name="tipo_vinculo_contato_emergencia"
                >
                  <SelectTrigger
                    ref={field.ref}
                    name="tipo_vinculo_contato_emergencia"
                  >
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {vinculoOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </Fieldset>
          <Fieldset
            isRequired
            legend={`Nome ${rewriteWifeVinculo(vinculoType)}`}
            validationMessage={errors.nome_contato_emergencia}
          >
            <Input {...register("nome_contato_emergencia")} />
          </Fieldset>
          <Fieldset
            isRequired
            legend={`Celular ${rewriteWifeVinculo(vinculoType)}`}
            validationMessage={errors.celular_contato_emergencia}
          >
            <Controller
              control={control}
              name="celular_contato_emergencia"
              render={({ field }) => (
                <InputPhone
                  {...field}
                  value={field.value}
                  onChange={field.onChange}
                  disableDialCodeAndPrefix
                  showDisabledDialCodeAndPrefix
                />
              )}
            />
          </Fieldset>
        </GridThreeColumns>

        <GridThreeColumns title="Endereço">
          <Fieldset isRequired legend="País" validationMessage={errors.pais}>
            <Input {...register("pais")} />
          </Fieldset>
          <Fieldset isRequired legend="CEP" validationMessage={errors.cep}>
            <Controller
              control={control}
              name="cep"
              render={({ field }) => (
                <Input
                  {...field}
                  type="tel"
                  onChange={async (e) => {
                    const value = e.target.value;
                    const masked = mask(value, "99999-999");
                    const isValid = masked.replace("-", "").length === 8;

                    field.onChange(masked);
                    if (isValid) {
                      try {
                        const response = await fetch(
                          `${URL_CEP_API}${value}/json/`,
                        );
                        const { logradouro, bairro, localidade, uf } =
                          (await response.json()) as {
                            logradouro: string;
                            bairro: string;
                            localidade: string;
                            uf: string;
                          };
                        setValue("rua", logradouro);
                        setValue("bairro", bairro);
                        setValue("cidade", localidade);
                        setValue("estado", uf);
                      } catch (error) {
                        setErrorCep("Não foi possível buscar o CEP informado");
                      }
                    }
                  }}
                  value={field.value || ""}
                />
              )}
            />
          </Fieldset>
          <Fieldset
            isRequired
            legend="Estado"
            validationMessage={errors.estado}
          >
            <Controller
              name="estado"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  maxLength={2}
                  name="estado"
                />
              )}
            />
          </Fieldset>
          <Fieldset
            isRequired
            legend="Cidade"
            validationMessage={errors.cidade}
          >
            <Input {...register("cidade")} />
          </Fieldset>
          <Fieldset isRequired legend="Rua" validationMessage={errors.rua}>
            <Input {...register("rua")} />
          </Fieldset>
          <Fieldset
            isRequired
            legend="Número"
            validationMessage={errors.rua_numero}
          >
            <Input {...register("rua_numero")} />
          </Fieldset>
          <Fieldset
            isRequired
            legend="Bairro"
            validationMessage={errors.bairro}
          >
            <Input {...register("bairro")} />
          </Fieldset>
          <Fieldset
            legend="Complemento"
            validationMessage={errors.rua_complemento}
          >
            <Input {...register("rua_complemento")} />
          </Fieldset>
        </GridThreeColumns>

        <GridTwoColumns title="Religião">
          <Fieldset
            legend="Qual a sua igreja/comunidade?"
            isRequired
            validationMessage={errors.igreja}
          >
            <Input {...register("igreja")} />
          </Fieldset>

          <Fieldset
            legend="Nome do seu Pastor/Padre/Orientador Espiritual"
            isRequired
            validationMessage={errors.orientador_espiritual}
          >
            <div className="mb-2 flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-0">
              <Controller
                control={control}
                name="orientador_espiritual"
                render={({ field }) => (
                  <Input {...field} value={field.value ?? ""} />
                )}
              />
            </div>
          </Fieldset>
          <Fieldset
            isRequired
            legend="Possuí autorização do seu coordenador para participar deste TOP?"
            validationMessage={errors.possui_autorizacao_servir}
          >
            <div className="flex items-center">
              <Controller
                name="possui_autorizacao_servir"
                control={control}
                rules={{ required: "Escolha uma opção" }}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex items-center gap-4"
                  >
                    {yesOrNoOptions.map((item) => (
                      <RadioGroupItem
                        ref={field.ref}
                        key={item.value}
                        value={item.value}
                        variant="rect"
                      >
                        {item.label}
                      </RadioGroupItem>
                    ))}
                  </RadioGroup>
                )}
              />
            </div>
          </Fieldset>
        </GridTwoColumns>

        <FormFooterButton
          handleBackStep={() => handleStepChange("registrationType")}
          loading={loading === "loading"}
          onClick={checkSelectsInput}
        />
      </form>
    </FormProvider>
  );
}
