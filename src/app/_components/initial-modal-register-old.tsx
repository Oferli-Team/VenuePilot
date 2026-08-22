import { X } from "lucide-react";
import { Modal } from "./Modal";
import { CardContent, CardHeader, CardTitle } from "./ui/card";
import { Spinner } from "./ui/spinner";
import { createWhatsappLink } from "@/lib/whatsapp";
import { ITOP } from "@/lib/constants";
import { InscricoesEncerradas } from "./inscricoes-encerradas-old";
import {
  type Control,
  type UseFormRegister,
  type FieldErrors,
  type UseFormReturn,
  Controller,
  FormProvider,
} from "react-hook-form";
import Fieldset from "./Fiedset";
import { Input } from "./ui/input";
import { mask, unmask } from "remask";
import { Button } from "./ui/button";
import { useState, type FormEventHandler } from "react";

import { Alert, AlertDescription } from "./ui/alert";
import { maskCPF } from "@/lib/utils/maskCPF";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormStore } from "./participante/useFormStore";
import { useTimerStore } from "@/lib/store/TimerStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-modal";
import { LinkSecretoErrorMessage } from "./link-secreto-error-message-old";

interface InitialModalRegisterProps {
  type: "participante" | "servir";
  title: string;
  openModal: boolean;
  isLoading: boolean;
  isPaid: boolean;
  onSubmit: FormEventHandler<HTMLFormElement> | undefined;
  useForm: UseFormReturn<
    {
      cpfInitial: string;
    },
    any,
    undefined
  >;
  existInscricao: boolean;
  isRegisterClosed: boolean;
  termsAccepted: boolean;
  hasLinkParams: boolean;
  linkSecretoError: string;
  errors: FieldErrors<{
    cpfInitial: string;
  }>;
  control: Control<
    {
      cpfInitial: string;
    },
    any
  >;
  register: UseFormRegister<{
    cpfInitial: string;
  }>;
  cpfInitial: string;
  handleAgreeWithTerms: () => void;
}

export const InitialModalRegister = ({
  type,
  title,
  openModal,
  isLoading,
  isPaid,
  onSubmit,
  useForm,
  existInscricao,
  isRegisterClosed,
  termsAccepted,
  hasLinkParams,
  linkSecretoError,
  errors,
  control,
  register,
  cpfInitial,
  handleAgreeWithTerms,
}: InitialModalRegisterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const secretLinkName = searchParams.get("link");

  const { eventRegister } = useFormStore();
  const { isRunning } = useTimerStore();

  const [secretLinkIsCorrect, setSecretLinkIsCorrect] = useState(false);

  if (isLoading) {
    <div className="fixed bottom-0 left-0 right-0 top-0 z-[500] flex items-center justify-center bg-black opacity-85">
      <Spinner size={40} />
    </div>;
  }

  if (!secretLinkIsCorrect && secretLinkName) {
    return (
      <AlertDialog open={!secretLinkIsCorrect}>
        <AlertDialogTrigger asChild>
          <Button variant="outline">Show Dialog</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground">
              Você está usando um link exclusivo{" "}
              <strong>
                {secretLinkName?.replaceAll("-", " ").toUpperCase()}
              </strong>
              , tem certeza que pode utilizar este link?
            </AlertDialogDescription>

            <div className="mt-4 rounded-md bg-card/60 p-2 text-xs">
              <p className="">
                O uso indevido do link exclusivo sem permissão, pode acarretar
                no cancelamento da inscrição com multa.
              </p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => router.back()}>
              Não
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => setSecretLinkIsCorrect(true)}>
              Sim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <>
      {isLoading && !cpfInitial ? (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-[500] flex items-center justify-center bg-black opacity-85">
          <Spinner size={40} />
        </div>
      ) : (
        <>
          <Modal
            isOpen={openModal && !isRunning && !linkSecretoError}
            btnClose={<X className="h-4 w-4" />}
          >
            <CardContent className="flex flex-col items-center">
              <CardHeader className="px-2 leading-7">
                <CardTitle className="text-center text-base">{title}</CardTitle>
              </CardHeader>

              {existInscricao ? (
                <div className="leading-6">
                  <p>O CPF já possui uma inscrição. Precisa de ajuda?</p>
                  <p>
                    Clique aqui para falar com nosso{" "}
                    <a
                      target="_blank"
                      href={createWhatsappLink({
                        phone: ITOP.whatsapp_suporte,
                        text: `Preciso de ajuda para fazer minha inscrição.`,
                      })}
                      className="text-primary underline"
                    >
                      <strong>SUPORTE</strong>.
                    </a>
                  </p>
                </div>
              ) : (
                <>
                  {
                    isRegisterClosed && !hasLinkParams ? (
                      <InscricoesEncerradas type={type} />
                    ) : (
                      <FormProvider {...useForm}>
                        <form
                          className="w-full text-center"
                          onSubmit={onSubmit}
                        >
                          <Fieldset
                            legend={`Informe o CPF do ${type === "servir" ? "Legendário" : "Participante"}`}
                            isRequired
                            validationMessage={errors.cpfInitial}
                            className="mt-0 self-center p-0"
                          >
                            <Controller
                              name="cpfInitial"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  className="w-full max-w-64 self-center"
                                  placeholder="000.000.000-00"
                                  {...register("cpfInitial")}
                                  {...field}
                                  value={
                                    mask(field.value, "999.999.999-99") ?? ""
                                  }
                                  type="tel"
                                />
                              )}
                            />
                          </Fieldset>

                          <Button
                            className="mt-3"
                            loading={isLoading}
                            type="submit"
                          >
                            INICIAR
                          </Button>

                          <div
                            className={`transform-all my-6  rounded-md bg-success/10 px-2 py-3 font-semibold duration-150 ${!isPaid && "my-0 h-0 scale-0 opacity-0"}`}
                          >
                            <p
                              className={`mb-2 text-sm text-success md:text-base`}
                            >
                              {isPaid &&
                                `O CPF ${maskCPF(unmask(cpfInitial))} já possui uma inscrição concluída.`}
                            </p>
                            <Button
                              type="button"
                              variant="blue"
                              onClick={() =>
                                router.push(
                                  `/ticket/${eventRegister?.id}/${unmask(cpfInitial)}`,
                                )
                              }
                            >
                              Abrir Ticket
                            </Button>
                          </div>

                          <Alert variant="destructive">
                            <AlertDescription>
                              Atenção, o tempo para fazer a inscrição é de{" "}
                              <b className="text-primary">20 minutos</b>.
                            </AlertDescription>
                          </Alert>
                        </form>
                      </FormProvider>
                    )
                    // : (
                    //   <div className="mb-4 text-start">
                    //     {ITOP.register_politic.map((item) => (
                    //       <ul key={item.title} className="py-2">
                    //         <p className="text-sm font-semibold">{item.title}</p>
                    //         {item.roles.map((role, i) => (
                    //           <li className="pt-1 text-sm" key={i}>
                    //             {role}
                    //           </li>
                    //         ))}
                    //       </ul>
                    //     ))}

                    //     <p className="mt-4 text-xs font-semibold sm:text-base">
                    //       Prossiga com a inscrição clicando que aceita com os
                    //       termos acima.
                    //     </p>
                    //     <Button
                    //       variant="blue"
                    //       className="mt-6 flex justify-self-end"
                    //       onClick={handleAgreeWithTerms}
                    //     >
                    //       Aceitar e continuar
                    //     </Button>
                    //   </div>
                    // )
                  }
                </>
              )}
            </CardContent>
          </Modal>

          <LinkSecretoErrorMessage linkSecretoError={linkSecretoError} />
        </>
      )}
    </>
  );
};
