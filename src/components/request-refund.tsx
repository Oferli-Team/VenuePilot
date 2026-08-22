"use client";

import {
  getCustomerChargesByExternalReferenceAsaas,
  refundInstallment,
  refundPix,
} from "@/lib/actions/asaas";
import { type Loading } from "@/lib/types";
import { reais } from "@/lib/utils/money";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Inscricao } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CurrencyInput } from "react-currency-mask";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import Fieldset from "./Fiedset";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-modal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Textarea } from "./ui/textarea";
import { toast } from "./ui/use-toast";

type RefundType = "PARTIAL" | "TOTAL";
type PaymentMethod = "PIX" | "CREDIT_CARD" | null;

const requestRefundSchema = z
  .object({
    refundType: z
      .enum(["TOTAL", "PARTIAL"])
      .refine((value): value is RefundType => ["PARTIAL", "TOTAL"].includes(value), {
        message: "Escolha uma opção",
      }),
    value: z.number().optional(),
    description: z
      .string({ required_error: "Este campo é obrigatório" })
      .min(1, "Este campo é obrigatório"),
  })
  .refine(
    (data) => {
      if (data.refundType === "PARTIAL") {
        return data.value !== undefined && data.value > 0;
      }
      return true;
    },
    { message: "Informe um valor para reembolso parcial", path: ["value"] },
  );

type RefundFormState = {
  value?: number;
  description: string;
  refundType: RefundType;
}

type formData = z.infer<typeof requestRefundSchema>;

export const RequestRefund = ({ user }: { user: Inscricao }) => {
  const pathname = usePathname();
  const router = useRouter();

  const initialFormData: RefundFormState = {
    value: undefined,
    description: "",
    refundType: "TOTAL",
  };

  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogPaymentDuplicate, setOpenDialogPaymentDuplicate] =
    useState(false);
  const [openSheet, setOpenSheet] = useState(false);
  const [installmentId, setInstallmentId] = useState<string | null>(null);
  const [chargeId, setChargeId] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentMethod>(null);
  const [formDataToSubmit, setFormDataToSubmit] = useState<RefundFormState>(initialFormData);
  const [loading, setLoading] = useState<Loading>("initial");

  const createFormData = useForm<formData>({
    resolver: zodResolver(requestRefundSchema),
    defaultValues: {
      refundType: "TOTAL",
      description: "",
      value: undefined
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = createFormData;

  const refundTypeValue = watch("refundType");

  const onSubmit = async (data: formData) => {
    try {
      setLoading("loading");

      const externalReference = JSON.stringify({
        inscricaoId: user.id,
        eventoId: user.eventoId,
      });

      const chargesByCustomer =
        await getCustomerChargesByExternalReferenceAsaas(externalReference);

      if (!chargesByCustomer || chargesByCustomer.length === 0) {
        toast({
          title: "Não foi possível solicitar o estorno",
          description: "Nenhuma cobrança encontrada para este cliente.",
          variant: "destructive",
        });
        setLoading("initial");
        return;
      }

      const eligibleCharges = chargesByCustomer.filter(
        (charge) => charge.status === "RECEIVED" || charge.status === "CONFIRMED"
      );

      if (eligibleCharges.length === 0) {
        toast({
          title: "Não foi possível solicitar o estorno",
          description: "Nenhuma cobrança elegível para reembolso encontrada. Apenas cobranças pagas podem ser reembolsadas.",
          variant: "destructive",
        });
        setLoading("initial");
        return;
      }

      const refundableCharges = eligibleCharges.filter((charge) => {
        if (charge.billingType === "CREDIT_CARD") {
          return charge.installmentNumber === 1;
        }
        return true;
      });

      if (refundableCharges.length === 0) {
        toast({
          title: "Não foi possível solicitar o estorno",
          description: "Nenhuma cobrança principal encontrada. Para cartão de crédito, apenas a primeira parcela pode ser reembolsada.",
          variant: "destructive",
        });
        setLoading("initial");
        return;
      }

      const chargeToRefund = refundableCharges.find(
        (charge) => charge.status !== "REFUNDED"
      );

      if (!chargeToRefund) {
          toast({
          title: "Não foi possível solicitar o estorno",
          description: "Nenhuma cobrança ativa encontrada para reembolso.",
          variant: "destructive",
        });
        setLoading("initial");
        return;
      }

      if (chargeToRefund.billingType === "PIX") {
        setPaymentType("PIX");
        setChargeId(chargeToRefund.id);
        setInstallmentId(null);
      } else if (chargeToRefund.billingType === "CREDIT_CARD" || chargeToRefund.installment) {
        setPaymentType("CREDIT_CARD");
        setInstallmentId(chargeToRefund.installment);
        setChargeId(null);
      } else {
         toast({
          title: "Tipo de cobrança não suportado",
          description: `O tipo de cobrança (${String(chargeToRefund.billingType)}) não é suportado para reembolso automático.`,
          variant: "destructive",
        });
        setLoading("initial");
        return;
      }

      setFormDataToSubmit({
          description: data.description,
          refundType: data.refundType,
          value: data.value
      });

      if (refundableCharges.length > 1) {
         setOpenDialogPaymentDuplicate(true);
      } else {
         setOpenDialog(true);
      }

    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast({
        title: "Erro na operação",
        description: `Não foi possível preparar a solicitação do estorno. Tente novamente.`,
        variant: "destructive",
      });
    } finally {
      if (!openDialog && !openDialogPaymentDuplicate) {
         setLoading("initial"); 
      }
    }
  };

  const handleRequestRefund = async () => {
    if (!paymentType || (!chargeId && !installmentId) || !formDataToSubmit) {
       toast({
          title: "Erro interno",
          description: "Dados necessários para o reembolso estão faltando.",
          variant: "destructive",
        });
        setOpenDialog(false);
        setOpenDialogPaymentDuplicate(false);
        return;
    }

    try {
      toast({
        title: "Processando solicitação...",
      });

      setLoading("loading");

      const { value: formValue, description, refundType } = formDataToSubmit;
      
      const refundValueForApi = refundType === 'TOTAL' ? undefined : formValue;

      if (paymentType === "PIX" && chargeId) {
        await refundPix(chargeId, refundValueForApi, description);
      } else if (paymentType === "CREDIT_CARD" && installmentId) {
        await refundInstallment(installmentId, refundValueForApi, description);
      } else {
         throw new Error("Invalid payment type or missing ID for refund.");
      }

      toast({
        title: "Solicitação de Estorno efetuada com sucesso",
        variant: "success",
      });
      setOpenDialog(false);
      setOpenDialogPaymentDuplicate(false);
      setOpenSheet(false);
      router.replace(pathname);
      reset();
      setFormDataToSubmit(initialFormData);
      setPaymentType(null);
      setChargeId(null);
      setInstallmentId(null);

    } catch (error) {
      console.error("Error in handleRequestRefund:", error);
      toast({
        title: "Erro ao processar estorno",
        description: `${error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'}`,
        variant: "destructive",
      });
    } finally {
       setLoading("initial");
    }
  };

  return (
    <>
      <Sheet open={openSheet} onOpenChange={(isOpen) => {
        setOpenSheet(isOpen);
        if (!isOpen) {
            reset();
            setFormDataToSubmit(initialFormData);
            setPaymentType(null);
            setChargeId(null);
            setInstallmentId(null);
        }
      }}>
        <SheetTrigger
          asChild
          disabled={
            user.status !== "CONFIRMADA"
          }
        >
          <Button>Solicitar Reembolso</Button>
        </SheetTrigger>

        <SheetContent>
          <SheetHeader>
            <SheetTitle>Solicitar Reembolso</SheetTitle>
            <SheetDescription>
              Atenção! Esta é uma ação irreversível.
            </SheetDescription>
          </SheetHeader>
          <FormProvider {...createFormData}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-6 text-sm">
                <p className="leading-5">
                  Solicitações de reembolso em razão do exercício do direito de
                  arrependimento deverão ser efetuadas em até{" "}
                  <strong className="text-primary">7 (sete) dias</strong>{" "}
                  contados da data de compra do ingresso, desde que seja
                  realizada com antecedência mínima de 48 (quarenta e oito)
                  horas antes da realização do evento.
                </p>

                <div className="mt-6 flex flex-col gap-4">
                  <Fieldset
                    legend="Escolha como deseja o reembolso"
                    validationMessage={errors.refundType}
                  >
                    <Controller
                      name="refundType"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          defaultValue={refundTypeValue}
                          onValueChange={(value: string) => {
                            const typedValue = value as RefundType;
                            field.onChange(typedValue);
                            if (typedValue === 'TOTAL') {
                               setValue("value", undefined);
                            }
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="TOTAL" id="refund-total" />
                            <Label htmlFor="refund-total">
                              Reembolso Total
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="PARTIAL"
                              id="refund-partial"
                            />
                            <Label htmlFor="refund-partial">
                              Reembolso Parcial
                            </Label>
                          </div>
                        </RadioGroup>
                      )}
                    />
                  </Fieldset>

                  {refundTypeValue === "PARTIAL" && (
                    <Fieldset
                      legend="Informe o valor do reembolso parcial"
                      validationMessage={errors.value}
                      className="mt-4"
                    >
                      <Controller
                        control={control}
                        name="value"
                        render={({ field }) => (
                          <CurrencyInput
                            value={typeof field.value === 'number' ? field.value : 0}
                            onChangeValue={(_, value) => {
                              field.onChange(value); 
                            }}
                            InputElement={<Input placeholder="R$" />}
                          />
                        )}
                      />
                    </Fieldset>
                  )}
                </div>

                <Fieldset
                  legend="Informe o motivo do reembolso"
                  validationMessage={errors.description}
                  className="mt-4"
                >
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        className="h-24 max-h-48"
                        placeholder="Informe o motivo do reembolso"
                      />
                    )}
                  />
                </Fieldset>
              </div>
              <Button
                type="submit"
                loading={loading === "loading"}
                disabled={loading === "loading"}
                className="absolute bottom-0 right-0 mb-6 mr-6"
              >
                Solicitar
              </Button>
            </form>
          </FormProvider>
        </SheetContent>
      </Sheet>

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Reembolso</AlertDialogTitle>
            <AlertDialogDescription>
              Atenção! Esta é uma ação irreversível, tem certeza que deseja
              realizar um{" "}
              <strong>
                Estorno {formDataToSubmit.refundType === "PARTIAL" ? "Parcial" : "Total"}{" "}
                 ({paymentType === 'PIX' ? 'PIX' : 'Cartão'})
              </strong>{" "}
              à {user.nome}{" "}
              {formDataToSubmit.refundType === "PARTIAL" && formDataToSubmit.value && "no valor de " + reais(formDataToSubmit.value)}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading === 'loading'}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRequestRefund} disabled={loading === 'loading'}>
              {loading === 'loading' ? 'Confirmando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={openDialogPaymentDuplicate}
        onOpenChange={setOpenDialogPaymentDuplicate}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Atenção - Possível cobrança duplicada
            </AlertDialogTitle>
            <AlertDialogDescription>
              Encontramos mais de uma cobrança ativa para este cliente. Se prosseguir,
              o reembolso será feito na primeira cobrança encontrada ({paymentType === 'PIX' ? 'PIX ID: ' + chargeId : 'Cartão ID: ' + installmentId}).
              Confirme se deseja continuar com esta cobrança.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading === 'loading'}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setOpenDialog(true);
                setOpenDialogPaymentDuplicate(false);
              }}
              disabled={loading === 'loading'}
            >
              Continuar com esta Cobrança
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
