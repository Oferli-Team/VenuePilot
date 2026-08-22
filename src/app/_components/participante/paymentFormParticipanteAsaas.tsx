"use client";

import { api } from "@/trpc/react";
import {
  AlertCircle,
  CreditCard as CreditCardIcon,
  DollarSign,
  Ticket,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { useStepsRegister } from "@/app/hook/useStepsRegister";
import {
  CUSTOM_ALPHABET_CHECK_IN_CODE,
  FEATURE_FLAG_SHOW_CREDITCARD_OPTION_PARTICIPANTE,
} from "@/lib/constants";
import { useCalcValueTopStore } from "@/lib/store/CalcValueTopStore";
import { type Loading } from "@/lib/types";
import { reais } from "@/lib/utils/money";
import { FaPix as Pix } from "react-icons/fa6";
import { mask } from "remask";
import { CreditCard } from "../credit-card/credit-card";
import { PaymentDetail } from "../payment-detail";
import { SuccessPaymentMessage } from "../success-payment-message";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { CheckboxCard } from "../ui/checkbox-card";
import { TextWithIcon } from "../ui/text-with-icon";
import { toast } from "../ui/use-toast";
import { useFormStore } from "./useFormStore";
import { useSearchParams } from "next/navigation";
import { type LinkSecreto, type Inscricao } from "@prisma/client";
import {
  getInscricaoByCPF,
  getLinkSecreto,
  sendInngestEventConfirmedRegisterNotification,
} from "@/lib/queries/client";
import { useCupomDesconto } from "../coupon/useCupomDesconto";
import { CupomDesconto } from "../coupon/cupom-desconto";
import { PixChargeAsaas } from "../pix-charge-asaas";

import {
  type AsaasQrCodeResponse,
  createCustomer,
  createPayment,
  getCustomerByCpf,
  getPixQrCode,
} from "@/lib/actions/asaas";
import {
  type AsaasPaymentResponse,
  type AsaasPixChargeRequest,
} from "@/appTypes/asaas";
import { usePaymentMonitor } from "@/lib/hooks/usePaymentMonitor";
import { get48HoursLater } from "@/lib/utils/get48HoursLater";
import { cleanData } from "@/lib/utils/clean-mask";
import { customAlphabet } from "nanoid";

export default function PaymentFormParticipanteAsaas() {
  const searchParams = useSearchParams();
  const hasLinkParams = searchParams.has("link");

  const [checked, setChecked] = useState("pix");
  const [openPix, setOpenPix] = useState(false);
  const [loading, setLoading] = useState<Loading>("initial");
  const [isCopiedQrCode, setIsCopiedQrCode] = React.useState(false);
  const [isCopiedPixToPay, setIsCopiedPixToPay] = React.useState(false);
  const [charge, setCharge] = React.useState<
    (AsaasPaymentResponse & AsaasQrCodeResponse) | null
  >(null);
  const [paymentStatus, setPaymentStatus] = React.useState("Pendente");
  const [participanteIsPayer, setParticipanteIsPayer] = useState(false);
  const [inscricao, setInscricao] = useState<Inscricao | null>(null);
  const [linkSecreto, setLinkSecreto] = useState<LinkSecreto | undefined>(
    undefined,
  );

  const {
    topValue,
    setTopValue,
    amount,
    resetCalcValueStore,
    fee,
    setFee,
    discount,
    calcAmount,
    setIsPaid,
    isPaid,
  } = useCalcValueTopStore();
  const { cupom, cupomValue, setCupomValue, resetCupom } = useCupomDesconto();
  const { formData, resetFormStore, eventRegister } = useFormStore();

  const updateInscricao = api.inscricao.updateInscricao.useMutation();
  const updateStatusInscricao =
    api.inscricao.updateStatusInscricao.useMutation();
  const usarCupom = api.cupom.usarCupom.useMutation();

  const { handleStepChange } = useStepsRegister();

  usePaymentMonitor({
    registerId: formData?.id,
    eventoId: eventRegister!.id,
    enabled: !!charge,
    onSuccess: () => {
      setIsPaid(true);
      setPaymentStatus("Pago");
      setCharge(null);
    },
  });

  const checkInCode = customAlphabet(
    CUSTOM_ALPHABET_CHECK_IN_CODE.alphabet,
    CUSTOM_ALPHABET_CHECK_IN_CODE.size,
  );

  const newCharge = async () => {
    try {
      if (!eventRegister) return;

      const data = await getInscricaoByCPF(formData.cpf, eventRegister.id);

      if (!data?.id) {
        toast({
          title: "Não foi possível gerar a cobrança",
          description: "Conclua seu cadastro",
          variant: "destructive",
        });
        setLoading("initial");
        return;
      }

      const cpf = data.cpf;

      const payload: AsaasPixChargeRequest = {
        billingType: "PIX",
        value: amount,
        description: `PARTICIPAR TOP#${eventRegister.topNumero} - ${cpf}`,
        dueDate: get48HoursLater(),
        externalReference: JSON.stringify({
          inscricaoId: data.id,
          eventoId: eventRegister.id,
        }),
      };

      // Attempt to find the customer by CPF
      let customer = await getCustomerByCpf(data.cpf!);

      // If the customer does not exist, create a new one
      if (!customer) {
        const customerInfo = {
          name: data.nome!,
          email: data.email!,
          cpfCnpj: cleanData(cpf!),
          mobilePhone: cleanData(data.celular!),
          notificationDisabled: true,
        };
        customer = await createCustomer(customerInfo);
      }

      const response = await createPayment(payload, customer.id);

      const qrCode = await getPixQrCode(response.id);

      const _charge = {
        ...response,
        ...qrCode,
      };

      if (cupom) {
        await usarCupom.mutateAsync({
          eventoId: data.eventoId,
          id: cupom.id,
          inscricaoId: data.id,
          usadoCount: cupom.usadoCount + 1, // TODO: use increment
        });
      }

      await updateInscricao.mutateAsync({
        id: data.id,
        eventoId: data.eventoId,

        pagamento_couponValue: cupom?.codigo ?? "none",
        //new types
        pagamento_top_value: convertToBasisPoint(topValue),
        pagamento_discount_value: convertToBasisPoint(discount),
        pagamento_total_value: convertToBasisPoint(amount),
      });

      setCharge(_charge);
      setOpenPix(true);
      return _charge;
    } catch (error) {
      if (error) {
        toast({
          title: "Não foi possível gerar a Cobrança.",
          variant: "destructive",
        });
        setLoading("initial");
        return;
      }
    }
  };

  const generateCharge = async () => {
    setLoading("loading");

    try {
      const _charge = await newCharge();
      if (!_charge) return;

      setLoading("initial");
    } catch (error) {
      toast({
        title: "Não foi possível gerar a Cobrança",
      });
      console.log("Erro ao gerar a Cobrança", error);
      setLoading("initial");
    }
  };

  const handleSendPixToPay = React.useCallback(
    async (e: any) => {
      if (e.target.name === "codeQrCode") {
        setIsCopiedPixToPay(true);
        setTimeout(() => {
          setIsCopiedPixToPay(false);
        }, 2000);
      } else {
        setIsCopiedPixToPay(true);

        const data = await getInscricaoByCPF(formData.cpf, eventRegister.id);

        setTimeout(() => {
          setIsCopiedPixToPay(false);
          if (!charge) return;
          const eventoLegendariosURL = charge.invoiceUrl;
          const mensagem = encodeURIComponent(
            `Pague com PIX ${reais(amount)} para o LEGENDÁRIOS VALE DA ONÇA - TOP #${eventRegister?.topNumero} através da Asaas. ${eventoLegendariosURL}`,
          );
          const whatsappURL = `https://api.whatsapp.com/send?phone=${data?.celular}&text=${mensagem}`;

          window.open(whatsappURL, "_blank");
        }, 1000);
      }
    },
    [charge],
  );

  const handleCopyQrCode = React.useCallback(
    async (e: any) => {
      if (e.target.name === "codeQrCode") {
        setIsCopiedQrCode(true);
        setTimeout(() => {
          setIsCopiedQrCode(false);
        }, 2000);
        toast({
          title: "QRCode copiado!",
          variant: "success",
        });
      } else {
        setIsCopiedQrCode(true);
        setTimeout(() => {
          setIsCopiedQrCode(false);
          if (!charge) return;
        }, 1000);
      }
    },
    [charge],
  );

  const handleCouponTotalOff = async () => {
    try {
      if (!eventRegister) return;

      setLoading("loading");
      if (cupom) {
        await usarCupom.mutateAsync({
          eventoId: eventRegister?.id,
          id: cupom.id,
          inscricaoId: formData.id!,
          usadoCount: cupom.usadoCount + 1,
        });
      }

      const inscricaoUpdated = await updateStatusInscricao.mutateAsync({
        id: formData.id!,
        eventoId: eventRegister.id,
        checkinCode: checkInCode(),
        status: "CONFIRMADA",
        pagamento_status: "GRATUITO",
        pagamento_data: new Date(),
        pagamento_couponValue: cupom?.codigo,
        // new type
        pagamento_top_value: convertToBasisPoint(topValue),
        pagamento_discount_value: convertToBasisPoint(discount),
        pagamento_total_value: convertToBasisPoint(amount),
        metodo_pagamento: "CUPOM_GRATUITO",
        pagamento_integracao_service: undefined,
        linkSecreto: linkSecreto?.link,
        pagamento_link_url: null,
      });

      setIsPaid(true);

      toast({
        title: "Inscrição confirmada com sucesso!",
        variant: "success",
      });

      await sendInngestEventConfirmedRegisterNotification({
        event: eventRegister,
        register: {
          id: inscricaoUpdated.id,
          nome: inscricaoUpdated.nome!,
          tipoInscricao: inscricaoUpdated.tipoInscricao!,
          celular: inscricaoUpdated.celular!,
          flags: inscricaoUpdated.flags,
        },
      });

      window.location.assign(
        `/ticket/${inscricaoUpdated.eventoId}/${inscricaoUpdated.cpf}`,
      );
    } catch (error) {
      toast({
        title: "Ops! Erro ao confirmar inscrição.",
        variant: "destructive",
      });
    } finally {
      resetCalcValueStore();
      setLoading("initial");
    }
  };

  const handleCheckPayPix = (value: string) => {
    setChecked(value);
    setFee(0);
    toast({
      title: "Pagamento via Pix selecionado.",
    });
  };

  const handleCheckCreditCard = (value: string) => {
    setChecked(value);

    setFee(0);
    toast({
      title: "Pagamento via Cartão de Crédito selecionado.",
    });
  };

  const checkInscricaoStatus = async () => {
    if (!eventRegister) return;
    const data = await getInscricaoByCPF(formData.cpf, eventRegister.id);
    setInscricao(data);
    if (data?.status?.includes("CONFIRMADA")) {
      setIsPaid(true);
      setCupomValue("none");
    }
  };

  const checkSecretLink = async () => {
    try {
      if (!hasLinkParams) {
        return;
      }

      if (!eventRegister) return;

      const link = searchParams.get("link");
      const data = await getLinkSecreto(link!, eventRegister.id);
      setLinkSecreto(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    void checkSecretLink();
  }, [hasLinkParams]);

  useEffect(() => {
    void checkInscricaoStatus();
    setFee(0);
    if (eventRegister) {
      setTopValue(eventRegister.valorParticipante);
    }
  }, []);

  useEffect(() => {
    calcAmount();
  }, [topValue, fee, discount]);

  useEffect(() => {
    if (eventRegister) {
      setTopValue(eventRegister.valorParticipante);
    }
  }, [discount, fee]);

  const asaasData = {
    openPix,
    charge,
    isCopiedQrCode,
    isCopiedPixToPay,
    handleCopyQrCode,
    handleSendPixToPay,
    paymentStatus,
    codeQrCode: charge?.payload ?? "",
    brCode: charge?.encodedImage ?? "",
    paymentLinkUrl: charge?.invoiceUrl,
  };

  return (
    <div className="relative grid grid-cols-1 gap-12 sm:grid-cols-5 sm:gap-4">
      <div className="flex flex-col-reverse justify-between gap-4 rounded-md bg-input/10 p-2 sm:col-span-2 sm:flex-col sm:gap-0">
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-base font-bold sm:text-xl">
              Inscrição Participante
            </h2>
            <h3 className="text-sm sm:text-lg">
              TOP #{eventRegister?.topNumero} - {eventRegister?.pista}
            </h3>
          </div>

          <div className="flex flex-col gap-6">
            <p className="font-medium">Valor:</p>
            <TextWithIcon
              icon={<Pix size={18} />}
              label={`Pix:`}
              description={`${eventRegister && reais(eventRegister.valorParticipante)} à vista `}
              className="justify-start text-sm font-medium sm:text-base"
            />

            <TextWithIcon
              icon={<CreditCardIcon size={18} />}
              label={`Cartão de Crédito:`}
              description={`${eventRegister && reais(eventRegister.valorParticipante)} + juros `}
              className="justify-start text-sm font-medium sm:text-base"
            />

            <CupomDesconto />
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="w-fit justify-start"
          onClick={() => handleStepChange("uniform_terms")}
        >
          Voltar
        </Button>
      </div>

      <div className="sm:col-span-3">
        <div className="flex flex-col gap-6 px-2">
          <h2 className="text-base font-bold sm:text-lg">Pagamento</h2>

          {topValue !== discount && (
            <>
              <TextWithIcon
                icon={<DollarSign size={24} />}
                label="Selecione a forma de pagamento"
                className="justify-start"
              />

              <div className="grid w-full grid-cols-2 gap-6 bg-background p-4">
                <CheckboxCard
                  checkedValue={checked}
                  setChecked={(value) => {
                    handleCheckPayPix(value);
                  }}
                  name="payment"
                  label="Pix"
                  value="pix"
                  icon={<Pix size={18} className="text-primary" />}
                  className="py-6"
                />

                {FEATURE_FLAG_SHOW_CREDITCARD_OPTION_PARTICIPANTE && (
                  <CheckboxCard
                    checkedValue={checked}
                    setChecked={(value) => {
                      handleCheckCreditCard(value);
                    }}
                    name="payment"
                    label="Cartão"
                    value="cartao"
                    icon={<CreditCardIcon size={18} className="text-primary" />}
                    className="py-6"
                  />
                )}
              </div>
            </>
          )}

          {isPaid && (
            <Button
              onClick={() => window.location.assign("/")}
              className="mt-3"
            >
              Ir para tela inicial
            </Button>
          )}
        </div>

        <div className="w-full">
          {isPaid && checked === "pix" && (
            <SuccessPaymentMessage
              participante={{
                cpf: formData.cpf,
                eventoId: eventRegister?.id ?? "",
              }}
              topValue={topValue}
              valueDiscount={discount}
              whatasappLink={eventRegister?.linkWhatsappGrupoParticipante ?? ""}
            />
          )}

          {checked === "pix" && !isPaid && topValue !== discount && (
            <div className="mt-6 rounded-md bg-background p-3">
              <div className="mb-4 flex items-center gap-2">
                {topValue === discount ? (
                  <h3 className="text-lg font-medium">
                    Pagamento da inscrição
                  </h3>
                ) : (
                  <TextWithIcon
                    icon={<Pix size={18} />}
                    label={`Pagamento da inscrição via PIX`}
                    labelClass="md:text-base"
                    className="justify-start text-sm font-medium sm:text-base"
                  />
                )}
              </div>
              <PaymentDetail />

              {!charge && topValue !== discount ? (
                <div className="my-8 flex justify-center">
                  <Button
                    type="button"
                    onClick={generateCharge}
                    disabled={!!charge}
                    loading={loading === "loading"}
                  >
                    Gerar Cobrança Pix
                  </Button>
                </div>
              ) : null}

              <div
                className={`transition-all ${
                  openPix
                    ? "pointer-events-auto h-full scale-x-100 opacity-100"
                    : "pointer-events-none hidden scale-x-0 opacity-0"
                }`}
              >
                <div
                  className={`mt-6 flex w-full items-center justify-center overflow-hidden`}
                >
                  <PixChargeAsaas {...asaasData} />
                </div>

                <Alert variant="outline" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>ATENÇÃO</AlertTitle>
                  <AlertDescription>
                    Sua vaga no evento só será confirmada após a realização do
                    pagamento. O não pagamento no prazo informado implicará no
                    cancelamento automático da inscrição.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}

          {FEATURE_FLAG_SHOW_CREDITCARD_OPTION_PARTICIPANTE &&
            checked === "cartao" &&
            topValue !== discount && (
              <div className="mt-6 flex flex-col gap-4">
                <TextWithIcon
                  icon={<CreditCardIcon size={18} />}
                  label={`Pagamento via Cartão de Crédito`}
                  labelClass="md:text-base"
                  className="justify-start text-sm font-medium sm:text-base"
                />

                <div className="spx-2 space-y-2 bg-background px-2 py-2 text-sm sm:text-base">
                  {inscricao ? (
                    <>
                      <strong className="">Dados do Participante</strong>
                      <p>
                        {inscricao.nome} -{" "}
                        {inscricao.cpf && mask(inscricao.cpf, "999.999.999-99")}
                      </p>
                    </>
                  ) : (
                    <p>Dados do participante não disponíveis.</p>
                  )}
                  <div className="mt-3 flex items-center gap-2 bg-primary/10 p-1 font-medium">
                    <label htmlFor="payerCheckbox" className="cursor-pointer">
                      Sou o Participante e vou realizar o pagamento
                    </label>
                    <Checkbox
                      id="payerCheckbox"
                      checked={participanteIsPayer}
                      onCheckedChange={() =>
                        setParticipanteIsPayer(!participanteIsPayer)
                      }
                    />
                    {participanteIsPayer && "Sim"}
                  </div>
                </div>

                <div className="px-2">
                  <CreditCard
                    linkSecreto={linkSecreto}
                    participanteIsPayer={participanteIsPayer}
                  />
                </div>
              </div>
            )}

          {discount === topValue && !isPaid && (
            <div className="mt-8 flex w-full flex-col justify-center gap-12">
              <TextWithIcon
                icon={<Ticket size={24} />}
                label="Conclua sua Inscrição"
                description={`Cupom ${cupom?.desconto && cupom.desconto / 100}% OFF aplicado`}
                className="justify-start"
              />
              <Button
                loading={
                  updateStatusInscricao.isPending || loading === "loading"
                }
                onClick={handleCouponTotalOff}
                type="button"
              >
                Concluir Inscrição
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function convertToBasisPoint(value: number): number {
  return Math.round(value * 100);
}
