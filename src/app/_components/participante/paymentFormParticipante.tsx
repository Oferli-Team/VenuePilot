"use client";

import { api } from "@/trpc/react";
import { useOpenPix } from "@openpix/react";
import {
  AlertCircle,
  CreditCard as CreditCardIcon,
  DollarSign,
  Ticket,
} from "lucide-react";
import { customAlphabet } from "nanoid";
import React, { useEffect, useState } from "react";

import { useStepsRegister } from "@/app/hook/useStepsRegister";
import { env } from "@/env";
import {
  ASAAS,
  FEATURE_FLAG_SHOW_CREDITCARD_OPTION_PARTICIPANTE,
} from "@/lib/constants";
import { useCalcValueTopStore } from "@/lib/store/CalcValueTopStore";
import { type ChargePix, type Loading } from "@/lib/types";
import { reais } from "@/lib/utils/money";
import { createWhatsappGroupLinkParticipantes } from "@/lib/whatsapp";
import { FaPix as Pix } from "react-icons/fa6";
import { mask } from "remask";
import { CreditCard } from "../credit-card/credit-card";
import { PaymentDetail } from "../payment-detail";
import { PixChargeWoovi } from "../pix-charge-woovi";
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
import { getInscricaoByCPF } from "@/lib/queries/client";
import { useCupomDesconto } from "../coupon/useCupomDesconto";
import { CupomDesconto } from "../coupon/cupom-desconto";
import { convertToBasisPoint } from "@/lib/utils/basisPoint";
import { Spinner } from "../ui/spinner";

const randomID = customAlphabet("1234567890abcdef", 10);

export default function PaymentFormParticipante() {
  const [checked, setChecked] = useState("pix");
  const [openPix, setOpenPix] = useState(false);
  const [loading, setLoading] = useState<Loading>("initial");
  const [isCopiedQrCode, setIsCopiedQrCode] = React.useState(false);
  const [isCopiedPixToPay, setIsCopiedPixToPay] = React.useState(false);
  const [charge, setCharge] = React.useState<ChargePix | null>(null);
  const [paymentStatus, setPaymentStatus] = React.useState("Pendente");
  const [participanteIsPayer, setParticipanteIsPayer] = useState(false);
  const [inscricao, setInscricao] = useState<Inscricao | null>(null);

  const {
    topValue,
    setTopValue,
    amount,
    resetCalcValueStore,
    fee,
    setFee,
    discount,
    calcAmount,
  } = useCalcValueTopStore();
  const { cupom, cupomValue, setCupomValue, resetCupom } = useCupomDesconto();
  const { formData, resetFormStore, eventRegister } = useFormStore();
  const { setIsPaid, isPaid, resetValues } = useCalcValueTopStore();

  const updateStatusInscricao = api.inscricao.updateInscricao.useMutation();
  const usarCupom = api.cupom.usarCupom.useMutation();

  const { handleStepChange } = useStepsRegister();

  const onPay = async (charge: {
    correlationID: string;
    status: string;
    paymentLinkUrl: string;
    createdAt: string;
    discount: number;
    fee: number;
    couponValue: string;
  }) => {
    if (!eventRegister) return;
    const data = await getInscricaoByCPF(formData.cpf, eventRegister.id);

    if (!data?.id) return;

    setCharge(charge);
    if (charge.status === "COMPLETED") {
      setPaymentStatus("Pago");

      await updateStatusInscricao.mutateAsync({
        id: data.id,
        eventoId: eventRegister.id,
        status: "CONFIRMADA",
        metodo_pagamento: "PIX",
        pagamento_status: "CHARGE_COMPLETED",
        pagamento_data: new Date(charge.createdAt),
        pagamento_topValue: String(topValue),
        pagamento_couponValue: cupom?.codigo ?? "none",
        pagamento_valueDiscount: String(discount),
        pagamento_feeCard: String(fee),
        pagamento_integracao_status: charge.status,
        pagamento_integracao_service: "WOOVI",
        //new types
        pagamento_top_value: convertToBasisPoint(topValue),
        pagamento_discount_value: convertToBasisPoint(discount),
        pagamento_total_value: convertToBasisPoint(amount),
      });

      setIsPaid(true);

      if (cupom) {
        await usarCupom.mutateAsync({
          eventoId: eventRegister.id,
          id: cupom.id,
          inscricaoId: formData.id!,
          usadoCount: cupom.usadoCount + 1,
        });
      }

      toast({
        title: "Pagamento Concluído!",
        description: "Seu pagamento foi realizado com sucesso!",
        variant: "success",
      });

      window.open(
        createWhatsappGroupLinkParticipantes(
          data?.celular,
          eventRegister.linkWhatsappGrupoParticipante,
        ),
        "_blank",
      );

      resetCupom();
      resetValues();

      setTimeout(() => {
        window.location.assign(`/ticket/${data.eventoId}/${data.cpf}`);
        resetFormStore();
      }, 1000);
    }
  };

  const { chargeCreate } = useOpenPix({
    appID: env.NEXT_PUBLIC_PIX_APP_ID,
    onPay,
  });

  const newCharge = async () => {
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
    const payload = {
      correlationID: randomID(),
      value: Math.floor(amount * 100), // one cent
      comment: `PARTICIPAR TOP#${eventRegister.topNumero} - ${cpf}`,
      customer: {
        name: data.nome,
        email: data.email,
        taxID: data.cpf,
        phone: data.celular,
      },
      additionalInfo: [
        {
          key: "inscricaoId",
          value: data.id,
        },
        {
          key: "eventoId",
          value: eventRegister.id,
        },
        {
          key: "topValue",
          value: String(topValue),
        },
        {
          key: "couponValue",
          value: cupomValue,
        },
        {
          key: "valueDiscount",
          value: String(discount),
        },
        {
          key: "feeCard",
          value: String(fee),
        },
      ],
    };

    const { charge, error } = await chargeCreate(payload);

    if (error) {
      toast({
        title: "Não foi possível gerar a Cobrança.",
        variant: "destructive",
      });
      setLoading("initial");
      return;
    }

    setCharge(charge);
    setOpenPix(true);
    return charge;
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
          const eventoLegendariosURL = charge.paymentLinkUrl;
          const mensagem = encodeURIComponent(
            `Pague com PIX ${reais(amount)} para o LEGENDÁRIOS VALE DA ONÇA - TOP #${eventRegister?.topNumero} através da Woovi. ${eventoLegendariosURL}`,
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
        status: "CONFIRMADA",
        pagamento_status: "GRATUITO",
        pagamento_data: new Date(),
        pagamento_couponValue: cupom?.codigo,
        pagamento_topValue: String(topValue),
        pagamento_valueDiscount: String(discount),
        pagamento_feeCard: String(fee),
        metodo_pagamento: "CUPOM_GRATUITO",
        pagamento_integracao_service: undefined,
        //new types
        pagamento_top_value: convertToBasisPoint(topValue),
        pagamento_discount_value: convertToBasisPoint(discount),
        pagamento_total_value: convertToBasisPoint(amount),
      });

      setIsPaid(true);

      toast({
        title: "Inscrição confirmada com sucesso!",
        variant: "success",
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

  const woovi = {
    openPix,
    charge,
    isCopiedQrCode,
    isCopiedPixToPay,
    handleCopyQrCode,
    handleSendPixToPay,
    paymentStatus,
    codeQrCode: charge?.brCode ?? "",
    paymentLinkUrl: charge?.paymentLinkUrl,
  };

  const isRegisterFree = discount > 0 && discount === topValue && !isPaid;

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

            {/* <div className="mb-4 text-start">
              {ITOP.register_politic.map((item) => (
                <ul key={item.title} className="py-2">
                  <p className="text-sm font-semibold">{item.title}</p>
                  {item.roles.map((role, i) => (
                    <li className="pt-1 text-sm" key={i}>
                      {role}
                    </li>
                  ))}
                </ul>
              ))}
            </div> */}
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

          <TextWithIcon
            icon={<DollarSign size={24} />}
            label="Selecione a forma de pagamento"
            className="justify-start"
          />

          {!(topValue === discount) ? (
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
          ) : (
            <div className="col-span-full mt-6 flex w-full items-center justify-center">
              <Spinner size={32} />
            </div>
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
          {isPaid && (
            <SuccessPaymentMessage
              participante={inscricao}
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
                  <>
                    <TextWithIcon
                      icon={<Pix size={18} />}
                      label={`Pagamento da inscrição via PIX`}
                      labelClass="md:text-base"
                      className="justify-start text-sm font-medium sm:text-base"
                    />
                  </>
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
                  <PixChargeWoovi {...woovi} />
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
            topValue !== discount &&
            !isPaid && (
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
                  <CreditCard participanteIsPayer={participanteIsPayer} />
                </div>
              </div>
            )}

          {isRegisterFree && (
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
