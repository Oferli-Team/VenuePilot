"use client";

import { zodResolver } from "@hookform/resolvers/zod";

import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "@/trpc/react";
import { Button } from "../ui/button";
import Fieldset from "../Fiedset";
import { useStepsServir } from "@/app/hook/useStepsServir";
import { createZodValidationRadioField } from "@/app/zod-validation/validation";
import { LucidePin, X } from "lucide-react";
import { useCheckTimer } from "@/lib/store/CheckStartTimerStore";
import { useTimerStore } from "@/lib/store/TimerStore";
import { Checkbox } from "../ui/checkbox";
import { TermAndConditional } from "../term-and-conditionals";
import { useRouter, useSearchParams } from "next/navigation";
import { cpfValidationSchema } from "@/app/zod-validation/schemas";
import { useFormStore } from "../participante/useFormStore";
import { getInscricaoByCPF, getLinkSecreto } from "@/lib/queries/client";
import Image from "next/image";
import { checkVagasParticipante } from "@/lib/utils/checkVagasParticipante";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { InitialModalRegister } from "../initial-modal-register-old";
import { unmask } from "remask";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { yesOrNoOptions } from "@/lib/constants";
import { useResetDiscountValues } from "@/lib/hooks/useResetDiscountValues";

const createTypeRegistrationSchema = z.object({
  lgnd_certificado: createZodValidationRadioField(),
  termo: z
    .boolean({ required_error: "Termo precisa ser aceito para continuar." })
    .refine((value) => value === true, {
      message: "Termo precisa ser aceito para continuar.",
    }),
});

type FormData = z.infer<typeof createTypeRegistrationSchema>;
type FormCPFData = z.infer<typeof cpfValidationSchema>;

export default function RegistrationTypeForm() {
  const { participanteStarted } = useCheckTimer();
  const { formData, setFormData, eventRegister } = useFormStore();
  const { handleStepChange } = useStepsServir();
  const { startTimer } = useTimerStore();
  const { resetValues } = useResetDiscountValues();

  const router = useRouter();
  const searchParams = useSearchParams();
  const hasLinkParams = searchParams.has("link");

  const [loading, setLoading] = useState<"initial" | "loading">("loading");
  const [openModal, setOpenModal] = useState(true);
  const [openImage, setOpenImage] = useState(false);
  const [isRegisterClosed, setIsRegisterClosed] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [existInscricao, setExistInscricao] = useState(false);
  const [linkSecretoError, setLinkSecretoError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { data: allServirRegistered } = api.inscricao.getAllServir.useQuery({
    status: "CONFIRMADA",
    eventoId: eventRegister?.id,
  });

  const createForm = useForm<FormData>({
    resolver: zodResolver(createTypeRegistrationSchema),
    defaultValues: {
      lgnd_certificado: formData.lgnd_certificado,
      termo: formData.aceitaTermos,
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
  } = createForm;

  const {
    handleSubmit: handleSubmitCpf,
    formState: { errors: errorsCpf },
    control: controlCpf,
    register: registerCpf,
    watch,
  } = createCpfForm;

  const onSubmit = ({ termo, lgnd_certificado }: FormData) => {
    setFormData({
      aceitaTermos: termo,
      lgnd_certificado,
    });
    handleStepChange("personal");
  };

  const onSubmitStartRegister = async ({
    cpfInitial: cpfinit,
  }: FormCPFData) => {
    setLoading("loading");

    try {
      const cpf = unmask(cpfinit);

      if (!eventRegister) {
        router.push("/404");
        return;
      }

      const data = await getInscricaoByCPF(cpf, eventRegister?.id);

      //mostrar texto de inscrição existente e confirmada
      if (data?.status?.includes("CONFIRMADA")) {
        setIsPaid(true);
        setLoading("initial");
        return;
      }

      // não permitir inscrição para Servir se já tiver registro para Participante
      if (data?.tipoInscricao === "PARTICIPANTE") {
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

  const checkSecretLink = async () => {
    try {
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

      if (data.tipoInscricao !== "SERVIR") {
        setLoading("initial");
        setLinkSecretoError(
          "O link fornecido para as inscrições Legendário é inválido",
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

  useEffect(() => {
    // Atualize o formulário com os dados do Zustand sempre que eles mudarem
    for (const key in formData) {
      setValue(key as keyof FormData, formData[key]);
    }
  }, [formData, setValue]);

  const cpfInital = watch("cpfInitial");

  useEffect(() => {
    if (allServirRegistered && eventRegister) {
      const isSoldOut = checkVagasParticipante(
        allServirRegistered,
        eventRegister.vagasServir,
      );
      setIsRegisterClosed(isSoldOut);
      // Verifica se a inscrição está fechada e não possui link secreto
      if (!hasLinkParams && eventRegister.openServir === false) {
        setIsRegisterClosed(true); // Define o estado como fechado se não houver link secreto e a inscrição estiver fechada
      }
    }
  }, [hasLinkParams, allServirRegistered, eventRegister]);

  return (
    <>
      <FormProvider {...createForm}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid">
          <div className="flex flex-col items-center justify-center">
            <h2 className="mb-8 self-start text-xl font-bold ">
              Legendário, AHU AHU AHU!
            </h2>
            <div className="relative flex w-full flex-col gap-2">
              <Fieldset
                className="relative flex gap-4 p-0"
                isRequired
                legend="Já SERVIU alguma vez? Ou seja, você é LGND certificado?"
                validationMessage={errors.lgnd_certificado}
              >
                <div className="flex items-center gap-6">
                  <Controller
                    name="lgnd_certificado"
                    control={control}
                    rules={{ required: "Escolha uma opção" }}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          resetValues();
                        }}
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
                  <Dialog open={openImage} onOpenChange={setOpenImage}>
                    <DialogTrigger className="font-semibold text-primary">
                      O que é certificação?
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Legendário Certificado</DialogTitle>
                        <DialogDescription>
                          O que determina se você é certificado é ter{" "}
                          <b className="text-primary">Pin Certified TOP</b>.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex items-center justify-center pt-6">
                        <Image
                          src="/pin.png"
                          alt="pin legendário certificado"
                          className="rounded-lg object-cover"
                          width={300}
                          height={300}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Image
                  src="/pin.png"
                  alt="pin legendário certificado"
                  className=" rounded-lg "
                  width={150}
                  height={150}
                />
              </Fieldset>
              <Alert variant="outline" className="w-fit">
                <LucidePin className="h-4 w-4" />
                <AlertTitle>Atenção!</AlertTitle>
                <AlertDescription>
                  Se você possui esse Pin no boné então você é Legendário
                  Certificado.
                </AlertDescription>
              </Alert>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <h2 className="self-start text-xl font-bold ">
                Termos e Condições
              </h2>
              <TermAndConditional />
              <div className="flex w-full flex-col gap-2">
                <label
                  htmlFor="check-term"
                  className="flex cursor-pointer items-center space-x-2"
                >
                  <Controller
                    name="termo"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        {...field}
                        id="check-term"
                        checked={field.value}
                        onCheckedChange={(e) => field.onChange(e)}
                      />
                    )}
                  />
                  <span className="text-sm">
                    Declaro que li e estou de acordo.
                  </span>
                </label>
                <p className="text-sm text-destructive">
                  {errors.termo?.message}
                </p>
              </div>
            </div>

            <div className="mt-12 flex w-full justify-end">
              <Button type="submit">Continuar</Button>
            </div>
          </div>
        </form>
      </FormProvider>

      <InitialModalRegister
        type="servir"
        title="INSCRIÇÃO PARA LEGENDÁRIO"
        openModal={openModal}
        isLoading={loading === "loading"}
        isPaid={isPaid}
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
