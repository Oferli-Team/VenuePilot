"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  biotipoOptions,
  howKnowLegendsOptions,
  URL_CEP_API,
  vinculoOptions,
  yesOrNoOptions,
} from "@/lib/constants";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { mask, unmask } from "remask";
import { type z } from "zod";
import Fieldset from "../Fiedset";
import { api } from "@/trpc/react";
import { useStepsRegister } from "@/app/hook/useStepsRegister";
import { Input } from "../ui/input";
import { formatDateToYYYYMMDD } from "@/lib/utils/formatDateToYYYYMMDD";
import {
  cpfValidationSchema,
  createDadosPessoaisSchema,
} from "@/app/zod-validation/schemas";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/selects";
import { rewriteWifeVinculo } from "@/lib/utils/rewriteVinculoType";
import { useCheckTimer } from "@/lib/store/CheckStartTimerStore";
import { useTimerStore } from "@/lib/store/TimerStore";
import { maritalStatusOptions } from "@/app/zod-validation/validation";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "../ui/use-toast";
import { useFormStore } from "./useFormStore";
import { convertDateToDDMMYYYY } from "@/lib/utils/convertToDDMMYYYY";
import { type Loading } from "@/lib/types";
import { getInscricaoByCPF, getLinkSecreto } from "@/lib/queries/client";
import { updateVinculoType } from "@/lib/utils/updateVinculoType";
import { GridTwoColumns } from "../grid-two-columns";
import { GridThreeColumns } from "../grid-three-column";
import { FormFooterButton } from "../form-footer-buttons";
import { checkVagasParticipante } from "@/lib/utils/checkVagasParticipante";
import { InitialModalRegister } from "../initial-modal-register-old";
import { InputPhone } from "../ui/input-phone";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type FormData = z.infer<typeof createDadosPessoaisSchema>;
type FormCPFData = z.infer<typeof cpfValidationSchema>;

export default function DadosPessoais() {
  const [loading, setLoading] = useState<Loading>("loading");
  const [openModal, setOpenModal] = useState(true);
  const [existInscricao, setExistInscricao] = useState(false);
  const [errorCep, setErrorCep] = useState("");
  const [vinculoType, setVinculoType] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [warningWeight, setWarningWeight] = useState("");
  const [isRegisterClosed, setIsRegisterClosed] = useState(false);
  const [showConfirmMessage, setShowConfirmMessage] = useState(false);

  const [linkSecretoError, setLinkSecretoError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Hook do Zustand
  const { formData, setFormData, eventRegister } = useFormStore();
  const { handleStepChange } = useStepsRegister();
  const { participanteStarted } = useCheckTimer();
  const { startTimer, isRunning } = useTimerStore();

  const router = useRouter();
  const searchParams = useSearchParams();
  const hasLinkParams = searchParams.has("link");

  const { data: allParticipantes } = api.inscricao.getAllParticipantes.useQuery(
    {
      status: "CONFIRMADA",
      eventoId: eventRegister?.id,
    },
    { enabled: !!eventRegister?.id },
  );

  const createForm = useForm<FormData>({
    resolver: zodResolver(createDadosPessoaisSchema),
    defaultValues: {
      ...formData,
      pais: "Brasil",
    },
  });

  const createCpfForm = useForm<FormCPFData>({
    resolver: zodResolver(cpfValidationSchema),
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    register,
    getValues,
    watch,
  } = createForm;

  const {
    handleSubmit: handleSubmitCpf,
    formState: { errors: errorsCpf },
    control: controlCpf,
    register: registerCpf,
    watch: watchCPF,
  } = createCpfForm;

  const calcIMC = (weigh: number, height: number) => {
    const newIMC = weigh / ((height / 100) * (height / 100));
    return Number(newIMC.toFixed(8));
  };

  const onSubmit = async (data: FormData) => {
    const bornDateYYYYMMDD = formatDateToYYYYMMDD(data.data_nascimento);

    const peso = Number(data.peso);
    const altura = Number(unmask(data.altura));
    const imc = calcIMC(peso, altura);
    const cep = unmask(data.cep);
    const cpf = unmask(data.cpf);

    try {
      setFormData({
        ...data,
        cpf,
        data_nascimento: bornDateYYYYMMDD,
        peso: peso.toString(),
        altura: altura.toString(),
        imc,
        cep,
      });

      handleStepChange("health");
    } catch (error) {
      console.log({ error });
    }
  };
  const onSubmitStartRegister = async ({ cpfInitial }: FormCPFData) => {
    try {
      setLoading("loading");

      const cpf = unmask(cpfInitial);

      const data = await getInscricaoByCPF(cpf, eventRegister.id);

      //mostrar texto de inscrição existente e confirmada
      if (data?.status?.includes("CONFIRMADA")) {
        setShowConfirmMessage(true); // setRegistedConfirm
        setLoading("initial");
        return;
      }

      // não permitir inscrição para Participar se já tiver registro para Servir
      if (data?.tipoInscricao === "SERVIR") {
        setExistInscricao(true);
        return;
      }

      if (data?.id && data.cpf === cpf) {
        setFormData({
          id: data.id,
        });
      }

      setFormData({
        cpf,
      });

      setOpenModal(false);
      participanteStarted();
      startTimer();
      setLoading("initial");
    } catch (error) {
      console.error(error);
    }
  };

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

  // Sincronize o react-hook-form com o Zustand
  useEffect(() => {
    // Atualize o formulário com os dados do Zustand sempre que eles mudarem
    for (const key in formData) {
      setValue(key as keyof FormData, formData[key]);

      if (formData.data_nascimento) {
        setValue(
          "data_nascimento",
          convertDateToDDMMYYYY(formData.data_nascimento).replaceAll("-", ""),
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

  const cpfInital = watchCPF("cpfInitial");

  useEffect(() => {
    const tem_filhos = getValues("tem_filhos");
    if (tem_filhos === "true") setHasChildren(true);
  }, []);

  useEffect(() => {
    if (allParticipantes && eventRegister) {
      const isSoldOut = checkVagasParticipante(
        allParticipantes,
        eventRegister.vagasParticipar,
      );
      setIsRegisterClosed(isSoldOut);
      // Verifica se a inscrição está fechada e não possui link secreto
      if (!hasLinkParams && eventRegister.openParticipar === false) {
        setIsRegisterClosed(true); // Define o estado como fechado se não houver link secreto e a inscrição estiver fechada
      }
    }
  }, [allParticipantes, eventRegister]);

  const checkSecretLink = async () => {
    try {
      setLoading("loading");
      if (!hasLinkParams) {
        setLoading("initial");
        return;
      }

      if (!eventRegister) {
        return;
      }

      const link = searchParams.get("link");

      if (!link) {
        setLoading("initial");
        setLinkSecretoError("Link não encontrado");
        return;
      }

      const data = await getLinkSecreto(link, eventRegister.id);

      if (!data) {
        setLoading("initial");
        setLinkSecretoError("Link inválido");
        return;
      }

      if (!data.ativo) {
        setLoading("initial");
        setLinkSecretoError("Link inválido");
        return;
      }

      if (data.tipoInscricao !== "PARTICIPANTE") {
        setLoading("initial");
        setLinkSecretoError(
          "O link fornecido para as inscrições Participante é inválido",
        );
        return;
      }

      const secretLinkIsValid = data.quantidade > data.usadoCount;

      if (!secretLinkIsValid) {
        setLoading("initial");
        setLinkSecretoError("Link expirado");
      }

      setLoading("initial");
    } catch (error) {
      console.log(error);
    }
  };

  const handleAgreeWithTerms = () => {
    setTermsAccepted(true);
  };

  useEffect(() => {
    if (!eventRegister) {
      return;
    }

    void checkSecretLink();
  }, [hasLinkParams, eventRegister]);

  const howKnowLegendsIsOther =
    watch("como_conheceu_legendarios") ===
    howKnowLegendsOptions.find((opt) => opt.value === "outros")?.value;

  const hasChildren = watch("tem_filhos");

  return (
    <>
      <FormProvider {...createForm}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 pt-4"
        >
          <GridTwoColumns title="Dados Pessoais do Participante">
            <Fieldset isRequired legend="CPF">
              <Controller
                name="cpf"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    value={mask(field.value, "999.999.999-99")}
                    disabled
                  />
                )}
              />
            </Fieldset>
            <Fieldset
              isRequired
              legend="Nome Completo"
              validationMessage={errors.nome}
            >
              <Input {...register("nome")} />
            </Fieldset>
            <Fieldset
              isRequired
              legend="Email"
              validationMessage={errors.email}
            >
              <Input {...register("email")} type="email" />
            </Fieldset>
            <Fieldset
              isRequired
              legend="Celular"
              validationMessage={errors.celular}
            >
              <Controller
                control={control}
                name="celular"
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
          </GridTwoColumns>

          <GridThreeColumns>
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
                  >
                    <SelectTrigger ref={field.ref}>
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

            <div className="flex gap-4">
              <Fieldset
                isRequired
                legend="Tem filhos?"
                validationMessage={errors.tem_filhos}
              >
                <Controller
                  name="tem_filhos"
                  control={control}
                  defaultValue="false"
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
                          id={item.value}
                        >
                          {item.label}
                        </RadioGroupItem>
                      ))}
                    </RadioGroup>
                  )}
                />
              </Fieldset>

              {hasChildren === "true" && (
                <Fieldset
                  legend="Quantidade de filhos"
                  validationMessage={errors.qtd_filhos}
                >
                  <Controller
                    name="qtd_filhos"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={field.value ? mask(field.value, "99") : ""}
                        placeholder="Digite apenas números"
                        type="tel"
                        inputSize="sm"
                      />
                    )}
                  />
                </Fieldset>
              )}
            </div>

            <Fieldset
              isRequired
              legend="Peso (n° inteiro)"
              validationMessage={errors.peso}
            >
              <Controller
                name="peso"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    value={mask(field.value, "999")}
                    placeholder="80"
                    type="tel"
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      field.onChange(inputValue);
                      const weight = Number(inputValue);

                      if (weight >= 100) {
                        setWarningWeight(
                          "Você pode continuar com sua inscrição, porém recomendamos a realização de um exame médico cardiológico, pois as atividades no TOP requerem aptidão física",
                        );
                      } else {
                        setWarningWeight("");
                      }
                    }}
                  />
                )}
              />

              {warningWeight && (
                <span className="text-xs text-orange-500">{warningWeight}</span>
              )}
            </Fieldset>
            <Fieldset
              isRequired
              legend="Altura"
              validationMessage={errors.altura}
            >
              <Controller
                name="altura"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    value={mask(field.value, "9.99")}
                    placeholder="1.80"
                    type="tel"
                  />
                )}
              />
            </Fieldset>

            <Fieldset
              isRequired
              legend="Biotipo"
              validationMessage={errors.biotipo}
            >
              <Controller
                name="biotipo"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                    name="biotipo"
                  >
                    <SelectTrigger ref={field.ref}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {biotipoOptions.map((option, i) => (
                          <SelectItem
                            key={`${option.value} - ${i}`}
                            value={option.value}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </Fieldset>
          </GridThreeColumns>

          <GridTwoColumns title="Informe o Nome e Whatsapp para contato com sua esposa, noiva, namorada, mãe ou irmã.">
            <Fieldset
              isRequired
              legend="Nome"
              validationMessage={errors.nome_contato_cartas}
            >
              <Input {...register("nome_contato_cartas")} />
            </Fieldset>
            <Fieldset
              isRequired
              legend="Celular (Whatsapp)"
              validationMessage={errors.celular_contato_cartas}
            >
              <Controller
                name="celular_contato_cartas"
                control={control}
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
                      setVinculoType(value);
                      field.onChange(value);
                    }}
                    value={field.value}
                    name="tipo_vinculo_contato_emergencia"
                  >
                    <SelectTrigger ref={field.ref}>
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
                          setErrorCep(
                            "Não foi possível buscar o CEP informado",
                          );
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
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                    maxLength={2}
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
              legend="Bairro"
              validationMessage={errors.bairro}
            >
              <Input {...register("bairro")} />
            </Fieldset>
            <Fieldset
              isRequired
              legend="Número"
              validationMessage={errors.rua_numero}
            >
              <Input {...register("rua_numero")} />
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
              legend="Nome da sua igreja/comunidade?"
              validationMessage={errors.igreja}
              isRequired
            >
              <Input {...register("igreja")} placeholder="Igreja..." />
            </Fieldset>

            <Fieldset
              isRequired
              validationMessage={errors.igreja_pastor}
              legend="Nome do seu pastor/padre/lider?"
            >
              <Input {...register("igreja_pastor")} placeholder="Pr ..." />
            </Fieldset>

            <Fieldset
              validationMessage={errors.como_conheceu_legendarios}
              legend="Como soube dos Legendários?"
              isRequired
            >
              <Controller
                control={control}
                name="como_conheceu_legendarios"
                defaultValue="outros"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-wrap items-center gap-4"
                  >
                    {howKnowLegendsOptions.map((option) => (
                      <RadioGroupItem
                        ref={field.ref}
                        key={option.value}
                        value={option.value}
                        variant="rect"
                      >
                        {option.label}
                      </RadioGroupItem>
                    ))}
                  </RadioGroup>
                )}
              />

              {howKnowLegendsIsOther && (
                <Input
                  {...register("quem_convidou")}
                  placeholder="Soube através..."
                />
              )}
            </Fieldset>
          </GridTwoColumns>

          <FormFooterButton
            handleBackStep={() => router.back()}
            loading={loading === "loading"}
            onClick={checkSelectsInput}
          />
        </form>
      </FormProvider>

      <InitialModalRegister
        type="participante"
        title="INSCRIÇÃO PARA PARTICIPANTE"
        openModal={openModal}
        isLoading={loading === "loading"}
        isPaid={showConfirmMessage}
        onSubmit={handleSubmitCpf(onSubmitStartRegister)}
        useForm={createCpfForm}
        existInscricao={existInscricao}
        isRegisterClosed={isRegisterClosed}
        termsAccepted={termsAccepted}
        hasLinkParams={hasLinkParams}
        linkSecretoError={linkSecretoError}
        errors={errorsCpf}
        control={controlCpf}
        register={registerCpf}
        cpfInitial={cpfInital}
        handleAgreeWithTerms={handleAgreeWithTerms}
      />
    </>
  );
}
