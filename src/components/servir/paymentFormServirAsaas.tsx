"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CreditCard as CreditCardIcon,
  Ticket,
} from "lucide-react";
import { api } from "@/trpc/react";
import {
  CUSTOM_ALPHABET_CHECK_IN_CODE,
  FEATURE_FLAG_SHOW_CREDITCARD_OPTION_SERVIR,
} from "@/lib/constants";
import { Button } from "../ui/button";
import { CheckboxCard } from "../ui/checkbox-card";
import { TextWithIcon } from "../ui/text-with-icon";
import { FaPix as Pix } from "react-icons/fa6";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { SuccessPaymentMessage } from "../success-payment-message";
import { type Loading } from "@/lib/types";
import { PaymentDetail } from "../payment-detail";
import { toast } from "../ui/use-toast";
import { calcValorTop } from "@/lib/utils/calcValorTop";
import { reais } from "@/lib/utils/money";
import { mask } from "remask";
import { Checkbox } from "../ui/checkbox";
import { CreditCard } from "../credit-card/credit-card";
import { useCalcValueTopStore } from "@/lib/store/CalcValueTopStore";
import { useFormStore } from "../participante/useFormStore";
import { useStepsServir } from "@/app/hook/useStepsServir";
import {
  getInscricaoByCPF,
  sendInngestEventConfirmedRegisterNotification,
} from "@/lib/queries/client";
import { type Inscricao } from "@prisma/client";
import { useCupomDesconto } from "../coupon/useCupomDesconto";
import { CupomDesconto } from "../coupon/cupom-desconto";
import { ToastAction } from "../ui/toast";
import Link from "next/link";
import { convertToBasisPoint } from "@/lib/utils/basisPoint";
import { Spinner } from "../ui/spinner";
import {
  type AsaasPaymentResponse,
  type AsaasPixChargeRequest,
} from "@/appTypes/asaas";
import { get48HoursLater } from "@/lib/utils/get48HoursLater";
import {
  getCustomerByCpf,
  createCustomer,
  createPayment,
  getPixQrCode,
  type AsaasQrCodeResponse,
} from "@/lib/actions/asaas";
import { PixChargeAsaas } from "../pix-charge-asaas";
import { usePaymentMonitor } from "@/lib/hooks/usePaymentMonitor";
import { cleanData } from "@/lib/utils/clean-mask";
import { customAlphabet } from "nanoid";

export default function PaymentFormServir() {
  const { formData, eventRegister } = useFormStore();

  const {
    topValue,
    setTopValue,
    amount,
    resetCalcValueStore,
    setFee,
    discount,
    isPaid,
    setIsPaid,
  } = useCalcValueTopStore();
  const { cupom, setCupomValue } = useCupomDesconto();
  const { handleStepChange } = useStepsServir();
  const updateInscricao = api.inscricao.updateInscricao.useMutation();

  const updateStatusInscricao =
    api.inscricao.updateStatusInscricao.useMutation();
  const usarCupom = api.cupom.usarCupom.useMutation();

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

  usePaymentMonitor({
    registerId: formData?.id,
    eventoId: eventRegister!.id,
    enabled: !!charge,
    refetchInterval: 15 * 1000, // 15 seconds
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

      const data = await getInscricaoByCPF(formData.cpf, eventRegister.id);

      if (!data) {
        toast({
          title: "Seu cadastro não foi concluído",
          variant: "destructive",
        });
        return;
      }

      const cpf = data?.cpf;

      const payload: AsaasPixChargeRequest = {
        billingType: "PIX",
        value: amount,
        description: `SERVIR TOP#${eventRegister.topNumero} - ${cpf}`,
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
      return charge;
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
    } finally {
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
        toast({
          title: "QRCode copiado!",
          variant: "success",
        });
        setTimeout(() => {
          setIsCopiedQrCode(false);
        }, 2000);
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

      if (cupom) {
        await usarCupom.mutateAsync({
          eventoId: eventRegister.id,
          id: cupom.id,
          inscricaoId: formData.id!,
          usadoCount: cupom.usadoCount + 1,
        });
      }
      const inscricaoUpdated = await updateStatusInscricao.mutateAsync({
        id: formData.id!,
        eventoId: eventRegister.id,
        status: "CONFIRMADA",
        checkinCode: checkInCode(),
        pagamento_status: "GRATUITO",
        pagamento_couponValue: cupom?.codigo,
        // new type
        pagamento_top_value: convertToBasisPoint(topValue),
        pagamento_discount_value: convertToBasisPoint(discount),
        pagamento_total_value: convertToBasisPoint(amount),
        pagamento_link_url: null,
        metodo_pagamento: "CUPOM_GRATUITO",
        pagamento_integracao_service: undefined,
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
    void getLgndCerticatedOrNot();

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

  const getLgndCerticatedOrNot = useCallback(async () => {
    if (!formData.cpf || !eventRegister?.id) {
      toast({
        title: "CPF ou evento inválido.",
        variant: "destructive",
      });
      console.error("CPF ou evento inválido.");
      return;
    }

    try {
      const data = await getInscricaoByCPF(formData.cpf, eventRegister.id);
      setInscricao(data);

      if (!data) return;

      setTopValue(calcValorTop(!!data?.lgndCertificado, eventRegister));
    } catch (error) {
      console.error("Erro ao buscar inscrição:", error);
    }
  }, [eventRegister, formData.cpf, setTopValue]);

  const checkInscricaoStatus = async () => {
    if (!formData.cpf || !eventRegister?.id) {
      toast({
        title: "CPF ou evento inválido.",
        variant: "destructive",
      });
      console.error("CPF ou evento inválido.");
      return;
    }

    try {
      const data = await getInscricaoByCPF(formData.cpf, eventRegister.id);

      if (data?.status?.includes("CONFIRMADA")) {
        setIsPaid(true);
        setCupomValue("none");
      }
    } catch (error) {
      console.error("Erro ao buscar inscrição:", error);
    }
  };

  useEffect(() => {
    void checkInscricaoStatus();
    setFee(0);
    void getLgndCerticatedOrNot();
  }, []);

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

  const isRegisterFree = discount > 0 && discount === topValue && !isPaid;

  return (
    <section className="relative flex min-h-[44rem] flex-col">
      <div className="relative grid grid-cols-1 gap-12 sm:grid-cols-5 sm:gap-4">
        <div className="flex flex-col-reverse justify-between gap-4 rounded-md bg-input/10 p-2 sm:col-span-2 sm:flex-col sm:gap-0">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-base font-bold sm:text-xl">
                Inscrição para Servir
              </h2>
              <h3 className="text-sm sm:text-lg">
                TOP #{eventRegister?.topNumero} - {eventRegister?.pista}
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              <p className="font-medium">Valor LGND para Certificar:</p>
              <TextWithIcon
                icon={<Pix size={18} />}
                label={`Pix:`}
                description={`${eventRegister && reais(eventRegister?.valorParaObterCertificacao)} à vista `}
                className="justify-start text-sm font-medium sm:text-base"
              />

              <TextWithIcon
                icon={<CreditCardIcon size={18} />}
                label={`Cartão de Crédito:`}
                description={`${eventRegister && reais(eventRegister?.valorParaObterCertificacao)} + juros `}
                className="justify-start text-sm font-medium sm:text-base"
              />
            </div>
            <div className="flex flex-col gap-6">
              <p className="font-medium">Valor LGND Certificados:</p>
              <TextWithIcon
                icon={<Pix size={18} />}
                label={`Pix:`}
                description={`${eventRegister && reais(eventRegister?.valorParaLgndCertificados)} à vista `}
                className="justify-start text-sm font-medium sm:text-base"
              />

              <TextWithIcon
                icon={<CreditCardIcon size={18} />}
                label={`Cartão de Crédito:`}
                description={`${eventRegister && reais(eventRegister?.valorParaLgndCertificados)} + juros `}
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
            onClick={() => handleStepChange("personal")}
          >
            Voltar
          </Button>
        </div>

        <div className="sm:col-span-3">
          <div className="flex flex-col gap-8">
            <h2 className="text-base font-bold sm:text-lg">Pagamento</h2>

            {!isRegisterFree && (
              <div>
                <TextWithIcon
                  icon={<Ticket size={24} />}
                  label="Selecione a forma de pagamento"
                  className="mb-2 justify-start"
                />

                {topValue !== discount ? (
                  <div className="grid w-full grid-cols-2 gap-6 bg-background p-4">
                    <CheckboxCard
                      checkedValue={checked}
                      setChecked={(value) => handleCheckPayPix(value)}
                      name="payment"
                      label="Pix"
                      value="pix"
                      icon={<Pix size={18} className="text-primary" />}
                      className="py-6"
                    />

                    {FEATURE_FLAG_SHOW_CREDITCARD_OPTION_SERVIR && (
                      <CheckboxCard
                        checkedValue={checked}
                        setChecked={(value) => handleCheckCreditCard(value)}
                        name="payment"
                        label="Cartão"
                        value="cartao"
                        icon={
                          <CreditCardIcon size={18} className="text-primary" />
                        }
                        className="py-6"
                      />
                    )}
                  </div>
                ) : (
                  <div className="col-span-full mt-6 flex w-full items-center justify-center">
                    <Spinner size={32} />
                  </div>
                )}
              </div>
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
                whatasappLink={eventRegister.linkWhatsappGrupoServir}
              />
            )}

            {checked === "pix" && !isPaid && topValue !== discount && (
              <div className="mt-6 rounded-md px-2">
                <div className="mb-4 flex items-center gap-2">
                  {topValue === discount ? (
                    <h3 className="font-medium">Pagamento da inscrição</h3>
                  ) : (
                    <>
                      <Pix size={18} className="text-primary" />
                      <h3 className="font-medium">
                        Pagamento da inscrição via PIX
                      </h3>
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

            {FEATURE_FLAG_SHOW_CREDITCARD_OPTION_SERVIR &&
              checked === "cartao" &&
              // !isPaid &&
              topValue !== discount && (
                <div className="mt-6 flex flex-col gap-4">
                  <div className="flex gap-2">
                    <CreditCardIcon size={18} className="text-primary" />
                    <h3 className="font-medium">
                      Pagamento via Cartão de Crédito
                    </h3>
                  </div>

                  <div className="spx-2 space-y-2 bg-background px-2 py-2 text-xs sm:text-sm">
                    {true ? (
                      <>
                        <strong className="">Dados do Participante</strong>
                        <p>
                          {inscricao?.nome} -{" "}
                          {inscricao?.cpf &&
                            mask(inscricao?.cpf, "999.999.999-99")}
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
          </div>

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
    </section>
  );
}
