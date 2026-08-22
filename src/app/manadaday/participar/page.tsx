"use client";

import React, { useEffect } from "react";
import { api } from "@/trpc/react";
import { type z } from "zod";
import Image from "next/image";
import { MANADA_DAY } from "./constant";
import { FormProvider, useForm } from "react-hook-form";
import { participantSchema } from "../_components/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { creditCardSchemaNew } from "@/app/zod-validation/schemas";
import { validateCreditCard } from "@/app/zod-validation/validation";
import { type AsaasPaymentResponse } from "@/appTypes/asaas";
import { useTickets } from "../_components/stores/ticket-store";
import { usePixChargeStore } from "@/lib/store/PixChargeStore";
import { useCalcValueTopStore } from "@/lib/store/CalcValueTopStore";
import { useIsMobile } from "@/lib/hooks/ismobile";
import { useFormStore } from "@/app/_components/participante/useFormStore";
import { useRouter } from "next/navigation";
import { useManadaDayFormData } from "../_components/stores/payer-data";
import { usePaymentHandlers } from "../_components/hooks/usePaymentHandlers";
import { toast } from "@/app/_components/ui/use-toast";
import { Section } from "@/app/_components/ui/section";
import { IconText } from "@/app/_components/ui/icon-text";
import { TicketOptionsManadaDay } from "../_components/ticket-options";
import { EventDetail } from "../_components/event-detail";
import { EventDetailImage } from "../_components/event-detail-image";
import { Calendar, MapPin } from "lucide-react";
import { RegisterTabs } from "../_components/register-tabs";
import { usePaymentMonitor } from "../_components/hooks/usePaymentMonitor";

const payByCreditCardSchema = participantSchema
  .merge(creditCardSchemaNew)
  .refine(
    (data) => {
      const errors = validateCreditCard(data);
      return errors.length === 0;
    },
    {
      message: "Dados do cartão inválidos",
      path: ["cc_installment"],
    },
  )
  .superRefine((data, ctx) => {
    if (data.isLegendary) {
      if (!data.legendaryNumber) {
        ctx.addIssue({
          code: "custom",
          message: "Informe Número Legendário",
          path: ["legendaryNumber"],
        });
      }
    }
  });

type Method = "pix" | "creditCard" | "free";
type CreditCardFormData = z.infer<typeof payByCreditCardSchema>;
type FormData = z.infer<typeof participantSchema>;

export default function ManadaDayRegisterPage() {
  const router = useRouter();

  const { titulo, subtitulo, periodo, local, banner } = MANADA_DAY;

  const [creditCardCharge, setCreditCardCharge] =
    React.useState<AsaasPaymentResponse | null>(null);

  const { startRegister, tickets, step, setStep } = useTickets();
  const { setFormData, formData } = useManadaDayFormData();

  const isMobile = useIsMobile();

  const { setEventRegister, eventRegister } = useFormStore();
  const { setCharge, charge } = usePixChargeStore();
  const {
    method,
    setIsPaid,
    setIsPaymentCardProcessing,
    setPaymentIsLoading: setLoading,
  } = useCalcValueTopStore();

  const {
    handleCreditCardPayment,
    handlePixPayment,
    paymentIsConfirmed,
    handleFreePayment,
  } = usePaymentHandlers({
    setCreditCardCharge,
  });

  const { mutateAsync: createInitialRegister } =
    api.manadaDay.createInitial.useMutation();

  const { mutateAsync: updateRegister } =
    api.manadaDay.updateRegister.useMutation();

  usePaymentMonitor({
    method: "CREDIT_CARD",
    registerId: formData?.id,
    eventoId: eventRegister?.id,
    enabled:
      !!formData?.id &&
      method === "creditCard" &&
      !!creditCardCharge &&
      step === "payment",
    refetchInterval: 10 * 1000, // 10 seconds
    onSuccess: () => {
      setIsPaid(true);
      setCreditCardCharge(null);
      paymentIsConfirmed();
      setIsPaymentCardProcessing(false);
    },
  });

  usePaymentMonitor({
    method: "PIX",
    registerId: formData?.id,
    eventoId: eventRegister?.id,
    enabled:
      !!formData?.id && method === "pix" && !!charge && step === "payment",
    refetchInterval: 15 * 1000, // 15 seconds
    onSuccess: () => {
      setIsPaid(true);
      setCharge(null);
      paymentIsConfirmed();
    },
  });

  // Criar valores padrão baseados nos tickets selecionados
  const defaultValues = {
    participants: tickets.map((ticket) => ({
      name: "",
      cpf: "",
      type: ticket.type,
      value: ticket.value,
    })),
  };

  const schema = React.useMemo(() => {
    if (method === "creditCard") return payByCreditCardSchema;
    return participantSchema;
  }, [method]);

  const createForm = useForm<FormData | CreditCardFormData>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
  });

  const { handleSubmit, reset } = createForm;

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      if (!eventRegister) {
        toast({
          title: "Não foi possível executar ação, tente novamente",
          variant: "destructive",
        });
        return;
      }

      if (step === "data") {
        setFormData(data);
        setStep("payment");
        return;
      }

      let registerId = formData?.id;

      if (!registerId) {
        registerId = await createInitialRegister({
          ...data,
          eventoId: eventRegister.id,
        });
      } else {
        await updateRegister({
          id: registerId,
          eventoId: eventRegister.id,
          ...data,
        });
      }

      setFormData({ ...data, id: registerId });

      if (method && isPixData(data, method)) {
        const { name, cpf, email, phone } = data;
        await handlePixPayment({
          id: registerId,
          name,
          cpf,
          email,
          phone,
        });
      }

      if (method && isCreditCardData(data, method)) {
        await handleCreditCardPayment({
          ...data,
          registerId,
        });
      }

      if (method && isFreeData(data, method))
        await handleFreePayment({
          registerId,
        });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao processar inscrição",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onError = (errors: unknown) => {
    console.log("Erros de validação:", errors);
  };

  const isCreditCardData = (
    data: any,
    method: Method,
  ): data is CreditCardFormData => {
    return method === "creditCard";
  };

  const isPixData = (data: any, method: Method): data is FormData => {
    return method === "pix";
  };

  const isFreeData = (data: any, method: Method): data is FormData => {
    return method === "free";
  };

  // Resetar o formulário quando os tickets mudarem
  useEffect(() => {
    const newDefaultValues = {
      participants: tickets.map((ticket) => ({
        name: "",
        cpf: "",
        type: ticket.type,
        value: ticket.value,
      })),
    };
    reset(newDefaultValues);
  }, [tickets, reset]);

  useEffect(() => {
    if (startRegister) {
      window.scrollTo({
        top: isMobile ? 360 : 40, // scroll
        behavior: "smooth",
      });
    }
  }, [step, isMobile, startRegister]);

  useEffect(() => {
    void setEventRegister("3", router);
  }, [router, setEventRegister]);

  return (
    <div className="relative flex h-full min-h-screen">
      {/* BackGround */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-card via-card/70 to-transparent"></div>
      <div className="absolute bottom-0 right-0 top-0 z-0 flex w-[80%] items-end justify-end opacity-10 sm:opacity-20">
        <Image
          src={eventRegister?.banner ?? banner}
          width={600}
          height={600}
          alt={`Banner do evento ${titulo}`}
          className="h-full w-full object-cover"
        />
      </div>

      <Section className="mt-24 h-full min-h-screen pb-24 sm:mt-28">
        <FormProvider {...createForm}>
          <form
            onSubmit={handleSubmit(onSubmit, onError)}
            className={`relative z-10 flex flex-col-reverse justify-between sm:flex-row sm:gap-16`}
          >
            <div className="w-full space-y-6">
              <EventDetailImage
                src={eventRegister?.banner ?? banner}
                alt={`Imagem do top - ${eventRegister?.titulo}`}
                className="relative mb-4 block h-48 w-full overflow-hidden rounded-md object-cover md:hidden"
              />

              <div className="relative flex flex-col gap-2 rounded-md border bg-card p-4">
                <h1 className="m-0 p-0 text-xl font-bold sm:text-3xl">
                  {eventRegister?.titulo ?? titulo}
                </h1>
                <h2 className="text-base font-semibold sm:text-lg">
                  {eventRegister?.subtitulo ?? subtitulo}
                </h2>
                <IconText
                  icon={MapPin}
                  text={eventRegister?.local ?? local}
                  iconClassName="size-4 sm:size-5 text-primary"
                  className="text-base sm:text-lg"
                />

                <IconText
                  icon={Calendar}
                  text={eventRegister?.periodo ?? periodo}
                  className="text-base sm:text-lg"
                  iconClassName="size-4 sm:size-5 text-primary"
                />
              </div>

              {startRegister ? <RegisterTabs /> : <EventDetail />}
            </div>

            <TicketOptionsManadaDay />
          </form>
        </FormProvider>
      </Section>
    </div>
  );
}
