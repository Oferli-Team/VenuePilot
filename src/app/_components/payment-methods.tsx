"use client";

import React from "react";
import { AlertCircle, Clock, ScanBarcode } from "lucide-react";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { PaymentDetail } from "./payment-detail";
import { CreditCard } from "./credit-card/credit-card-new";
import { cn } from "@/lib/utils";
import { usePixChargeStore } from "@/lib/store/PixChargeStore";
import { useCalcValueTopStore } from "@/lib/store/CalcValueTopStore";

type PaymentMethodsProps = {
  className?: string;
};

export const PaymentMethods = ({ className }: PaymentMethodsProps) => {
  const { charge, setOpenChargePixModal } = usePixChargeStore();
  const { paymentIsLoading, method } = useCalcValueTopStore();

  return (
    <div className={cn("space-y-6", className)}>
      {method === "pix" && (
        <div className="space-y-4 rounded-md border bg-card p-4">
          <Alert variant="default" className="bg-blue-300/50">
            <Clock className="h-4 w-4" />
            <AlertTitle>Aprovação imediata</AlertTitle>
            <AlertDescription>
              O pagamento com Pix leva pouco tempo para ser processado.
            </AlertDescription>
          </Alert>

          <Alert variant="default" className="bg-green-300/50">
            <ScanBarcode className="h-4 w-4" />
            <AlertTitle>Finalize sua compra com facilidade</AlertTitle>
            <AlertDescription>
              É só acessar a área PIX no aplicativo do seu banco e escanear o QR
              code ou digitar o código
            </AlertDescription>
          </Alert>

          <PaymentDetail />

          {!charge && (
            <Button
              size="lg"
              className="mt-4 w-full text-base font-semibold"
              type="submit"
              loading={paymentIsLoading}
              autoFocus={false}
            >
              Gerar Cobrança Pix
            </Button>
          )}

          {charge && (
            <Button
              type="button"
              className="mt-4 w-full text-base font-semibold"
              onClick={() => setOpenChargePixModal(true)}
              autoFocus={false}
            >
              Visualizar Cobrança Pix
            </Button>
          )}
        </div>
      )}

      {method === "creditCard" && <CreditCard />}

      {method === "free" && (
        <div className="flex w-full flex-col justify-center gap-12 rounded-md border bg-card p-4">
          <div>
            <h5 className="font-bold">Inscrição Gratuita</h5>
            <p>Cupom 100% off aplicado, clique para conlcuir sua inscrição</p>
          </div>

          <Button
            loading={paymentIsLoading}
            type="submit"
            size="lg"
            autoFocus={false}
          >
            Concluir Inscrição
          </Button>
        </div>
      )}

      {method !== "free" && (
        <Alert variant="outline" autoFocus={false}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>ATENÇÃO</AlertTitle>
          <AlertDescription>
            Sua vaga no evento só será confirmada após a realização do
            pagamento. O não pagamento no prazo informado implicará no
            cancelamento automático da inscrição.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
