"use client";

import CopyToClipboard from "react-copy-to-clipboard";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { FaWhatsapp } from "react-icons/fa6";
import { Clock, Copy, Link } from "lucide-react";
import { useEffect, useState } from "react";
import { countdownPayment } from "@/lib/utils/countdownPayment";
import { addMinutes } from "date-fns";
import { useFormStore } from "./participante/useFormStore";

export type PixChargeAsaasProps = {
  brCode: string;
  charge: {
    brCode: string;
    id: string;
  } | null;
  // countdown: string | null;
  isCopiedQrCode: boolean;
  isCopiedPixToPay: boolean;
  handleCopyQrCode: (e: unknown) => Promise<void>;
  handleSendPixToPay: (e: unknown) => Promise<void>;
  paymentStatus: "Pendente" | "Pago";
  codeQrCode?: string;
  paymentLinkUrl?: string;
};

export const PixChargeAsaas = ({
  brCode,
  isCopiedQrCode,
  isCopiedPixToPay,
  handleCopyQrCode,
  handleSendPixToPay,
  paymentStatus,
  codeQrCode,
  paymentLinkUrl,
}: PixChargeAsaasProps) => {
  const { eventRegister } = useFormStore();

  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    // Define a data de expiração como 15 minutos a partir do momento atual
    const expirationTime = addMinutes(new Date(), 15);

    const interval = setInterval(() => {
      if (expirationTime) {
        setCountdown(countdownPayment(expirationTime));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-md bg-background px-8 py-6">
      <Input
        disabled
        className="bg-card text-center"
        value={`"Inscrição TOP #${eventRegister?.topNumero} Vale da Onça"`}
      />
      <img
        className="my-4 flex max-w-min items-center justify-center rounded-md border border-input p-2 shadow-md"
        width={220}
        height={220}
        src={`data:image/png;base64,${brCode}`}
      />
      <div className="flex w-full flex-col gap-3 sm:w-1/2">
        <CopyToClipboard text={codeQrCode ?? ""}>
          <Button
            type="button"
            variant="outline"
            name="codeQrCode"
            onClick={handleCopyQrCode}
            className="cursor-pointer shadow-lg"
          >
            <Copy size={20} className="mr-2" />
            {!isCopiedQrCode ? "Copiar QR Code" : "Copiado!"}
          </Button>
        </CopyToClipboard>

        <Button type="button" onClick={handleSendPixToPay}>
          {!isCopiedPixToPay ? (
            <span className="flex items-center gap-2">
              <FaWhatsapp size={20} />
              Enviar QRcode
            </span>
          ) : (
            "Enviando..."
          )}
        </Button>

        <Button type="button" variant="blue" asChild>
          <a
            href={paymentLinkUrl}
            target="_blank"
            className="flex items-center gap-1"
          >
            <Link size={20} />
            Abrir Link
          </a>
        </Button>
      </div>
      <div className="mt-6 flex flex-col items-center justify-center gap-6 text-center">
        <div className="flex flex-col gap-1">
          <h2 className="font-medium text-primary">Prazo de Pagamento</h2>
          <p className="flex items-center justify-center gap-2">
            <Clock size={18} />
            {countdown}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="font-medium text-primary">Status</h2>
          {paymentStatus === "Pendente" ? (
            <p className="w-fit rounded-full bg-destructive/5 px-3 py-1 text-base font-medium text-destructive">
              Pendente
            </p>
          ) : (
            <p className="w-fit rounded-full bg-success/5 px-3 py-1 text-base font-medium text-success">
              Pago
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-medium text-primary">Destinatário</p>
          <p className="">ITOP - Inscrições TOP</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-1 text-center">
        <h2 className="text-xs font-medium text-primary">Entre em contato</h2>
        <p className="text-xs">
          Pagamento Seguro e Criptografado pela <b>Asaas</b>
        </p>
      </div>
    </div>
  );
};
